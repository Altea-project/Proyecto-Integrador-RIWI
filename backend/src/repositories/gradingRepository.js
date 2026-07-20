
// Capa de acceso a datos de calificaciones (HU-06). Solo SQL contra las tablas "gradings" y "projects". La lógica va en gradingService.js.


const pool = require("../config/db");

// Dado un proyecto, trae el coder dueño y el tl_id de ese coder. 
// Sirve para validar que el instructor que califica sea el TL asignado al coder.

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

// Crea la calificación, o la sobreescribe si el proyecto ya tenía una (project_id es UNIQUE). Esto es el UPSERT del CA-02.

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

// Dado el id de una calificación, trae la calificación y el tl_id del coder dueño del proyecto, para validar el permiso del instructor.

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

// Actualiza una calificación. Con COALESCE, si un campo llega en null (no se mandó) se conserva el valor que ya tenía.

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
