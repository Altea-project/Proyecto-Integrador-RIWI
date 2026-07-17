// ============================================================
// getProjectsRepository.js
// HU-12 · T1 — GET /projects (galería de proyectos).
//
// Archivo INDEPIENDIENTE de projectRepository.js a propósito: cada
// endpoint de "projects" vive en su propio set de archivos
// (repository/service/controller/routes) en vez de acumularse todos
// dentro de projectRepository.js / projectController.js, para que
// cada feature se pueda tocar, testear y revisar por separado sin
// pisar el trabajo de otros compañeros sobre el mismo recurso.
//
// Responsabilidad única: ejecutar la query SQL de la galería contra
// "projects", "gradings" y "users". No contiene lógica de negocio
// (eso vive en getProjectsService.js) ni maneja req/res (eso vive en
// getProjectsController.js).
// ============================================================

const pool = require("../config/db"); // Conexión a Supabase/PostgreSQL ya configurada.

/**
 * (T1 - HU-12) Trae todos los proyectos para la galería, junto con el
 * nombre del coder dueño del proyecto, su calificación (si existe) y
 * el nombre del instructor que calificó.
 *
 * LEFT JOIN a "gradings" y al segundo alias de "users" (instructor)
 * porque un proyecto puede no tener calificación todavía (CA-02: "sin
 * calificar"); con INNER JOIN esos proyectos desaparecerían de la
 * galería en vez de mostrarse al final. El JOIN al coder (dueño del
 * proyecto) sí es INNER, porque "projects.coder_id" es NOT NULL y
 * siempre existe.
 *
 * RN-04 (orden): mejor puntaje primero; en empate, los destacados
 * (starred) primero; los proyectos sin calificar (score IS NULL) van
 * al final. NULLS LAST hace exactamente eso en Postgres. p.id se usa
 * como último criterio solo para que el orden sea estable/determinista
 * entre requests cuando todo lo demás empata.
 *
 * @returns {Promise<Object[]>} Filas crudas del JOIN (snake_case), una
 *   por proyecto. score/starred/graded_by_name vienen null si el
 *   proyecto no ha sido calificado.
 */
async function findAllForGallery() {
  const { rows } = await pool.query(
    `SELECT
        p.id,
        p.title,
        p.description,
        p.image_url,
        p.repo_url,
        p.is_external,
        coder.name AS coder_name,
        g.score,
        g.starred,
        instructor.name AS graded_by_name
       FROM projects p
       JOIN users coder ON coder.id = p.coder_id
       LEFT JOIN gradings g ON g.project_id = p.id
       LEFT JOIN users instructor ON instructor.id = g.instructor_id
      ORDER BY g.score DESC NULLS LAST, g.starred DESC NULLS LAST, p.id ASC`,
  );
  return rows;
}

/**
 * (TL Dashboard) Proyectos SIN calificar de los coders a cargo de un TL.
 * "Sin calificar" = sin registro en gradings (LEFT JOIN ... WHERE g.id IS NULL, CA-03).
 * Trae el nombre del coder dueño y las tecnologias (skills) del proyecto.
 * El tlId sale del token, nunca de la URL (CA-01).
 */
async function findPendingByTl(tlId) {
  const { rows } = await pool.query(
    `SELECT
        p.id,
        p.title,
        p.is_external,
        p.created_at,
        c.name AS coder_name,
        ARRAY_REMOVE(ARRAY_AGG(DISTINCT sk.name), NULL) AS skills
       FROM projects p
       JOIN users c ON c.id = p.coder_id
       LEFT JOIN gradings g ON g.project_id = p.id
       LEFT JOIN project_skills ps ON ps.project_id = p.id
       LEFT JOIN skills sk ON sk.id = ps.skill_id
      WHERE c.tl_id = $1
        AND g.id IS NULL
      GROUP BY p.id, p.title, p.is_external, p.created_at, c.name
      ORDER BY p.created_at DESC`,
    [tlId],
  );
  return rows;
}

module.exports = {
  findAllForGallery,
  findPendingByTl,
};
