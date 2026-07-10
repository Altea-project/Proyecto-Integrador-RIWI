

// ============================================================
// service.js
// Lógica de negocio del login (HU-00).
// Esta capa NO conoce req/res (responsabilidad del controller) ni
// ejecuta queries SQL directas (responsabilidad del repository).
// Orquesta: pedir el usuario al repository, validar la contraseña,
// y generar el token si todo es correcto.
// ============================================================

const bcrypt = require('bcrypt');
const { findUserByEmail } = require('../repositories/authrepository');
const { generateToken } = require('../utils/jwt');

/**
 * Error de dominio para credenciales inválidas.
 * Se define como clase propia (en vez de un Error genérico) para que
 * el controller pueda distinguirlo de errores inesperados (ej. caída
 * de la base de datos) usando "instanceof", y responder 401 en vez
 * de 500.
 */
class InvalidCredentialsError extends Error {}

/**
 * Ejecuta el flujo completo de login: valida credenciales y arma
 * la respuesta que se enviará al cliente si son correctas.
 *
 * CA-02: si el correo y la contraseña son correctos, genera el token.
 * CA-03: si el correo no existe O la contraseña no coincide, lanza el
 *        mismo error genérico en ambos casos — así el cliente nunca
 *        puede deducir si el correo está registrado o no (esto evita
 *        que alguien use el login para "adivinar" qué correos existen).
 * CA-04: incluye mustChangePassword en el resultado para que el
 *        frontend sepa si debe redirigir a la pantalla de cambio
 *        de contraseña obligatorio (ver HU-01, CA-03).
 *
 * @param {string} email - Correo ingresado por el usuario.
 * @param {string} password - Contraseña en texto plano ingresada por el usuario
 *   (se compara contra el hash guardado, nunca se guarda en texto plano).
 * @returns {Promise<Object>} Objeto con token, datos públicos del usuario,
 *   y el flag mustChangePassword.
 * @throws {InvalidCredentialsError} Si el correo no existe o la contraseña no coincide.
 */
async function login(email, password) {
    const user = await findUserByEmail(email);

    if (!user) {
    throw new InvalidCredentialsError('Correo o contraseña incorrectos');
    }

  // bcrypt.compare hashea "password" internamente con el mismo salt
  // que se usó al crear el hash guardado, y compara el resultado.
  // Nunca se desencripta password_hash (bcrypt no es reversible).
    const passwordMatches = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatches) {
    throw new InvalidCredentialsError('Correo o contraseña incorrectos');
    }

    const token = generateToken(user);

  // Se retorna solo un subconjunto "seguro" del usuario -- nunca
  // password_hash, aunque ya no se necesite en este punto.
    return {
        token,
        user: {
        id: user.id,
        name: user.name,
        email: user.email,
        roleId: user.role_id,
        roleName: user.role_name,
        },
    mustChangePassword: user.must_change_password,
    };
}

module.exports = { login, InvalidCredentialsError };