// GET /projects/:id (detalle de un proyecto).
/*Es un archivo aparte de getProjectsService.js (galería) y de projectService.js (crear). 
Su trabajo: pasar la fila cruda del repository a camelCase para el front y avisar con ProjectNotFoundError si el proyecto no existe. 
No conoce req/res ni ejecuta SQL.
*/

const { findProjectById } = require("../repositories/getProjectByIdRepository");

// Error para "el proyecto no existe". El controller lo pasa a 404.
class ProjectNotFoundError extends Error {
  constructor(id) {
    super(`No existe un proyecto con id ${id}.`);
    this.name = "ProjectNotFoundError";
  }
}


// Arma el detalle de un proyecto para ProjectDetailView.
// - coderName: nombre de quién lo hizo (ya viene resuelto por el JOIN).
// - skills: array de nombres de tecnologías (nunca null; [] si no tiene).
// - grading: null si no está calificado (para el badge "Sin calificar"); si tiene calificación, incluye score, comment y starred.

async function getProjectDetail(id) {
  const row = await findProjectById(id);

  if (!row) {
    throw new ProjectNotFoundError(id);
  }

  /* Igual que en la galería: está calificado si score no es null. 
  Como score es NOT NULL en gradings, un null solo puede venir del LEFT JOIN sin match (no lo confundo con un score de 0) */
  
  const graded = row.score !== null && row.score !== undefined;

  return {
    id: row.id,
    title: row.title,
    description: row.description,
    imageUrl: row.image_url,
    repoUrl: row.repo_url,
    isExternal: row.is_external,
    createdAt: row.created_at,
    coderName: row.coder_name,
    skills: row.skills || [],
    grading: graded
      ? {
          score: row.score,
          comment: row.comment,
          starred: row.starred,
        }
      : null,
  };
}

module.exports = {
  getProjectDetail,
  ProjectNotFoundError,
};
