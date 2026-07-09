

// ============================================================
// jwt.js
// Utilidades para generar y verificar JSON Web Tokens (JWT).
// Esta es la única capa del proyecto que sabe firmar/decodificar
// tokens; el resto del código nunca debe llamar a la librería
// "jsonwebtoken" directamente, siempre pasa por aquí.
// ============================================================

const jwt = require('jsonwebtoken');

// Variables de entorno requeridas (ver .env.example):
// JWT_SECRET      -> clave secreta usada para firmar el token. Nunca se sube a Git.
// JWT_EXPIRES_IN  -> tiempo de vida del token (ej: "8h", "1d").
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '8h';

// Si falta la variable de entorno, preferimos que el servidor no arranque
// (fallar rápido) en vez de firmar tokens con un secreto vacío/inseguro.
if (!JWT_SECRET) {
    throw new Error('JWT_SECRET no está definido en las variables de entorno');
}

/**
 * Genera un JWT firmado para un usuario ya autenticado.
 *
 * El payload es intencionalmente mínimo: solo lo necesario para
 * autorización (identificar quién es y qué rol tiene). NUNCA debe
 * incluirse password_hash ni otros datos sensibles dentro del token,
 * porque el contenido de un JWT no está cifrado, solo firmado
 * (cualquiera puede decodificarlo y leerlo, aunque no pueda alterarlo).
 *
 * @param {Object} user - Usuario retornado por la base de datos.
 * @param {number} user.id - ID del usuario.
 * @param {number} user.role_id - ID del rol del usuario (admin, instructor, coder, recruiter).
 * @returns {string} Token JWT firmado, listo para enviar al cliente.
 */
function generateToken(user) {
    const payload = {
        id: user.id,
        roleId: user.role_id,
    };

    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/** 
 * Verifica la firma de un JWT y valida que no haya expirado.
 *
 * Si el token es válido, retorna el payload original (con id y roleId).
 * Si el token fue alterado, tiene una firma inválida, o ya expiró,
 * la librería "jsonwebtoken" lanza un error automáticamente — por eso
 * esta función no hace try/catch: quien la llama (verifyToken.js)
 * es responsable de capturar ese error y responder 401.
 *
 * @param {string} token - Token JWT recibido del cliente (sin el prefijo "Bearer ").
 * @returns {Object} Payload decodificado: { id, roleId, iat, exp }.
 * @throws {jwt.JsonWebTokenError | jwt.TokenExpiredError} Si el token es inválido o expiró.
 */
function verifyJwt(token) {
    return jwt.verify(token, JWT_SECRET);
}

module.exports = { generateToken, verifyJwt };