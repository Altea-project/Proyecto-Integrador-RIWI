/* Lógica de negocio de las calificaciones. No conoce req/res ni ejecuta SQL. 
Regla central: un instructor solo puede calificar/actualizar proyectos de coders que tenga asignados como TL.
*/

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

// El score tiene que ser un entero entre 0 y 100 (igual que el CHECK del schema).
function validateScore(score) {
  if (!Number.isInteger(score) || score < 0 || score > 100) {
    throw new ValidationError("El score debe ser un número entero entre 0 y 100");
  }
}

/* POST /gradings.
Un instructor califica el proyecto de uno de SUS coders. 
Valida que el instructor logueado sea el TL del coder dueño del proyecto. 
Si el proyecto ya tenía calificación, se sobreescribe
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

  // CA-01: solo el TL asignado al coder puede calificar..
  if (project.tl_id !== instructorId) {
    throw new ForbiddenGradingError(
      "Solo el instructor asignado (TL) al coder puede calificar este proyecto",
    );
  }

  const grading = await upsertGrading({ projectId, instructorId, score, comment, starred });
  return mapGrading(grading);
}

// PATCH /gradings/:id.
// Actualiza una calificación. Mismo permiso que crear: solo el TL del coder dueño del proyecto puede modificarla.

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
