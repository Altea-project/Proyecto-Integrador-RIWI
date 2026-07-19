

// GET /projects (galería de proyectos) - HU-12.
// Es un archivo aparte de projectRepository.js a propósito: cada endpoint de
// "projects" tiene su propio repository/service/controller/routes, así cada
// feature se puede tocar y revisar por separado sin pisar a otro compañero.
// Solo ejecuta SQL, sin lógica de negocio ni req/res.

const pool = require("../config/db"); // Conexión a Supabase/PostgreSQL ya configurada.

// Trae todos los proyectos para la galería, con el nombre del coder dueño, su
// calificación (si tiene) y el nombre del instructor que calificó.
// Uso LEFT JOIN a gradings y al instructor porque un proyecto puede no estar
// calificado (con INNER JOIN esos proyectos desaparecerían). El JOIN al coder
// sí es INNER porque coder_id es NOT NULL.
// Orden (RN-04): mejor puntaje primero; en empate, los destacados primero; los
// sin calificar van al final (NULLS LAST). p.id al final solo para que el orden
// sea estable entre requests cuando todo lo demás empata.
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

/* Dashboard del TL: proyectos SIN calificar de los coders a su cargo.
"Sin calificar" = sin registro en gradings (LEFT JOIN ... WHERE g.id IS NULL).
Trae el nombre del coder y las tecnologías del proyecto. El tlId sale del token, nunca de la URL. */

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
