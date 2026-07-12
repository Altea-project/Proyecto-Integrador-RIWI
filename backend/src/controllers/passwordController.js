// passwordController.js
// El "traductor" entre la petición HTTP y la lógica del cambio de contraseña.
// Lee los datos de la petición, llama al service y arma la respuesta según
// lo que pase. La lógica de verdad está en el service.

const passwordService = require('../services/passwordService');

// PATCH /change-password  (ruta protegida: antes corre verifyToken).
// El usuario llega aquí después de loguearse con su contraseña temporal.
// Body esperado: { newPassword, confirmPassword }
async function changePassword(req, res, next) {
    try {
        // El id lo sacamos del token (lo puso verifyToken en req.user),
        // no del body, para que nadie cambie la contraseña de otro.
        const userId = req.user.id;

        // "|| {}" evita un error si la petición llega sin body (req.body
        // undefined). Así, en vez de reventar con un 500, sigue el flujo y
        // el service responde un 400 limpio diciendo que faltan los campos.
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

        // Cualquier otra cosa (ej. la base de datos falló) la maneja el
        // manejador de errores general de app.js.
        next(error);
    }
}

module.exports = { changePassword };
