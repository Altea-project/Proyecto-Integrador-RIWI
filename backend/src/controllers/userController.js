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

/**
 * PATCH /users/:id/assign-tl
 *
 * Ruta protegida (admin): asigna un TL (instructor) a un usuario.
 * :id = usuario que recibe el TL. Body: { tlId } (id del instructor).
 *
 * Respuestas:
 * - 200: asignado -> { success: true, data: { user } }
 * - 400: falta tlId / ids invalidos, o el TL no es instructor
 * - 404: el usuario :id no existe
 * - 500: error inesperado -> manejador central de app.js
 */
async function assignTl(req, res, next) {
    try {
        const userId = Number(req.params.id);
        const { tlId } = req.body || {};

        // Validacion de forma (igual estilo que registerUser).
        if (!tlId) {
            return res.status(400).json({
                success: false,
                error: 'Debes enviar el tlId (id del instructor a asignar como TL)',
            });
        }
        if (!Number.isInteger(userId) || userId <= 0 ||
            !Number.isInteger(Number(tlId)) || Number(tlId) <= 0) {
            return res.status(400).json({
                success: false,
                error: 'El id del usuario y el tlId deben ser numeros validos',
            });
        }

        const user = await authService.assignTl(userId, Number(tlId));

        return res.status(200).json({
            success: true,
            data: { user },
        });
    } catch (error) {
        if (error instanceof authService.UserNotFoundError) {
            return res.status(404).json({ success: false, error: error.message });
        }
        if (error instanceof authService.InvalidTlError) {
            return res.status(400).json({ success: false, error: error.message });
        }
        next(error);
    }
}

module.exports = { registerUser, assignTl };
