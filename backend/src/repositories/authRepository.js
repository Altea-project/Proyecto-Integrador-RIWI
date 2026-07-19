
// Capa de acceso a datos de autenticación. Lo único que hace: ejecutar queries SQL contra la tabla "users". 
// La lógica va en authService.js y el manejo de req/res en los controllers.

const pool = require("../config/db"); // Conexión a Supabase/PostgreSQL ya configurada.

/*
Busca un usuario por su email.
Traigo solo las columnas que necesita el login (no uso SELECT *) para no cargar datos de más y para que se vea claro qué campos sensibles toco.
 */
async function findUserByEmail(email) {
  // JOIN con roles para traer el nombre del rol (ej: "admin") y no solo el id.
  // Así el JWT lleva roleName y la autorización se hace por nombre, que es más robusto que hardcodear ids.
    const { rows } = await pool.query(
    `SELECT u.id, u.name, u.email, u.password_hash, u.role_id, u.must_change_password, r.name as role_name
        FROM users u
        JOIN roles r ON u.role_id = r.id
        WHERE u.email = $1`,
    [email],
    );

  // Si no hay coincidencias, rows[0] es undefined; el service decide qué hacer.
    return rows[0];
}

// Busca un usuario por id. La uso para recuperar la sesión desde el token
// (GET /me): el token trae el id y con esto confirmo quién es y traigo su
// estado actual (incluido must_change_password, que puede haber cambiado).

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

// Busca un usuario por documento. La uso en el registro (HU-01) para
// chequear que no exista ya alguien con ese documento.

async function findUserByDocument(document) {
    const { rows } = await pool.query(
    `SELECT id FROM users WHERE document = $1`,
    [document],
    );
    return rows[0];
}

// Busca un rol por nombre (admin, instructor, coder, recruiter). La uso en el
// registro para validar que el rol exista y traer su id.

async function findRoleByName(name) {
    const { rows } = await pool.query(
    `SELECT id, name FROM roles WHERE name = $1`,
    [name],
    );
    return rows[0];
}

/*
Inserta un usuario nuevo. 
must_change_password siempre entra en true porque el usuario recibe una contraseña temporal y tiene que cambiarla en el primer login (HU-01, T4).
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
 * 
Trae el perfil completo de un usuario, con los campos del coder (availability_status, avatar_url, tl_id) y el nombre de su TL.
La uso en GET /users/me para pintar el badge del dashboard.
Hago LEFT JOIN con users (alias tl) porque tl_id puede ser NULL (un coder recién creado todavía no tiene TL)
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

// Lista todos los usuarios (dashboard del admin, GET /users). 
// Trae el nombre del rol y, si tiene, el de su TL (LEFT JOIN porque tl_id puede ser NULL).
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

// Trae el rol y el tl_id de un usuario. La uso en el cambio de estado (HU-11)
// para validar el permiso: admin, o el instructor que es su TL.
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

// Cambia el availability_status de un usuario y guarda la auditoría
// (quién lo cambió y cuándo) en el mismo UPDATE - HU-11.
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

// Guarda la asignación de TL: actualiza tl_id del usuario (HU-02).

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

// Busca un usuario por id con el nombre del rol. La uso para validar que el
// usuario a editar/eliminar exista y para devolver su perfil tras el UPDATE.
async function findUserByIdFull(id) {
    const { rows } = await pool.query(
    `SELECT u.id, u.name, u.email, u.phone, u.document, u.company,
            u.role_id, r.name AS role_name, u.must_change_password,
            u.created_at, u.updated_at
        FROM users u
        JOIN roles r ON u.role_id = r.id
        WHERE u.id = $1`,
    [id],
    );
    return rows[0];
}

// Actualiza los campos editables de un usuario (edición por admin, HU-01).
// No toco password, id, created_at ni la auditoría de disponibilidad.
// company solo tiene sentido para reclutador (eso lo decide el service).
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

// Elimina un usuario por id (solo admin). La FK de projects tiene ON DELETE
// CASCADE, así que sus proyectos se borran solos junto con él.
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