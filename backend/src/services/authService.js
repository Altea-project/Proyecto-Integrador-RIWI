// ============================================================
// authService.js
// Lógica de negocio de autenticación (login, HU-00) y registro de
// usuarios (registerUser, HU-01).
// Esta capa NO conoce req/res (responsabilidad del controller) ni
// ejecuta queries SQL directas (responsabilidad del repository).
// Orquesta: pedir el usuario al repository, validar la contraseña,
// y generar el token si todo es correcto.
// ============================================================

const bcrypt = require("bcrypt");
const crypto = require("crypto"); // usa la librería crypto de node para generar una contraseña temporal aleatoria segura
const {
  findUserByEmail,
  findUserByDocument,
  findRoleByName,
  createUser,
  findUserById,
  findUserProfileById,
  findAllUsers,
  updateUserTl,
  findUserRoleAndTl,
  updateAvailabilityStatus,
  findUserByIdFull,
  updateUserRepository,
  deleteUserRepository,
} = require("../repositories/authRepository");
const { generateToken } = require("../utils/jwt");

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

class UserNotFoundError extends Error {} // El usuario indicado (:id) no existe. -> 404
class InvalidTlError extends Error {} // El TL indicado no existe o no tiene rol instructor. -> 400
class InvalidStatusError extends Error {} // availability_status no valido -> 400
class ForbiddenStatusError extends Error {} // no es admin ni el TL del coder -> 403

// Estados validos de disponibilidad (ver enum en schema.sql).
const VALID_AVAILABILITY_STATUSES = ["available", "in_conversation", "unavailable"];

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
  const alphabet = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  const bytes = crypto.randomBytes(length);
  let password = "";
  for (let i = 0; i < length; i++) {
    password += alphabet[bytes[i] % alphabet.length];
  }
  return password;
}

/**
 * Ejecuta el flujo completo de registro de un usuario nuevo (HU-01).
 * Solo debe llamarse desde una ruta protegida por verifyToken +
 * requireRole('admin') (ver authRoutes.js: POST /users).
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
 * @param {string} [data.company] - Solo se guarda si role === 'recruiter';
 *   para cualquier otro rol se ignora y se guarda como null.
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
    throw new EmailAlreadyExistsError(
      "Ya existe un usuario registrado con ese correo",
    );
  }

  if (document) {
    const existingByDocument = await findUserByDocument(document);
    if (existingByDocument) {
      throw new DocumentAlreadyExistsError(
        "Ya existe un usuario registrado con ese documento",
      );
    }
  }

  // CA: "company" solo tiene sentido para el rol "recruiter" (empresa
  // que representa el reclutador). Para cualquier otro rol se ignora,
  // aunque venga en el body, para no guardar un dato sin sentido de
  // negocio (ej. un "coder" con company).
  const finalCompany = role === "recruiter" ? company : null;

  const tempPassword = generateTempPassword();
  const passwordHash = await bcrypt.hash(tempPassword, 10);

  const newUser = await createUser({
    name,
    email,
    passwordHash,
    phone,
    document,
    company: finalCompany,
    roleId: roleRecord.id,
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
    throw new InvalidCredentialsError("Correo o contraseña incorrectos");
  }

  // bcrypt.compare hashea "password" internamente con el mismo salt
  // que se usó al crear el hash guardado, y compara el resultado.
  // Nunca se desencripta password_hash (bcrypt no es reversible).
  const passwordMatches = await bcrypt.compare(password, user.password_hash);

  if (!passwordMatches) {
    throw new InvalidCredentialsError("Correo o contraseña incorrectos");
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

/**
 * Reconstruye los datos públicos de un usuario a partir de su id
 * (viene de req.user.id, adjuntado por verifyToken al decodificar
 * el JWT). Se usa en GET /me para que el frontend pueda "recordar"
 * la sesión tras una recarga de página, sin depender de tener el
 * usuario guardado en memoria.
 *
 * Se vuelve a consultar la base de datos (en vez de confiar solo en
 * lo que ya venía en el token) porque mustChangePassword puede haber
 * cambiado desde que el token se generó -- el token no se re-emite
 * después de un cambio de contraseña, así que sería un dato viejo si
 * se leyera directo del payload.
 *
 * @param {number} userId - Id del usuario autenticado (req.user.id).
 * @returns {Promise<Object>} Datos públicos del usuario, mismo shape que login().
 * @throws {UserNotFoundError} Si el id no corresponde a ningún usuario.
 */
