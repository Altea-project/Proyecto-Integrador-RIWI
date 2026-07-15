// passwordService.js
// La lógica del cambio de contraseña obligatorio (T5).
// Como el usuario acaba de iniciar sesión con su contraseña temporal, aquí
// NO se le vuelve a pedir la contraseña actual: solo escribe la nueva y la
// confirma. Recibe los datos ya "en limpio" desde el controller, decide si
// el cambio es válido y, si lo es, guarda la nueva contraseña.
// No sabe de req/res ni escribe SQL directo (eso lo hace el repository).

const bcrypt = require('bcrypt');
const { findUserById, updatePassword } = require('../repositories/passwordRepository');

// Cuánto "cuesta" calcular el hash. 10 es lo normal: seguro y no tan lento.
const SALT_ROUNDS = 10;

// Largo mínimo de la nueva contraseña. Si mañana quieren pedir más, se cambia
// solo este número.
const MIN_PASSWORD_LENGTH = 8;

// Error para cuando el usuario mandó algo mal (campos vacíos, contraseña corta,
// no coincide, etc.). El controller lo usa para responder 400.
class ValidationError extends Error {}

// Error para cuando el token es válido pero el usuario ya no existe.
// El controller lo usa para responder 401.
class UserNotFoundError extends Error {}

// Cambia la contraseña del usuario que está logueado.
// userId viene del token, no del body, para que nadie cambie la contraseña
// de otra persona.
async function changePassword(userId, newPassword, confirmPassword) {
    // Primero lo que se puede revisar sin tocar la base de datos.
    if (!newPassword || !confirmPassword) {
        throw new ValidationError('Debes enviar la nueva contraseña y su confirmación');
    }

    if (newPassword.length < MIN_PASSWORD_LENGTH) {
        throw new ValidationError('La nueva contraseña debe tener al menos ' + MIN_PASSWORD_LENGTH + ' caracteres');
    }

    if (newPassword !== confirmPassword) {
        throw new ValidationError('La nueva contraseña y su confirmación no coinciden');
    }

    // Buscamos al usuario. Si el token es válido pero el usuario ya no existe
    // (ej. lo borraron), no seguimos.
    const user = await findUserById(userId);
    if (!user) {
        throw new UserNotFoundError('No se pudo verificar el usuario');
    }

    // No dejar que la "nueva" contraseña sea la misma temporal que ya tenía.
    // bcrypt.compare vuelve a hashear lo que escribió y lo compara con el hash
    // guardado; nunca se "desencripta" la contraseña.
    const sameAsTemp = await bcrypt.compare(newPassword, user.password_hash);
    if (sameAsTemp) {
        throw new ValidationError('La nueva contraseña no puede ser igual a la temporal');
    }

    // Todo bien: hasheamos la nueva y la guardamos. El repository, en la misma
    // consulta, apaga must_change_password.
    const newPasswordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await updatePassword(userId, newPasswordHash);
}

module.exports = { changePassword, ValidationError, UserNotFoundError };
