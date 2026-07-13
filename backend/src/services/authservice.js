

// ============================================================
// service.js
// Lógica de negocio del login (HU-00).
// Esta capa NO conoce req/res (responsabilidad del controller) ni
// ejecuta queries SQL directas (responsabilidad del repository).
// Orquesta: pedir el usuario al repository, validar la contraseña,
// y generar el token si todo es correcto.
// ============================================================

const bcrypt = require('bcrypt');
const crypto = require('crypto'); // usa la librería crypto de node para generar una contraseña temporal aleatoria segura
const {
    findUserByEmail,
    findUserByDocument,
    findRoleByName,
    createUser,
} = require('../repositories/authrepository');
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

/**
 * Genera una contraseña temporal aleatoria y legible (evita caracteres
 * ambiguos como 0/O o l/1) para asignarla a un usuario recién creado
 * por un admin (HU-01). El usuario deberá cambiarla en su primer login
 * (ver must_change_password en createUser / login).
 *
 * @param {number} [length=10] - Longitud de la contraseña generada.
 * @returns {string} Contraseña temporal en texto plano.
 */
function generateTempPassword(length = 10) {
    const alphabet = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    const bytes = crypto.randomBytes(length);
    let password = '';
    for (let i = 0; i < length; i++) {
        password += alphabet[bytes[i] % alphabet.length];
    }
    return password;
}

/**
 * Ejecuta el flujo completo de registro de un usuario nuevo (HU-01).
 * Solo debe llamarse desde una ruta protegida por verifyToken +
 * requireRole('admin') (ver authroutes.js).
 *
 * CA: valida que el rol exista, que el email no esté registrado y,
 * si viene document, que tampoco esté registrado. Genera una
 * contraseña temporal, la hashea, y crea el usuario con
 * must_change_password = true.
 *
 * @param {Object} data
 * @param {string} data.name
 * @param {string} data.email
 * @param {string} data.role - Nombre del rol (ej. "admin", "coder").
 * @param {string} [data.phone]
 * @param {string} [data.document]
 * @param {string} [data.company]
 * @returns {Promise<Object>} { user, tempPassword } — tempPassword se
 *   devuelve en texto plano solo esta vez, para que el admin se la
 *   comparta al nuevo usuario (nunca se guarda en texto plano ni se
 *   vuelve a exponer después).
 * @throws {RoleNotFoundError} Si el rol no existe.
 * @throws {EmailAlreadyExistsError} Si el email ya está registrado.
 * @throws {DocumentAlreadyExistsError} Si el document ya está registrado.
 */
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
        roleName: user.role_name,
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