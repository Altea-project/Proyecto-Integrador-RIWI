// ============================================================
// authRepository.js
// este archivo contiene la Capa de acceso a datos para autenticación.
// Responsabilidad única: ejecutar queries SQL contra la tabla "users".
// No contiene lógica de negocio (eso vive en authService.js) ni
// maneja req/res (eso vive en authController.js / userController.js).
// ============================================================

const pool = require("../config/db"); // Conexión a Supabase/PostgreSQL ya configurada.

/**
 * Busca un usuario por su correo electrónico.
 *
 * Se seleccionan explícitamente solo las columnas necesarias para el
 * login (en vez de "SELECT *") por dos razones:
 * 1. No traer columnas irrelevantes para este flujo (ej. avatar_url).
 * 2. Que quede explícito y fácil de auditar qué datos sensibles
 *    (como password_hash) está tocando esta query.
 *
 * @param {string} email - Correo ingresado en el formulario de login.
 * @returns {Promise<Object|undefined>} El usuario encontrado, o undefined
 *   si no existe ningún usuario con ese correo.
 */
async function findUserByEmail(email) {
  // JOIN con roles para traer el nombre del rol (ej. "admin"), no solo su ID.
  // Esto permite que el JWT lleve roleName y la autorización se haga por
  // nombre en vez de por ID hardcodeado (más robusto ante reordenamientos
  // del seed o diferencias entre entornos).
    const { rows } = await pool.query(
    `SELECT u.id, u.name, u.email, u.password_hash, u.role_id, u.must_change_password, r.name as role_name
        FROM users u
        JOIN roles r ON u.role_id = r.id
        WHERE u.email = $1`,
    [email],
    );

  // rows[0] es undefined si no hay coincidencias; el service decide
  // qué hacer con eso (lanzar InvalidCredentialsError).
    return rows[0];
}

/**
 * Busca un usuario por su id.
 * Se usa para reconstruir la sesión a partir del token (GET /me):
 * el token trae el id del usuario, y con esta función confirmamos
 * quién es y traemos su estado actual (incluyendo must_change_password,
 * que puede haber cambiado desde que se generó el token).
 *
 * @param {number} id - Id del usuario (viene de req.user.id, del token).
 * @returns {Promise<Object|undefined>} El usuario encontrado, o undefined si no existe.
 */
async function findUserById(id) {
    const { rows } = await pool.query(
    `SELECT u.id, u.name, u.email, u.role_id, u.must_change_password, r.name as role_name
        FROM users u
        JOIN roles r ON u.role_id = r.id
        WHERE u.id = $1`,
    [id],
    );
    return rows[0];
}

/**
 * Busca un usuario por su número de documento.
 * Se usa en el registro (HU-01) para validar que no exista ya un
 * usuario con ese documento antes de crear uno nuevo.
 *
 * @param {string} document - Documento a buscar.
 * @returns {Promise<Object|undefined>} { id } si existe, undefined si no.
 */
async function findUserByDocument(document) {
    const { rows } = await pool.query(
    `SELECT id FROM users WHERE document = $1`,
    [document],
    );
    return rows[0];
}

/**
 * Busca un rol por su nombre (ej. "admin", "instructor", "coder", "recruiter").
 * Se usa en el registro (HU-01) para validar que el rol enviado en el
 * body exista y para obtener su id antes de crear el usuario.
 *
 * @param {string} name - Nombre del rol.
 * @returns {Promise<Object|undefined>} { id, name } si existe, undefined si no.
 */
async function findRoleByName(name) {
    const { rows } = await pool.query(
    `SELECT id, name FROM roles WHERE name = $1`,
    [name],
    );
    return rows[0];
}

/**
 * Inserta un nuevo usuario en la tabla "users".
 * must_change_password siempre se crea en true, ya que el usuario
 * recibe una contraseña temporal generada por el service y debe
 * cambiarla en su primer login (ver HU-01, T4).
 *
 * @param {Object} user - Datos del usuario a crear.
 * @param {string} user.name
 * @param {string} user.email
 * @param {string} user.passwordHash - Hash bcrypt de la contraseña temporal.
 * @param {string} [user.phone]
 * @param {string} [user.document]
 * @param {string} [user.company]
 * @param {number} user.roleId
 * @returns {Promise<Object>} El usuario recién creado (sin password_hash).
 */
