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
 * Inserta un nuevo proyecto en la tabla "projects".
 * coder_id siempre viene del backend (req.user.id, extraído del JWT
 * por verifyToken), nunca del body -- así un coder nunca puede crear
 * un proyecto "a nombre de" otro coder.
 *
 * @param {Object} project - Datos del proyecto a crear.
 * @param {number} project.coderId - Id del coder dueño del proyecto (del JWT).
 * @param {string} project.title
 * @param {string} project.description
 * @param {string} project.repoUrl
 * @param {string} [project.imageUrl]
 * @param {boolean} [project.isExternal=false]
 * @returns {Promise<Object>} El proyecto recién creado.
 */
async function createProject(project) {
  const { rows } = await pool.query(
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
  return rows[0];
}

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
 * Vincula un proyecto con una lista de skills (tabla puente project_skills,
 * relación N:M -- ver schema.sql sección 5).
 * Se ejecuta después de crear el proyecto y de validar (en el service)
 * que todos los skillIds existan.
 *
 * @param {number} projectId - Id del proyecto recién creado.
 * @param {number[]} skillIds - Ids de skills a vincular.
 * @returns {Promise<void>}
 */
async function linkSkillsToProject(projectId, skillIds) {
  if (!skillIds || skillIds.length === 0) return;

  // Un solo INSERT con varias filas (más eficiente que un INSERT por skill).
  // unnest() convierte el arreglo de ids en filas para poder cruzarlas
  // con el projectId en un solo INSERT ... SELECT.
  await pool.query(
    `INSERT INTO project_skills (project_id, skill_id)
        SELECT $1, unnest($2::int[])`,
    [projectId, skillIds],
  );
}

module.exports = {
  createProject,
  findSkillsByIds,
  linkSkillsToProject,
};
