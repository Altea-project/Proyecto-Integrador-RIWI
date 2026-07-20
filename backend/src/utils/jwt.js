
// jwt.js
// Funciones para crear y verificar los tokens (JWT).
// Solo aca se usa la librería jsonwebtoken; el resto del código pasa por aca.

const jwt = require('jsonwebtoken');

// Variables de entorno (ver .env.example):
// JWT_SECRET -> clave para firmar el token, no se sube a Git.
// JWT_EXPIRES_IN -> cuánto dura el token (ej: "8h").
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '8h';

// Si no está el secreto prefiero que el server ni arranque, antes que
// firmar tokens con un secreto vacío.
if (!JWT_SECRET) {
    throw new Error('JWT_SECRET no está definido en las variables de entorno');
}

// Crea un token firmado para un usuario ya logueado.
// En el payload va solo lo mínimo (id y rol). Nunca meto el password ni datos
// sensibles: el JWT se puede leer, solo que no se puede alterar.
function generateToken(user) {
    const payload = {
        id: user.id,
        roleId: user.role_id,
        roleName: user.role_name,
    };

    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

// Verifica la firma del token y que no esté vencido.
// Si está bien devuelve el payload; si está alterado o vencido, jsonwebtoken
// tira el error solo, así que no pongo try/catch aca: lo atrapa verifyToken.js.
function verifyJwt(token) {
    return jwt.verify(token, JWT_SECRET);
}

module.exports = { generateToken, verifyJwt };