

// ============================================================
// repository.js
// Capa de acceso a datos para autenticación.
// Responsabilidad única: ejecutar queries SQL contra la tabla "users".
// No contiene lógica de negocio (eso vive en service.js) ni
// maneja req/res (eso vive en controller.js).
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
    const { rows } = await pool.query(
        `SELECT id, name, email, password_hash, role_id, must_change_password
        FROM users
        WHERE email = $1`,
        [email]
    );

// rows[0] es undefined si no hay coincidencias; el service decide
// qué hacer con eso (lanzar InvalidCredentialsError).
    return rows[0];
}

async function findUserByDocument(document) {
    const { rows } = await pool.query(
        `SELECT id FROM users WHERE document = $1`,
        [document]
    );
    return rows[0];
}

async function findRoleByName(name) {
    const { rows } = await pool.query(
        `SELECT id, name FROM roles WHERE name = $1`,
        [name]
    );
    return rows[0];
}

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

module.exports = {
    findUserByEmail,
    findUserByDocument,
    findRoleByName,
    createUser,
};