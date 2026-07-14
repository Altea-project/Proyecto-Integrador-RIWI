

// ============================================================
// authRepository.js
// este archivo contiene la Capa de acceso a datos para autenticación.
// Responsabilidad única: ejecutar queries SQL contra la tabla "users".
// No contiene lógica de negocio (eso vive en authService.js) ni
// maneja req/res (eso vive en authController.js / userController.js).
// ============================================================

const pool = require('../config/db'); // Conexión a Supabase/PostgreSQL ya configurada.

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
        [email]
    );

// rows[0] es undefined si no hay coincidencias; el service decide
// qué hacer con eso (lanzar InvalidCredentialsError).
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
        [document]
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
        [name]
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
        ]
    );
    return rows[0];
}

/**
 * Busca un usuario por su id, trayendo tambien el nombre de su rol.
 * Se usa en la asignacion de TL (HU-01): para confirmar que el usuario
 * al que se le asigna exista, y para validar que el TL destino tenga
 * rol "instructor" (revisando su role_name).
 *
 * @param {number} id - Id del usuario.
 * @returns {Promise<Object|undefined>} { id, name, email, role_id, tl_id, role_name } o undefined.
 */
async function findUserById(id) {
    const { rows } = await pool.query(
        `SELECT u.id, u.name, u.email, u.role_id, u.tl_id, r.name AS role_name
         FROM users u
         JOIN roles r ON u.role_id = r.id
         WHERE u.id = $1`,
        [id]
    );
    return rows[0];
}

/**
 * (T2 - issue #66) Guarda la asignacion de TL: actualiza el campo tl_id
 * del usuario en la tabla "users".
 *
 * @param {number} userId - Id del usuario (coder) al que se le asigna el TL.
 * @param {number} tlId - Id del instructor que sera su TL.
 * @returns {Promise<Object>} El usuario actualizado.
 */
async function updateUserTl(userId, tlId) {
    const { rows } = await pool.query(
        `UPDATE users
         SET tl_id = $1, updated_at = now()
         WHERE id = $2
         RETURNING id, name, email, role_id, tl_id`,
        [tlId, userId]
    );
    return rows[0];
}

module.exports = { findUserByEmail, findUserByDocument, findRoleByName, createUser, findUserById, updateUserTl };