async function getCurrentUser(userId) {
  const user = await findUserById(userId);

  if (!user) {
    throw new UserNotFoundError("Usuario no encontrado");
  }

  return {
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

/**
 * Arma el perfil completo del usuario autenticado (T2 de la HU de
 * disponibilidad): a diferencia de getCurrentUser (usado en GET /me
 * para reconstruir la sesión), este perfil incluye los campos propios
 * de un coder -- en especial availability_status, que alimenta el
 * badge del dashboard (CA-01: verde "Disponible" / amarillo "En
 * conversaciones" / gris "No disponible").
 *
 * Es de solo lectura: este endpoint no expone ninguna forma de que el
 * propio usuario cambie su availability_status (CA-03) -- ese cambio
 * solo lo puede hacer un TL o un admin desde otro endpoint (fuera del
 * alcance de T2), y el coder solo lo ve reflejado al recargar (CA-02).
 *
 * @param {number} userId - Id del usuario autenticado (req.user.id).
 * @returns {Promise<Object>} Perfil público del usuario, incluyendo availabilityStatus.
 * @throws {UserNotFoundError} Si el id no corresponde a ningún usuario.
 */
async function getMyProfile(userId) {
  const user = await findUserProfileById(userId);

  if (!user) {
    throw new UserNotFoundError("Usuario no encontrado");
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    document: user.document,
    company: user.company,
    roleId: user.role_id,
    roleName: user.role_name,
    tlId: user.tl_id,
    tlName: user.tl_name,
    avatarUrl: user.avatar_url,
    availabilityStatus: user.availability_status,
    statusChangedAt: user.status_changed_at,
    mustChangePassword: user.must_change_password,
    createdAt: user.created_at,
    updatedAt: user.updated_at,
  };
}

/**
 * Devuelve el listado completo de usuarios (admin). Traduce cada fila
 * de la base de datos al shape público que espera el frontend.
 *
 * @returns {Promise<Array>} Lista de usuarios.
 */
async function getAllUsers() {
  const users = await findAllUsers();

  return users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    phone: u.phone,
    document: u.document,
    company: u.company,
    roleId: u.role_id,
    roleName: u.role_name,
    tlId: u.tl_id,
    tlName: u.tl_name,
    mustChangePassword: u.must_change_password,
    createdAt: u.created_at,
  }));
}

/**
 * Asigna un TL (team leader) a un usuario. Es la HU-01:
 *   - T1 (issue #65): valida que el TL destino exista y tenga rol "instructor".
 *   - T2 (issue #66): guarda la asignacion actualizando tl_id en la tabla users.
 *
 * @param {number} userId - Id del usuario (coder) que recibe el TL.
 * @param {number} tlId - Id del instructor a asignar como TL.
 * @returns {Promise<Object>} El usuario actualizado con su nuevo tlId.
 * @throws {UserNotFoundError} Si el usuario :id no existe (404).
 * @throws {InvalidTlError} Si el TL no existe o no es instructor (400).
 */
async function assignTl(userId, tlId) {
  // El usuario al que se le asigna el TL debe existir.
  const user = await findUserById(userId);
  if (!user) {
    throw new UserNotFoundError("El usuario indicado no existe");
  }

  // Validacion central de T1: el TL destino debe existir y ser instructor.
  const tl = await findUserById(tlId);
  if (!tl) {
    throw new InvalidTlError("El TL indicado no existe");
  }
  if (tl.role_name !== "instructor") {
    throw new InvalidTlError(
      "El usuario asignado como TL debe tener rol instructor",
    );
  }

  // T2: guardar la asignacion (actualizar tl_id en la tabla users).
  const updated = await updateUserTl(userId, tlId);

  return {
    id: updated.id,
    name: updated.name,
    email: updated.email,
    roleId: updated.role_id,
    tlId: updated.tl_id,
  };
}