async function createUser(user) {
    const { rows } = await pool.query(
    `INSERT INTO users (name, email, password_hash, phone, document, company, role_id, must_change_password)
        VALUES ($1, $2, $3, $4, $5, $6, $7, true)
        RETURNING id, name, email, phone, document, company, role_id, must_change_password, created_at`,
    [
        user.name,
        user.email,
        user.passwordHash,
        user.phone || null,
        user.document || null,
        user.company || null,
        user.roleId,
    ],
    );
    return rows[0];
}

/**
 * Busca el perfil completo de un usuario por su id, incluyendo los
 * campos propios de un coder (availability_status, avatar_url, tl_id)
 * y el nombre de su TL (si tiene uno asignado).
 * Se usa en GET /users/me (T2) para que el propio usuario autenticado
 * pueda ver su estado de disponibilidad (badge del dashboard, CA-01),
 * el cual es de solo lectura desde este endpoint (CA-03: no existe
 * ningún endpoint que permita al coder modificar su propio estado).
 *
 * Se hace LEFT JOIN con users (alias tl) porque tl_id puede ser NULL
 * (un coder recién creado puede no tener TL asignado todavía).
 *
 * @param {number} id - Id del usuario autenticado (viene de req.user.id).
 * @returns {Promise<Object|undefined>} El perfil encontrado, o undefined si no existe.
 */
async function findUserProfileById(id) {
    const { rows } = await pool.query(
    `SELECT u.id, u.name, u.email, u.phone, u.document, u.company,
            u.role_id, r.name AS role_name,
            u.tl_id, tl.name AS tl_name,
            u.avatar_url, u.availability_status,
            u.status_changed_at, u.must_change_password,
            u.created_at, u.updated_at
        FROM users u
        JOIN roles r ON u.role_id = r.id
        LEFT JOIN users tl ON u.tl_id = tl.id
        WHERE u.id = $1`,
    [id],
    );
    return rows[0];
}

/**
 * Lista todos los usuarios (para el dashboard de admin, GET /users).
 * Trae el nombre del rol (JOIN roles) y, si tiene, el nombre de su TL.
 * Se hace LEFT JOIN con users (alias tl) porque tl_id puede ser NULL.
 *
 * Nota: authService.getAllUsers mapea estas columnas al shape público
 * (camelCase) que espera el frontend, por eso se traen exactamente
 * name, email, phone, document, company, role_name, tl_name, etc.
 *
 * @returns {Promise<Object[]>} Lista de todos los usuarios.
 */
async function findAllUsers() {
    const { rows } = await pool.query(
    `SELECT u.id, u.name, u.email, u.phone, u.document, u.company,
            u.role_id, r.name AS role_name,
            u.tl_id, tl.name AS tl_name,
            u.must_change_password, u.created_at
        FROM users u
        JOIN roles r ON u.role_id = r.id
        LEFT JOIN users tl ON u.tl_id = tl.id
        ORDER BY u.id`,
    );
    return rows;
}

/**
 * Trae el rol y el tl_id de un usuario. Se usa en el cambio de estado
 * (HU-11) para validar el permiso: admin, o el instructor que es su TL.
 *
 * @param {number} id
 * @returns {Promise<Object|undefined>} { id, role_id, role_name, tl_id, availability_status } o undefined.
 */
async function findUserRoleAndTl(id) {
    const { rows } = await pool.query(
    `SELECT u.id, u.role_id, r.name AS role_name, u.tl_id, u.availability_status
        FROM users u
        JOIN roles r ON u.role_id = r.id
        WHERE u.id = $1`,
    [id],
    );
    return rows[0];
}

