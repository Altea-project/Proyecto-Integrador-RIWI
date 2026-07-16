// ============================================================
// gradingService.js
// Lógica de negocio de las calificaciones (HU-06).
// No conoce req/res ni ejecuta SQL directo (eso es del repository).
// Regla central: un instructor solo puede calificar/actualizar
// proyectos de coders que tenga asignados como TL.
// ============================================================

const {
  findProjectOwnerTl,
  upsertGrading,
  findGradingOwnerTl,
  updateGrading,
} = require("../repositories/gradingRepository");

// Errores de dominio, para que el controller decida el código HTTP.
class ValidationError extends Error {}         // datos inválidos -> 400
class NotFoundError extends Error {}           // proyecto/calificación no existe -> 404
class ForbiddenGradingError extends Error {}   // el instructor no es el TL del coder -> 403

// El score debe ser un entero entre 0 y 100 (ver CHECK en schema.sql).
function validateScore(score) {
  if (!Number.isInteger(score) || score < 0 || score > 100) {
    throw new ValidationError("El score debe ser un número entero entre 0 y 100");
  }
}

/**
 * T2 (issue #80) — POST /gradings.
 * Un instructor califica el proyecto de uno de SUS coders. Valida que
 * el instructor autenticado sea el TL del coder dueño del proyecto.
 * Si el proyecto ya tenía calificación, se sobreescribe (UPSERT, CA-02).
 *
 * @param {number} instructorId - Id del instructor autenticado (del token).
 * @param {Object} data - { projectId, score, comment?, starred? }
 * @returns {Promise<Object>} La calificación creada/actualizada.
 */
async function createGrading(instructorId, { projectId, score, comment, starred }) {
  if (!projectId) {
    throw new ValidationError("projectId es obligatorio");
  }
  validateScore(score);

  const project = await findProjectOwnerTl(projectId);
  if (!project) {
    throw new NotFoundError("El proyecto no existe");
  }

  // Validación central (CA-01): solo el TL asignado al coder puede calificar.
  if (project.tl_id !== instructorId) {
    throw new ForbiddenGradingError(
      "Solo el instructor asignado (TL) al coder puede calificar este proyecto",
    );
  }

  const grading = await upsertGrading({ projectId, instructorId, score, comment, starred });
  return mapGrading(grading);
}

/**
 * T3 (issue #81) — PATCH /gradings/:id.
 * Actualiza una calificación existente. Mismo permiso que la T2: solo el
 * TL del coder dueño del proyecto puede modificarla.
 *
 * @param {number} instructorId - Id del instructor autenticado.
 * @param {number} gradingId - Id de la calificación a actualizar.
 * @param {Object} data - { score?, comment?, starred? } (parcial)
 * @returns {Promise<Object>} La calificación actualizada.
 */
async function updateGradingById(instructorId, gradingId, { score, comment, starred }) {
  if (score !== undefined) validateScore(score);

  const grading = await findGradingOwnerTl(gradingId);
  if (!grading) {
    throw new NotFoundError("La calificación no existe");
  }
  if (grading.tl_id !== instructorId) {
    throw new ForbiddenGradingError(
      "Solo el instructor asignado (TL) al coder puede modificar esta calificación",
    );
  }

  const updated = await updateGrading(gradingId, { score, comment, starred });
  return mapGrading(updated);
}

// Pasa la fila de la BD (snake_case) al formato de la API (camelCase).
function mapGrading(g) {
  return {
    id: g.id,
    projectId: g.project_id,
    instructorId: g.instructor_id,
    score: g.score,
    comment: g.comment,
    starred: g.starred,
    gradedAt: g.graded_at,
  };
}

module.exports = {
  createGrading,
  updateGradingById,
  ValidationError,
  NotFoundError,
  ForbiddenGradingError,
};
