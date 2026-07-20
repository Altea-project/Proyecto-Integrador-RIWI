
// GET /projects (galería de proyectos) - HU-12.
// Es un archivo aparte de projectController.js a propósito: esta feature no
// comparte código con crear proyecto, solo la tabla "projects".
// Solo lee req, llama al service y arma la respuesta.

const getProjectsService = require("../services/getProjectsService");

// GET /projects
// Ruta protegida solo con login: cualquier usuario logueado (sea el rol que sea) puede ver la galería (HU-12). 
// No lleva requireRole.
// No recibe params ni body: siempre devuelve la lista completa, ya ordenada por el service según RN-04.
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

// GET /projects/pending - dashboard del TL: proyectos sin calificar de sus
// coders. El tlId sale del token (req.user.id).
async function getPendingProjects(req, res, next) {
  try {
    const projects = await getProjectsService.getPendingProjects(req.user.id);
    return res.status(200).json({ success: true, data: { projects } });
  } catch (error) {
    next(error);
  }
}

module.exports = { getProjects, getPendingProjects };
