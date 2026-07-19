// Lógica de login (HU-00) y registro de usuarios (HU-01).
/* Esta capa no toca req/res (eso es del controller) ni hace queries SQL (eso es del repository). 
Solo arma el flujo: pide el usuario al repo, valida la contraseña y genera el token si todo va bien.
*/

const bcrypt = require("bcrypt");
const crypto = require("crypto"); // lo uso para generar una contraseña temporal aleatoria
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

/* Hago clases de error propias para cada caso. 
Así el controller las puede distinguir con "instanceof" y responder el código HTTP correcto en vez de devolver siempre 500.
*/

class InvalidCredentialsError extends Error {}

class RoleNotFoundError extends Error {} // el rol no existe
class EmailAlreadyExistsError extends Error {} // el email ya está registrado
class DocumentAlreadyExistsError extends Error {} // el documento ya está registrado

class UserNotFoundError extends Error {} // el usuario (:id) no existe -> 404
class InvalidTlError extends Error {} // el TL no existe o no es instructor -> 400
class InvalidStatusError extends Error {} // availability_status no valido -> 400
class ForbiddenStatusError extends Error {} // no es admin ni el TL del coder -> 403

// Estados válidos de disponibilidad (mismos que el enum del schema.sql).
const VALID_AVAILABILITY_STATUSES = ["available", "in_conversation", "unavailable"];

/* Genera una contraseña temporal aleatoria y fácil de leer (sin caracteres que se confunden como 0/O o l/1). 
Se la asigno al usuario que crea el admin (HU-01) y él tiene que cambiarla en el primer login.
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

// Registra un usuario nuevo. 
/* Solo lo llama el admin desde la ruta protegida POST /users. 
Valida que el rol exista y que el email (y el documento si viene) no estén repetidos. 
Crea al usuario con una contraseña temporal y must_change_password = true.
Devuelve { user, tempPassword }: la tempPassword se manda en texto plano solo esta vez para que el admin se la pase al usuario; no se guarda así.
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

  // "company" solo tiene sentido para el reclutador. Para cualquier otro rol lo ignoro aunque venga en el body, y lo guardo como null

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

/* Hace el login: valida las credenciales y arma la respuesta si están bien.
Si el email no existe O la contraseña no coincide, tiro el MISMO error en los dos casos, así nadie puede usar el login para adivinar qué correos existen.
También devuelvo mustChangePassword para que el front sepa si tiene que mandar al usuario a cambiar la contraseña.
*/

async function login(email, password) {
  const user = await findUserByEmail(email);

  if (!user) {
    throw new InvalidCredentialsError("Correo o contraseña incorrectos");
  }

  // bcrypt.compare hashea el password que llega y lo compara con el hash guardado. El hash no se puede desencriptar (bcrypt no es reversible).

  const passwordMatches = await bcrypt.compare(password, user.password_hash);

  if (!passwordMatches) {
    throw new InvalidCredentialsError("Correo o contraseña incorrectos");
  }

  const token = generateToken(user);

  // Devuelvo solo los datos que el front necesita, nunca el password_hash.

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

/* Devuelve los datos del usuario a partir de su id (viene de req.user.id, que lo pone verifyToken al leer el JWT). 
Lo uso en GET /me para que el front recupere la sesión después de recargar la página.
Vuelvo a consultar la BD en vez de confiar en el token porque mustChangePassword puede haber cambiado desde que se generó el token.
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

/* Arma el perfil completo del usuario logueado. 
A diferencia de getCurrentUser, este trae los campos del coder, sobre todo availability_status, que es lo que pinta el badge del dashboard (verde / amarillo / gris).
Es solo lectura: por aca el coder no puede cambiar su estado; eso lo hace un TL o el admin desde otro endpoint.
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

// Devuelve la lista de todos los usuarios (vista del admin). Convierte cada fila de la BD al formato que espera el front.

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

// Asigna un TL (instructor) a un coder - HU-02.
// Valida que el coder exista y que el TL exista y tenga rol instructor, y después guarda el tl_id.

async function assignTl(userId, tlId) {
  // El coder al que le asigno el TL tiene que existir
  const user = await findUserById(userId);
  if (!user) {
    throw new UserNotFoundError("El usuario indicado no existe");
  }

  // El TL destino tiene que existir y ser instructor.
  const tl = await findUserById(tlId);
  if (!tl) {
    throw new InvalidTlError("El TL indicado no existe");
  }
  if (tl.role_name !== "instructor") {
    throw new InvalidTlError(
      "El usuario asignado como TL debe tener rol instructor",
    );
  }

  // Guardo la asignación (actualizo tl_id en users).
  const updated = await updateUserTl(userId, tlId);

  return {
    id: updated.id,
    name: updated.name,
    email: updated.email,
    roleId: updated.role_id,
    tlId: updated.tl_id,
  };
}

// Cambia el estado de disponibilidad de un coder (available / in_conversation / unavailable).
// Permiso: solo el admin o el instructor que sea su TL asignado.
// Guardo también quién lo cambió y cuándo (auditoría) en el mismo UPDATE.

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

  // RN-10: admin, o el instructor que es el TL de ese coder.
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

// Edita un usuario que ya existe (HU-01, modal "Editar miembro" del admin).
// Usa casi las mismas validaciones que el registro, pero dejando pasar los datos del propio usuario que se está editando:
// - name, email y role son obligatorios y el rol debe existir.
// - email y document únicos, ignorando al mismo usuario.
// - company solo se guarda si es reclutador, si no queda null.
// No se toca el password ni datos de autenticación aca.

async function updateUser(userId, { name, email, role, phone, document, company }) {
  const existingUser = await findUserByIdFull(userId);
  if (!existingUser) {
    throw new UserNotFoundError("Usuario no encontrado");
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

  // Igual que en registerUser: company solo para reclutador, si no null.
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

// Elimina un usuario: Solo el admin llega aca gracias al middleware de la ruta. Reglas extra:
// - No me puedo eliminar a mí mismo (para no quedarme sin acceso) -> 403.
// - No puedo eliminar un usuario que no existe -> 404.

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
