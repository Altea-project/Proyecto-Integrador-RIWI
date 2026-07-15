// ============================================================
// projectRepository.js
// este archivo contiene la Capa de acceso a datos para proyectos.
// Responsabilidad única: ejecutar queries SQL contra las tablas
// "projects" y "project_skills". No contiene lógica de negocio
// (eso vive en projectService.js) ni maneja req/res (eso vive en
// projectController.js).
// ============================================================

const pool = require("../config/db"); // Conexión a Supabase/PostgreSQL ya configurada.

/**
 * Busca varios skills por sus ids. Se usa para validar que todos los
 * skillIds enviados en el body existan antes de vincularlos al
 * proyecto (project_skills), evitando insertar relaciones "huérfanas".
 *
 * @param {number[]} skillIds - Ids de skills a validar.
 * @returns {Promise<Object[]>} Filas { id, name } de los skills que sí existen.
 */
async function findSkillsByIds(skillIds) {
  if (!skillIds || skillIds.length === 0) return [];

  const { rows } = await pool.query(
    `SELECT id, name FROM skills WHERE id = ANY($1::int[])`,
    [skillIds],
  );
  return rows;
}

/**
 * Crea un proyecto y vincula sus skills DENTRO de una transacción.
 * coder_id siempre viene del backend (req.user.id, extraído del JWT
 * por verifyToken), nunca del body.
 *
 * Al usar una transacción (BEGIN/COMMIT/ROLLBACK) con un mismo client,
 * si el INSERT de project_skills falla justo después de crear el
 * proyecto, se revierte también la creación del proyecto -> nunca
 * queda un proyecto "a medias" (sin sus skills).
 *
 * @param {Object} project - Datos del proyecto a crear.
 * @param {number} project.coderId - Id del coder dueño del proyecto (del JWT).
 * @param {string} project.title
 * @param {string} project.description
 * @param {string} project.repoUrl
 * @param {string} [project.imageUrl]
 * @param {boolean} [project.isExternal=false]
 * @param {number[]} [skillIds=[]] - Ids de skills (ya validados) a vincular.
 * @returns {Promise<Object>} El proyecto recién creado.
 */
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
      // Un solo INSERT con varias filas: unnest convierte el arreglo de
      // ids en filas para cruzarlas con el projectId.
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

module.exports = {
  findSkillsByIds,
  createProjectWithSkills,
};