/**
 * (HU-11 T1 + T2) Cambia el availability_status de un usuario y registra
 * la auditoria (status_changed_by y status_changed_at) en el mismo UPDATE.
 *
 * @param {number} userId - Usuario cuyo estado cambia.
 * @param {string} status - Nuevo estado.
 * @param {number} changedById - Id de quien hace el cambio (admin o TL).
 * @returns {Promise<Object>} El usuario con su nuevo estado y la auditoria.
 */
async function updateAvailabilityStatus(userId, status, changedById) {
    const { rows } = await pool.query(
    `UPDATE users
        SET availability_status = $1,
            status_changed_by = $2,
            status_changed_at = now(),
            updated_at = now()
        WHERE id = $3
        RETURNING id, name, availability_status, status_changed_by, status_changed_at`,
    [status, changedById, userId],
    );
    return rows[0];
}

/**
 * (assign-tl, issue #66) Guarda la asignacion de TL: actualiza el campo
 * tl_id del usuario. Se habia perdido en un merge, lo que rompia el
 * endpoint PATCH /users/:id/assign-tl (updateUserTl is not a function).
 */
async function updateUserTl(userId, tlId) {
    const { rows } = await pool.query(
    `UPDATE users
        SET tl_id = $1, updated_at = now()
        WHERE id = $2
        RETURNING id, name, email, role_id, tl_id`,
    [tlId, userId],
    );
    return rows[0];
}

/**
 * Busca un usuario por su id, incluyendo el nombre del rol (JOIN roles).
 * Se usa para validar que el usuario a editar/eliminar exista y para
 * devolver su perfil público actualizado tras un UPDATE.
 *
 * @param {number} id - Id del usuario.
 * @returns {Promise<Object|undefined>} El usuario encontrado, o undefined si no existe.
 */
async function findUserByIdFull(id) {
    const { rows } = await pool.query(
    `SELECT u.id, u.name, u.email, u.phone, u.document, u.company,
            u.role_id, r.name AS role_name, u.tl_id,
            u.must_change_password, u.created_at, u.updated_at
        FROM users u
        JOIN roles r ON u.role_id = r.id
        WHERE u.id = $1`,
    [id],
    );
    return rows[0];
}

/**
 * Actualiza los campos editables de un usuario (HU-01: edición por admin).
 * Solo se actualizan las columnas permitidas; password, id, created_at,
 * must_change_password y los campos de auditoría de disponibilidad no se
 * tocan. company solo se guarda con sentido cuando el rol es "recruiter"
 * (ver authService.updateUser); para cualquier otro rol se fuerza a null.
 *
 * @param {number} id - Id del usuario a actualizar.
 * @param {Object} data - Campos a actualizar: { name, email, phone, document, company, roleId }.
 * @returns {Promise<Object>} El usuario actualizado (mismo shape que findUserByIdFull).
 */
async function updateUserRepository(id, data) {
    const { rows } = await pool.query(
    `UPDATE users
        SET name = $1,
            email = $2,
            phone = COALESCE($3, NULL),
            document = COALESCE($4, NULL),
            company = COALESCE($5, NULL),
            role_id = $6,
            updated_at = now()
        WHERE id = $7
        RETURNING id, name, email, phone, document, company, role_id, must_change_password, created_at, updated_at`,
    [
        data.name,
        data.email,
        data.phone,
        data.document,
        data.company,
        data.roleId,
        id,
    ],
    );
    return rows[0];
}

/**
 * Elimina un usuario por su id (solo admin). La FK de projects usa
 * ON DELETE CASCADE, así que los proyectos del usuario se eliminan
 * automáticamente junto con él.
 *
 * @param {number} id - Id del usuario a eliminar.
 * @returns {Promise<number>} Cantidad de filas eliminadas (0 si no existía).
 */
async function deleteUserRepository(id) {
    const { rowCount } = await pool.query(
    `DELETE FROM users WHERE id = $1`,
    [id],
    );
    return rowCount;
}

module.exports = {
    findUserByEmail,
    findUserByDocument,
    findRoleByName,
    createUser,
    findUserById,
    findUserProfileById,
    findAllUsers,
    findUserRoleAndTl,
    updateAvailabilityStatus,
    updateUserTl,
    findUserByIdFull,
    updateUserRepository,
    deleteUserRepository,
};