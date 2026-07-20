
/* GET /projects/:id (detalle de un proyecto).
Es un archivo aparte de getProjectsRepository.js (galería) y de projectRepository.js (crear): cada endpoint de "projects" tiene sus propios
archivos aunque compartan la tabla, así cada uno lo puede tocar sin pisar el trabajo de otro compañero. 
Solo ejecuta SQL, sin lógica ni req/res. */

const pool = require("../config/db"); // Conexión a Supabase/PostgreSQL ya configurada.

/*
Trae UN proyecto por id con todo lo que necesita la pantalla de detalle:
quién lo hizo, sus tecnologías y su calificación (si tiene).
- JOIN a users (coder) es INNER porque coder_id es NOT NULL.
- LEFT JOIN a gradings porque puede no estar calificado todavía.
- LEFT JOIN a project_skills/skills porque puede no tener tecnologías.
- Uso ARRAY_AGG + GROUP BY para devolver UNA fila por proyecto (si no, saldría una fila por cada tecnología). ARRAY_REMOVE(..., NULL) hace que un
proyecto sin tecnologías devuelva [] en vez de [null].
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
