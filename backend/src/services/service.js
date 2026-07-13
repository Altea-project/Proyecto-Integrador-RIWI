

// ============================================================
// service.js
// Lógica de negocio del login (HU-00).
// Esta capa NO conoce req/res (responsabilidad del controller) ni
// ejecuta queries SQL directas (responsabilidad del repository).
// Orquesta: pedir el usuario al repository, validar la contraseña,
// y generar el token si todo es correcto.
// ============================================================

const bcrypt = require('bcrypt');
const { 
  findUserByEmail, 
  findRoleByName, 
  findUserByDocument,  
  createUser } = require('../repositories/repository');
const { generateToken } = require('../utils/jwt');

/**
 * Error de dominio para credenciales inválidas.
 * Se define como clase propia (en vez de un Error genérico) para que
 * el controller pueda distinguirlo de errores inesperados (ej. caída
 * de la base de datos) usando "instanceof", y responder 401 en vez
 * de 500.
 */
class InvalidCredentialsError extends Error {}

class RoleNotFoundError extends Error {} // Error de dominio para rol no encontrado (ej. al crear un usuario con un rol inválido).
class EmailAlreadyExistsError extends Error {} // Error de dominio para email ya registrado (ej. al crear un usuario con un email que ya existe).
class DocumentAlreadyExistsError extends Error {} // Error de dominio para documento ya registrado (ej. al crear un usuario con un documento que ya existe).


//funcion para generar una contraseña temporal aleatoria
const crypto = require('crypto'); // usa la libreria crypto de node para generar una contraseña aleatoria segura
function generateTempPassword(length = 10) {
    const alphabet = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    const bytes = crypto.randomBytes(length);
    let password = '';
    for (let i = 0; i < length; i++) {
        password += alphabet[bytes[i] % alphabet.length];
    }
    return password;
}

// ahora se crea la funcion para registrar un usuario
async function registerUser({ name, email, role, phone, document, company }) {
    const roleRecord = await findRoleByName(role);
    if (!roleRecord) {
        throw new RoleNotFoundError(`El rol "${role}" no existe`);
    }

    const existingByEmail = await findUserByEmail(email);
    if (existingByEmail) {
        throw new EmailAlreadyExistsError('Ya existe un usuario registrado con ese correo');
    }

    if (document) {
        const existingByDocument = await findUserByDocument(document);
        if (existingByDocument) {
            throw new DocumentAlreadyExistsError('Ya existe un usuario registrado con ese documento');
        }
    }

    const tempPassword = generateTempPassword();
    const passwordHash = await bcrypt.hash(tempPassword, 10);

    const newUser = await createUser({
        name, email, passwordHash, phone, document, company, roleId: roleRecord.id,
    });

    return {
        user: {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            phone: newUser.phone,
            document: newUser.document,
            company: newUser.company,
            roleId: newUser.role_id,
            roleName: roleRecord.name,
            mustChangePassword: newUser.must_change_password,
        },
        tempPassword,
    };
}


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
        },
    mustChangePassword: user.must_change_password,
    };
}

module.exports = {
    login,
    registerUser,
    InvalidCredentialsError,
    RoleNotFoundError,
    EmailAlreadyExistsError,
    DocumentAlreadyExistsError,
};