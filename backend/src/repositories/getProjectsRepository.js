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
 * (T1 - HU-12) Trae todos los proyectos para la galería, junto con su
 * calificación (si existe) y el nombre del instructor que calificó.
 *
 * LEFT JOIN a "gradings" y "users" porque un proyecto puede no tener
 * calificación todavía (CA-02: "sin calificar"); con INNER JOIN esos
 * proyectos desaparecerían de la galería en vez de mostrarse al final.
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
        g.score,
        g.starred,
        instructor.name AS graded_by_name
       FROM projects p
       LEFT JOIN gradings g ON g.project_id = p.id
       LEFT JOIN users instructor ON instructor.id = g.instructor_id
      ORDER BY g.score DESC NULLS LAST, g.starred DESC NULLS LAST, p.id ASC`,
  );
  return rows;
}

module.exports = {
  findAllForGallery,
};
