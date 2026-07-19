
// El puente entre la petición HTTP y la lógica del cambio de contraseña.
// Lee los datos, llama al service y arma la respuesta. La lógica está en el service.

const passwordService = require('../services/passwordService');

// PATCH /change-password (ruta protegida: antes corre verifyToken).
// El usuario llega aca después de loguearse con la contraseña temporal.
// Body: { newPassword, confirmPassword }
async function changePassword(req, res, next) {
    try {
        // El id lo saco del token (lo puso verifyToken), no del body, para que
        // nadie cambie la contraseña de otro.
        const userId = req.user.id;

        // El "|| {}" es por si la petición llega sin body: así no revienta con
        // un 500 y el service responde un 400 diciendo que faltan los campos.
        const { newPassword, confirmPassword } = req.body || {};

        await passwordService.changePassword(userId, newPassword, confirmPassword);

        return res.status(200).json({
            success: true,
            message: 'Contraseña actualizada correctamente',
        });
    } catch (error) {
        // Datos mal enviados por el usuario -> 400.
        if (error instanceof passwordService.ValidationError) {
            return res.status(400).json({
                success: false,
                error: error.message,
            });
        }

        // Token válido pero el usuario ya no existe -> 401.
        if (error instanceof passwordService.UserNotFoundError) {
            return res.status(401).json({
                success: false,
                error: error.message,
            });
        }

        // Cualquier otra cosa (ej: falló la BD) la maneja el manejador
        // general de app.js.
        next(error);
    }
}

module.exports = { changePassword };
