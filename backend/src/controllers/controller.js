

// ============================================================
// authController.js
// Controller de autenticación.
// Responsabilidad única: leer la petición HTTP (req), validar lo
// mínimo de forma (campos presentes), delegar la lógica real al
// service, y traducir el resultado a una respuesta HTTP (res).
// No contiene lógica de negocio ni queries SQL.
// ============================================================

const authService = require('../services/service');

/**
 * POST /login
 *
 * Body esperado: { email: string, password: string }
 *
 * Respuestas posibles:
 * - 200: login exitoso -> { success: true, data: { token, user, mustChangePassword } }
 * - 400: falta email o password (CA-01)                -> { success: false, error }
 * - 401: credenciales incorrectas (CA-03)                -> { success: false, error }
 * - 500: error inesperado (BD caída, etc.) -> delega al manejador de errores centralizado
 */
async function login(req, res, next) {
    try {
    const { email, password } = req.body;

    // CA-01: validación de forma (no de negocio). Se hace aquí, antes
    // de llamar al service, para no gastar una consulta a la BD con
    // datos que ya sabemos que son inválidos.
    if (!email || !password) {
        return res.status(400).json({
        success: false,
        error: 'Correo y contraseña son obligatorios',
        });
    }

    // Toda la lógica real (buscar usuario, comparar contraseña,
    // generar token) vive en el service. El controller no sabe cómo
    // se hace, solo qué esperar como resultado.
    const result = await authService.login(email, password);

    return res.status(200).json({
        success: true,
        data: result,
    });
    } catch (error) {
    // CA-03: si el error es de credenciales inválidas (lanzado por el
    // service), lo traducimos a un 401 con mensaje genérico.
    if (error instanceof authService.InvalidCredentialsError) {
        return res.status(401).json({
        success: false,
        error: error.message,
        });
    }

    // Cualquier otro error (ej. falla de conexión a la BD) no lo
    // manejamos aquí -- se delega al manejador de errores centralizado
    // de Express (middleware con 4 parámetros al final de app.js).
    next(error);
    }
}

async function registerUser(req, res, next) {
    try {
        const { name, email, role, phone, document, company } = req.body;

        if (!name || !email || !role) {
            return res.status(400).json({
                success: false,
                error: 'name, email y role son obligatorios',
            });
        }

        const result = await authService.registerUser({ name, email, role, phone, document, company });

        return res.status(201).json({
            success: true,
            data: result,
        });
    } catch (error) {
        if (error instanceof authService.RoleNotFoundError) {
            return res.status(400).json({ success: false, error: error.message });
        }

        if (
            error instanceof authService.EmailAlreadyExistsError ||
            error instanceof authService.DocumentAlreadyExistsError
        ) {
            return res.status(409).json({ success: false, error: error.message });
        }

        next(error);
    }
}

module.exports = { login, registerUser };