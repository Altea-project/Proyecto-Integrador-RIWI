// ============================================================
// getProjectByIdService.js
// HU · T2 — GET /projects/:id (detalle de un proyecto).
//
// Archivo INDEPENDIENTE de getProjectsService.js (galería) y de
// projectService.js (crear proyecto). Ver nota en
// getProjectByIdRepository.js.
//
// Lógica de negocio: traduce la fila cruda del repository a un shape
// de negocio (camelCase) listo para el frontend, y decide si el
// proyecto existe o no (avisa con ProjectNotFoundError si no). NO
// conoce req/res (responsabilidad del controller) ni ejecuta queries
// SQL directas (responsabilidad del repository).
// ============================================================

const { findProjectById } = require("../repositories/getProjectByIdRepository");

/**
 * (T2) Error de dominio para "el proyecto no existe". El controller
 * lo traduce a 404 (CA-03); cualquier otro error sigue de largo hacia
 * el manejador de errores centralizado (500).
 */
class ProjectNotFoundError extends Error {
  constructor(id) {
    super(`No existe un proyecto con id ${id}.`);
    this.name = "ProjectNotFoundError";
  }
}

/**
 * (T2) Arma el detalle de un proyecto para la vista ProjectDetailView.
 *
 * - coderName: nombre de quién hizo el proyecto (ya resuelto por
 *   JOIN, igual que en la galería).
 * - skills: array de nombres de tecnologías (nunca null; `[]` si el
 *   proyecto no tiene ninguna cargada).
 * - grading: `null` si el proyecto no ha sido calificado (CA-02, para
 *   el badge "Sin calificar"); si tiene calificación, incluye score,
 *   comment y starred.
 *
 * @param {string|number} id
 * @returns {Promise<Object>} Proyecto listo para el detalle.
 * @throws {ProjectNotFoundError} si no existe un proyecto con ese id.
 */
async function getProjectDetail(id) {
  const row = await findProjectById(id);

  if (!row) {
    throw new ProjectNotFoundError(id);
  }

  // Igual que en la galería (getProjectsService): un proyecto está
  // calificado cuando tiene score, nunca cuando score === 0 sería
  // confundido con "sin calificar" (score es NOT NULL en gradings,
  // así que null solo puede venir del LEFT JOIN sin match).
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
