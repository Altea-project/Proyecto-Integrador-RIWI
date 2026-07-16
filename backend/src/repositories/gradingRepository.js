// ============================================================
// gradingRepository.js
// Capa de acceso a datos para calificaciones (HU-06).
// Solo ejecuta SQL contra las tablas "gradings" y "projects".
// No contiene lógica de negocio (eso vive en gradingService.js).
// ============================================================

const pool = require("../config/db");

/**
 * (T2) Dado un proyecto, trae el coder dueño y el tl_id de ese coder.
 * Sirve para validar que el instructor que califica sea el TL asignado
 * al coder propietario del proyecto.
 *
 * @param {number} projectId
 * @returns {Promise<Object|undefined>} { project_id, coder_id, tl_id } o undefined si el proyecto no existe.
 */
async function findProjectOwnerTl(projectId) {
  const { rows } = await pool.query(
    `SELECT p.id AS project_id, p.coder_id, c.tl_id
       FROM projects p
       JOIN users c ON c.id = p.coder_id
      WHERE p.id = $1`,
    [projectId],
  );
  return rows[0];
}

/**
 * (T2) Crea la calificación, o la SOBREESCRIBE si el proyecto ya tenía
 * una (project_id es UNIQUE en la tabla). Esto cubre el CA-02 (UPSERT).
 *
 * @returns {Promise<Object>} La calificación creada/actualizada.
 */
async function upsertGrading({ projectId, instructorId, score, comment, starred }) {
  const { rows } = await pool.query(
    `INSERT INTO gradings (project_id, instructor_id, score, comment, starred)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (project_id) DO UPDATE
       SET instructor_id = EXCLUDED.instructor_id,
           score = EXCLUDED.score,
           comment = EXCLUDED.comment,
           starred = EXCLUDED.starred,
           graded_at = now()
     RETURNING id, project_id, instructor_id, score, comment, starred, graded_at`,
    [projectId, instructorId, score, comment ?? null, starred ?? false],
  );
  return rows[0];
}

/**
 * (T3) Dado el id de una calificación, trae la calificación y el tl_id
 * del coder dueño del proyecto, para validar el permiso del instructor.
 *
 * @param {number} gradingId
 * @returns {Promise<Object|undefined>} { id, project_id, instructor_id, tl_id } o undefined.
 */
async function findGradingOwnerTl(gradingId) {
  const { rows } = await pool.query(
    `SELECT g.id, g.project_id, g.instructor_id, c.tl_id
       FROM gradings g
       JOIN projects p ON p.id = g.project_id
       JOIN users c ON c.id = p.coder_id
      WHERE g.id = $1`,
    [gradingId],
  );
  return rows[0];
}

/**
 * (T3) Actualiza una calificación existente. Actualización parcial:
 * con COALESCE, si un campo llega como null (no se envió) se conserva
 * el valor actual.
 *
 * @returns {Promise<Object>} La calificación actualizada.
 */
async function updateGrading(gradingId, { score, comment, starred }) {
  const { rows } = await pool.query(
    `UPDATE gradings
        SET score = COALESCE($2, score),
            comment = COALESCE($3, comment),
            starred = COALESCE($4, starred),
            graded_at = now()
      WHERE id = $1
      RETURNING id, project_id, instructor_id, score, comment, starred, graded_at`,
    [gradingId, score ?? null, comment ?? null, starred ?? null],
  );
  return rows[0];
}

module.exports = {
  findProjectOwnerTl,
  upsertGrading,
  findGradingOwnerTl,
  updateGrading,
};
