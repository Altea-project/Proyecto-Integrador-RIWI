// ============================================================
// getProjectByIdController.js
// HU · T3 — GET /projects/:id (detalle de un proyecto).
//
// Archivo INDEPENDIENTE de getProjectsController.js (galería) y de
// projectController.js (crear proyecto). Ver nota en
// getProjectByIdRepository.js.
//
// Responsabilidad única: leer la petición HTTP (req), delegar la
// lógica real al service, y traducir el resultado (o el error de
// dominio "no existe") a una respuesta HTTP (res). No contiene
// lógica de negocio ni queries SQL.
// ============================================================

const getProjectByIdService = require("../services/getProjectByIdService");

/**
 * GET /projects/:id
 *
 * Ruta protegida solo por autenticación (verifyToken): cualquier
 * usuario autenticado puede ver el detalle de un proyecto, igual que
 * la galería ("Como usuario de la plataforma, quiero ver un proyecto
 * completo al hacer clic en él...").
 *
 * Respuestas posibles:
 * - 200: id válido y con token -> { success: true, data: { project } } (CA-01)
 * - 401: token no enviado / inválido / expirado (lo maneja verifyToken)
 * - 404: no existe ningún proyecto con ese id (CA-03), o el :id no es
 *   numérico (por ejemplo, si algún segmento literal como "pending"
 *   llegara aquí por un error de orden de rutas; ver la nota en
 *   getProjectByIdRoutes.js)
 * - 500: error inesperado -> delega al manejador de errores centralizado
 */
async function getProjectById(req, res, next) {
  try {
    const { id } = req.params;

    // El :id de la URL siempre llega como string. Si no es un entero,
    // ni vale la pena tocar la BD: no puede existir un proyecto con
    // ese id -> 404 directo. Esto además actúa como segunda barrera
    // de seguridad ante "pending" u otro literal que llegara aquí por
    // un error de orden de rutas (ver getProjectByIdRoutes.js).
    if (!/^\d+$/.test(id)) {
      return res.status(404).json({
        success: false,
        error: "Proyecto no encontrado.",
      });
    }

    const project = await getProjectByIdService.getProjectDetail(id);

    return res.status(200).json({
      success: true,
      data: { project },
    });
  } catch (error) {
    if (error instanceof getProjectByIdService.ProjectNotFoundError) {
      return res.status(404).json({
        success: false,
        error: error.message,
      });
    }

    next(error);
  }
}

module.exports = { getProjectById };
