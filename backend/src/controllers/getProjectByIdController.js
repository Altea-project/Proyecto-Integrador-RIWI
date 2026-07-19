
// GET /projects/:id (detalle de un proyecto).
// Es un archivo aparte de getProjectsController.js (galería) y de projectController.js (crear). 
// Solo lee req, llama al service y devuelve el resultado o el 404 si no existe.

const getProjectByIdService = require("../services/getProjectByIdService");

// GET /projects/:id
// Ruta protegida solo con login: cualquier usuario logueado puede ver el
// detalle de un proyecto (igual que la galería).
// 200 si existe, 404 si no existe o el id no es numérico, 401 si no hay token.
async function getProjectById(req, res, next) {
  try {
    const { id } = req.params;

    // El :id llega como string. Si no es un número, no gasto una consulta:
    // no puede existir un proyecto con ese id -> 404 directo. Además me sirve
    // de red de seguridad si "pending" llegara aca por un error de orden de
    // rutas (ver getProjectByIdRoutes.js).
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
