// ============================================================
// getProjectByIdRepository.js
// HU-13 · T1 — GET /projects/:id (detalle de un proyecto).
//
// Archivo INDEPENDIENTE de getProjectsRepository.js (galería) y de
// projectRepository.js (crear proyecto): cada endpoint de "projects"
// vive en su propio set de archivos, aunque compartan la misma tabla.
//
// Responsabilidad única: ejecutar la query SQL del detalle contra
// "projects", "users" (coder e instructor), "gradings" y
// "project_skills"/"skills". No contiene lógica de negocio (eso vive
// en getProjectByIdService.js) ni maneja req/res (eso vive en
// getProjectByIdController.js).
// ============================================================

const pool = require("../config/db"); // Conexión a Supabase/PostgreSQL ya configurada.

/**
 * (T1 - HU-13) Trae UN proyecto por id, con todo lo que necesita la
 * pantalla de detalle: quién lo hizo, sus tecnologías y su
 * calificación (si tiene).
 *
 * - JOIN a "users" (coder) es INNER: "projects.coder_id" es NOT NULL
 *   y siempre existe.
 * - LEFT JOIN a "gradings" (y a "users" como instructor): el proyecto
 *   puede no tener calificación todavía (CA-02).
 * - LEFT JOIN a "project_skills"/"skills": el proyecto puede no tener
 *   tecnologías cargadas.
 * - Las tecnologías se agregan con ARRAY_AGG + GROUP BY para devolver
 *   UNA sola fila por proyecto (en vez de una fila por cada
 *   combinación proyecto×tecnología); ARRAY_REMOVE(..., NULL) evita
 *   que un proyecto sin tecnologías devuelva `[null]` en vez de `[]`.
 *   (Mismo patrón que ya usa getProjectsRepository.findPendingByTl,
 *   para mantener consistencia dentro del proyecto.)
 *
 * @param {string|number} id - id del proyecto (ruta /projects/:id).
 * @returns {Promise<Object|undefined>} La fila cruda (snake_case) o
 *   `undefined` si no existe ningún proyecto con ese id (CA-03 -> 404).
 */
async function findProjectById(id) {
  const { rows } = await pool.query(
    `SELECT
        p.id,
        p.title,
        p.description,
        p.image_url,
        p.repo_url,
        p.is_external,
        p.created_at,
        coder.name AS coder_name,
        g.score,
        g.comment,
        g.starred,
        ARRAY_REMOVE(ARRAY_AGG(DISTINCT sk.name), NULL) AS skills
       FROM projects p
       JOIN users coder ON coder.id = p.coder_id
       LEFT JOIN gradings g ON g.project_id = p.id
       LEFT JOIN project_skills ps ON ps.project_id = p.id
       LEFT JOIN skills sk ON sk.id = ps.skill_id
      WHERE p.id = $1
      GROUP BY p.id, coder.name, g.score, g.comment, g.starred`,
    [id],
  );

  return rows[0];
}

module.exports = {
  findProjectById,
};