/**
 * HU-11 (T1 + T2) — Cambia el estado de disponibilidad de un usuario.
 * Permiso (RN-10): un admin, o el instructor que sea el TL asignado a ese
 * coder (tl_id === requester.id). Guarda la auditoria en el mismo UPDATE.
 *
 * @param {Object} requester - Usuario autenticado (req.user): { id, roleName }.
 * @param {number} targetUserId - Usuario cuyo estado se cambia.
 * @param {string} status - Nuevo estado.
 * @returns {Promise<Object>} El usuario con su nuevo estado y la auditoria.
 * @throws {InvalidStatusError} status no válido (400).
 * @throws {UserNotFoundError} el usuario no existe (404).
 * @throws {ForbiddenStatusError} no es admin ni el TL del coder (403).
 */
async function changeAvailabilityStatus(requester, targetUserId, status) {
  if (!VALID_AVAILABILITY_STATUSES.includes(status)) {
    throw new InvalidStatusError(
      "Estado inválido. Debe ser: available, in_conversation o unavailable",
    );
  }

  const target = await findUserRoleAndTl(targetUserId);
  if (!target) {
    throw new UserNotFoundError("El usuario indicado no existe");
  }

  // RN-10: admin, o instructor que sea el TL asignado a ese coder.
  const isAdmin = requester.roleName === "admin";
  const isAssignedTl =
    requester.roleName === "instructor" && target.tl_id === requester.id;

  if (!isAdmin && !isAssignedTl) {
    throw new ForbiddenStatusError(
      "No tienes permiso para cambiar el estado de este usuario",
    );
  }

  const updated = await updateAvailabilityStatus(targetUserId, status, requester.id);
  return {
    id: updated.id,
    name: updated.name,
    availabilityStatus: updated.availability_status,
    statusChangedBy: updated.status_changed_by,
    statusChangedAt: updated.status_changed_at,
  };
}

/**
 * Actualiza los datos de un usuario existente (HU-01: edición por admin,
 * usada por el modal "Editar miembro").
 *
 * Reglas de negocio (las mismas validaciones que el registro, pero
 * tolerando el propio usuario):
 * - name, email y role son obligatorios.
 * - role debe existir (RoleNotFoundError -> 400).
 * - email único, ignorando al propio usuario que se está editando
 *   (EmailAlreadyExistsError -> 409).
 * - document único (si se envía), ignorando al propio usuario
 *   (DocumentAlreadyExistsError -> 409).
 * - company solo se guarda cuando role === 'recruiter'; para cualquier
 *   otro rol se fuerza a null.
 * - Nunca se permite modificar password, id, created_at, must_change_password
 *   ni datos de autenticación (no se reciben ni se escriben aquí).
 *
 * @param {number} userId - Id del usuario a actualizar.
 * @param {Object} data
 * @param {string} data.name
 * @param {string} data.email
 * @param {string} data.role - Nombre del rol (ej. "admin", "coder").
 * @param {string} [data.phone]
 * @param {string} [data.document]
 * @param {string} [data.company] - Solo se guarda si role === 'recruiter'.
 * @returns {Promise<Object>} El usuario actualizado (mismo shape que getMyProfile, sin campos sensibles).
 * @throws {UserNotFoundError} Si el usuario :id no existe (404).
 * @throws {RoleNotFoundError} Si el rol no existe (400).
 * @throws {EmailAlreadyExistsError} Si el email ya está en uso por otro usuario (409).
 * @throws {DocumentAlreadyExistsError} Si el document ya está en uso por otro usuario (409).
 */
