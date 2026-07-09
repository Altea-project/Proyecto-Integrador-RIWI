

// ============================================================
// authRepository.js
// Capa de acceso a datos para autenticación.
// Responsabilidad única: ejecutar queries SQL contra la tabla "users".
// No contiene lógica de negocio (eso vive en authService.js) ni
// maneja req/res (eso vive en authController.js).
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

module.exports = { findUserByEmail };