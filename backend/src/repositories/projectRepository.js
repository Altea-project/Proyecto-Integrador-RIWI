// ============================================================
// projectRepository.js
// Capa de acceso a datos para proyectos (T1 de HU "subir proyecto").
// Responsabilidad única: ejecutar queries SQL contra "projects",
// "skills" y "project_skills". No contiene lógica de negocio (eso
// vive en projectService.js) ni maneja req/res (projectController.js).
// ============================================================

const pool = require('../config/db'); // Conexión a Supabase/PostgreSQL ya configurada.

/**
 * Inserta un proyecto nuevo, vinculado al coder autenticado.
 *
 * @param {Object} data
 * @param {number} data.coderId - Id del coder dueño del proyecto (viene del JWT).
 * @param {string} data.title - Nombre del proyecto.
 * @param {string} data.description
 * @param {string} data.repoUrl - Enlace al repositorio.
 * @param {string} [data.imageUrl] - URL de la imagen (opcional según schema).
 * @returns {Promise<Object>} El proyecto recién creado.
 */
async function createProject({ coderId, title, description, repoUrl, imageUrl }) {
    const { rows } = await pool.query(
        `INSERT INTO projects (coder_id, title, description, repo_url, image_url)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, coder_id, title, description, repo_url, image_url, created_at, updated_at`,
        [coderId, title, description, repoUrl, imageUrl || null]
    );
    return rows[0];
}

/**
 * Busca las tecnologías (skills) existentes cuyo nombre coincida (case-insensitive)
 * con los nombres recibidos.
 *
 * @param {string[]} names - Nombres de tecnologías enviados en el formulario.
 * @returns {Promise<Array<{id:number, name:string}>>}
 */
async function findSkillsByNames(names) {
    const { rows } = await pool.query(
        `SELECT id, name FROM skills WHERE LOWER(name) = ANY($1)`,
        [names.map((n) => n.toLowerCase())]
    );
    return rows;
}

/**
 * Crea las tecnologías que aún no existen en el catálogo "skills".
 * Se usa junto a findSkillsByNames para no duplicar tecnologías ya creadas.
 *
 * @param {string[]} names - Nombres de tecnologías a insertar.
 * @returns {Promise<Array<{id:number, name:string}>>}
 */
async function createSkills(names) {
    if (names.length === 0) return [];

    // INSERT múltiple con placeholders dinámicos ($1, $2, ...).
    const values = names.map((_, i) => `($${i + 1})`).join(', ');
    const { rows } = await pool.query(
        `INSERT INTO skills (name) VALUES ${values} RETURNING id, name`,
        names
    );
    return rows;
}

/**
 * Vincula un proyecto con sus tecnologías en la tabla puente project_skills.
 *
 * @param {number} projectId
 * @param {number[]} skillIds
 */
async function linkProjectSkills(projectId, skillIds) {
    if (skillIds.length === 0) return;

    // Un solo INSERT con varias filas en vez de un query por skill.
    const values = skillIds.map((_, i) => `($1, $${i + 2})`).join(', ');
    await pool.query(
        `INSERT INTO project_skills (project_id, skill_id) VALUES ${values}`,
        [projectId, ...skillIds]
    );
}

module.exports = { createProject, findSkillsByNames, createSkills, linkProjectSkills };
