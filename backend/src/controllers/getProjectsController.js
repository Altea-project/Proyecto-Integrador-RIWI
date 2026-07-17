// ============================================================
// getProjectsController.js
// HU-12 · T1 — GET /projects (galería de proyectos).
//
// Archivo INDEPENDIENTE de projectController.js a propósito (ver nota
// en getProjectsRepository.js): esta feature no comparte código con
// createProject, solo comparte la tabla "projects".
//
// Responsabilidad única: leer la petición HTTP (req), delegar la
// lógica real al service, y traducir el resultado a una respuesta
// HTTP (res). No contiene lógica de negocio ni queries SQL.
// ============================================================

const getProjectsService = require("../services/getProjectsService");

/**
 * GET /projects
 *
 * Ruta protegida solo por autenticación (verifyToken): cualquier
 * usuario autenticado, sin importar su rol, puede ver la galería
 * (ver la HU-12: "Como usuario autenticado, quiero ver una galería
 * de proyectos..."). A diferencia de createProject, no lleva
 * requireRole en getProjectsRoutes.js.
 *
 * No recibe query params ni body: siempre devuelve la lista completa,
 * ya ordenada por el service/repository según RN-04.
 *
 * Respuestas posibles:
 * - 200: -> { success: true, data: { projects: [...] } }
 * - 401: token no enviado / inválido / expirado (lo maneja verifyToken)
 * - 500: error inesperado -> delega al manejador de errores centralizado
 */
async function getProjects(req, res, next) {
  try {
    const projects = await getProjectsService.getGalleryProjects();

    return res.status(200).json({
      success: true,
      data: { projects },
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { getProjects };
