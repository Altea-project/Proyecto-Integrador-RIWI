
// Capa de acceso a datos de proyectos. Solo SQL contra las tablas "projects" y "project_skills". La lógica va en projectService.js.


const pool = require("../config/db"); // Conexión a Supabase/PostgreSQL ya configurada.

/*Busca skills por sus ids. 
La uso para validar que todos los skillIds del body existan antes de vincularlos al proyecto, 
así no meto relaciones huérfanas. */

async function findSkillsByIds(skillIds) {
  if (!skillIds || skillIds.length === 0) return [];

  const { rows } = await pool.query(
    `SELECT id, name FROM skills WHERE id = ANY($1::int[])`,
    [skillIds],
  );
  return rows;
}

// Crea un proyecto y vincula sus skills DENTRO de una transacción.
// coder_id siempre viene del backend (req.user.id, del JWT), nunca del body.
// Uso transacción (BEGIN/COMMIT/ROLLBACK) para que, si falla el INSERT de las
// skills, se revierta también la creación del proyecto y no quede uno a medias.

async function createProjectWithSkills(project, skillIds = []) {
  const client = await pool.connect(); // un mismo cliente para toda la transacción
  try {
    await client.query("BEGIN");

    const { rows } = await client.query(
      `INSERT INTO projects (coder_id, title, description, image_url, repo_url, is_external)
          VALUES ($1, $2, $3, $4, $5, $6)
          RETURNING id, coder_id, title, description, image_url, repo_url, is_external, created_at, updated_at`,
      [
        project.coderId,
        project.title,
        project.description,
        project.imageUrl || null,
        project.repoUrl,
        project.isExternal || false,
      ],
    );
    const newProject = rows[0];

    if (skillIds && skillIds.length > 0) {
      // Un solo INSERT con varias filas: unnest convierte el arreglo de ids en filas para cruzarlas con el projectId.
      await client.query(
        `INSERT INTO project_skills (project_id, skill_id)
            SELECT $1, unnest($2::int[])`,
        [newProject.id, skillIds],
      );
    }

    await client.query("COMMIT");
    return newProject;
  } catch (error) {
    await client.query("ROLLBACK"); // algo falló -> deshacer todo
    throw error;
  } finally {
    client.release(); // SIEMPRE devolver el cliente al pool
  }
}

async function findProjectsByCoderId(coderId) {
  const { rows } = await pool.query(
    `SELECT
        p.id, p.coder_id, p.title, p.description, p.image_url,
        p.repo_url, p.is_external, p.created_at, p.updated_at,
        g.score, g.comment, g.starred,
        instructor.name AS graded_by_name,
        COALESCE(
          json_agg(DISTINCT jsonb_build_object('id', s.id, 'name', s.name))
          FILTER (WHERE s.id IS NOT NULL), '[]'
        ) AS skills
      FROM projects p
      LEFT JOIN gradings g ON g.project_id = p.id
      LEFT JOIN users instructor ON instructor.id = g.instructor_id
      LEFT JOIN project_skills ps ON ps.project_id = p.id
      LEFT JOIN skills s ON s.id = ps.skill_id
      WHERE p.coder_id = $1
      GROUP BY p.id, g.score, g.comment, g.starred, instructor.name
      ORDER BY p.created_at DESC`,
    [coderId],
  );

  return rows.map((row) => ({
    id: row.id,
    coder_id: row.coder_id,
    title: row.title,
    description: row.description,
    image_url: row.image_url,
    repo_url: row.repo_url,
    is_external: row.is_external,
    created_at: row.created_at,
    updated_at: row.updated_at,
    graded: row.score !== null,
    score: row.score,
    comment: row.comment,
    starred: row.starred || false,
    gradedBy: row.graded_by_name ? { name: row.graded_by_name } : null,
    skills: row.skills,
  }));
}

module.exports = {
  findSkillsByIds,
  createProjectWithSkills,
  findProjectsByCoderId,
};