async function updateUser(userId, { name, email, role, phone, document, company }, requester) {
  const existingUser = await findUserByIdFull(userId);
  if (!existingUser) {
    throw new UserNotFoundError("Usuario no encontrado");
  }

  // RN: Si no es admin, debe ser el TL asignado a ese coder.
  if (requester && requester.roleName !== "admin") {
    if (existingUser.tl_id !== requester.id) {
      throw new ForbiddenStatusError(
        "No tienes permiso para editar este usuario",
      );
    }
  }

  if (!name || !email || !role) {
    throw new RoleNotFoundError(
      "name, email y role son obligatorios",
    );
  }

  const roleRecord = await findRoleByName(role);
  if (!roleRecord) {
    throw new RoleNotFoundError(`El rol "${role}" no existe`);
  }

  const emailConflict = await findUserByEmail(email);
  if (emailConflict && emailConflict.id !== userId) {
    throw new EmailAlreadyExistsError(
      "Ya existe otro usuario registrado con ese correo",
    );
  }

  if (document) {
    const documentConflict = await findUserByDocument(document);
    if (documentConflict && documentConflict.id !== userId) {
      throw new DocumentAlreadyExistsError(
        "Ya existe otro usuario registrado con ese documento",
      );
    }
  }

  // company solo tiene sentido para el rol "recruiter"; para cualquier
  // otro rol se ignora y se guarda como null (mismo criterio que registerUser).
  const finalCompany = role === "recruiter" ? company : null;

  const updated = await updateUserRepository(userId, {
    name,
    email,
    phone,
    document,
    company: finalCompany,
    roleId: roleRecord.id,
  });

  return {
    id: updated.id,
    name: updated.name,
    email: updated.email,
    phone: updated.phone,
    document: updated.document,
    company: updated.company,
    roleId: updated.role_id,
    roleName: roleRecord.name,
    mustChangePassword: updated.must_change_password,
    createdAt: updated.created_at,
    updatedAt: updated.updated_at,
  };
}

/**
 * Elimina un usuario (HU-01: borrado por admin, usada por el modal de
 * confirmación "Delete Member"). Solo un admin autenticado puede hacerlo
 * (lo garantiza el middleware requireRole('admin') en la ruta).
 *
 * Reglas adicionales de negocio:
 * - No se puede eliminar a uno mismo (el admin autenticado), para no
 *   dejarse sin acceso a la consola. -> 403.
 * - No se puede eliminar un usuario que no existe. -> 404.
 *
 * @param {number} userId - Id del usuario a eliminar.
 * @param {Object} requester - Usuario autenticado (req.user): { id, roleName }.
 * @returns {Promise<void>}
 * @throws {UserNotFoundError} Si el usuario :id no existe (404).
 * @throws {ForbiddenStatusError} Si el admin intenta eliminarse a sí mismo (403).
 */
async function deleteUser(userId, requester) {
  const existingUser = await findUserByIdFull(userId);
  if (!existingUser) {
    throw new UserNotFoundError("Usuario no encontrado");
  }

  // RN: un admin no puede eliminarse a sí mismo (cierra su propia sesión/consola).
  if (requester && requester.id === userId) {
    throw new ForbiddenStatusError(
      "No puedes eliminar tu propio usuario administrador",
    );
  }

  // RN: Si no es admin, debe ser el TL asignado a ese coder.
  if (requester && requester.roleName !== "admin") {
    if (existingUser.tl_id !== requester.id) {
      throw new ForbiddenStatusError(
        "No tienes permiso para eliminar este usuario",
      );
    }
  }

  await deleteUserRepository(userId);
}

module.exports = {
  login,
  registerUser,
  getCurrentUser,
  getMyProfile,
  getAllUsers,
  updateUser,
  deleteUser,
  InvalidCredentialsError,
  RoleNotFoundError,
  EmailAlreadyExistsError,
  DocumentAlreadyExistsError,
  assignTl,
  UserNotFoundError,
  InvalidTlError,
  UserNotFoundError,
  changeAvailabilityStatus,
  InvalidStatusError,
  ForbiddenStatusError,
};
