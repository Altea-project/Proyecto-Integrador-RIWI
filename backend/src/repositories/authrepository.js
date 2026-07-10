

// ============================================================
// authrepository.js
// este archivo contiene la Capa de acceso a datos para autenticación.
// Responsabilidad única: ejecutar queries SQL contra la tabla "users".
// No contiene lógica de negocio (eso vive en authservice.js) ni
// maneja req/res (eso vive en authcontroller.js).
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

module.exports = { findUserByEmail };