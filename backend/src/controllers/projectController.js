// ============================================================
// projectController.js
// Controller de proyectos.
// Responsabilidad única: leer la petición HTTP (req), validar lo
// mínimo de forma (campos presentes), delegar la lógica real al
// service, y traducir el resultado a una respuesta HTTP (res).
// No contiene lógica de negocio ni queries SQL.
// ============================================================

const projectService = require('../services/projectService');

/**
 * POST /projects
 *
 * Ruta protegida: requiere un coder autenticado (verifyToken +
 * requireRole('coder') en projectRoutes.js). El coder_id NUNCA se lee
 * del body -- siempre viene de req.user.id, que verifyToken llenó a
 * partir del JWT. Así un coder no puede crear un proyecto a nombre de
 * otro usuario aunque lo intente enviando otro id en el body.
 *
 * Body esperado: { title, description, repoUrl, imageUrl?, technologies: string[] }
 *
 * Respuestas posibles:
 * - 201: proyecto creado -> { success: true, data: { project } }
 * - 400: falta algún campo obligatorio (CA-01) -> { success: false, error }
 * - 500: error inesperado -> delega al manejador de errores centralizado
 */
async function createProject(req, res, next) {
    try {
        const { title, description, repoUrl, imageUrl, technologies } = req.body;
        const coderId = req.user.id; // T1: coder_id se obtiene del JWT, no del body.

        // Validación de forma (no de negocio). El resto de reglas de
        // CA-01 (ej. "al menos una tecnología") las valida el service.
        if (!title || !description || !repoUrl) {
            return res.status(400).json({
                success: false,
                error: 'title, description y repoUrl son obligatorios',
            });
        }

        const project = await projectService.createProject({
            coderId,
            title,
            description,
            repoUrl,
            imageUrl,
            technologies,
        });

        return res.status(201).json({
            success: true,
            data: { project },
        });
    } catch (error) {
        if (error instanceof projectService.InvalidProjectDataError) {
            return res.status(400).json({ success: false, error: error.message });
        }

        // Cualquier otro error (ej. falla de conexión a la BD) se delega
        // al manejador de errores centralizado de app.js.
        next(error);
    }
}

module.exports = { createProject };
