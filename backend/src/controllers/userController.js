// ============================================================
// userController.js
// Controller de gestión de usuarios (HU-01: registro por admin).
// Responsabilidad única: leer la petición HTTP (req), validar lo
// mínimo de forma (campos presentes), delegar la lógica real al
// service, y traducir el resultado a una respuesta HTTP (res).
// No contiene lógica de negocio ni queries SQL.
// ============================================================

const authService = require('../services/authService');

/**
 * POST /users
 *
 * Ruta protegida: solo un admin autenticado puede registrar usuarios
 * nuevos (ver authRoutes.js: verifyToken + requireRole('admin')).
 *
 * Body esperado: { name, email, role, phone?, document?, company? }
 * (company solo se guarda si role === 'recruiter'; ver authService.registerUser)
 *
 * Respuestas posibles:
 * - 201: usuario creado -> { success: true, data: { user, tempPassword } }
 * - 400: faltan campos obligatorios, o el rol no existe -> { success: false, error }
 * - 409: el email o el document ya están registrados -> { success: false, error }
 * - 500: error inesperado -> delega al manejador de errores centralizado
 */
async function registerUser(req, res, next) {
    try {
        const { name, email, role, phone, document, company } = req.body;

        // Validación de forma: campos mínimos obligatorios para crear un
        // usuario. El resto de reglas (rol válido, email/document únicos)
        // son de negocio y viven en el service.
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

module.exports = { registerUser };
