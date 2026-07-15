// ============================================================
// projectService.js
// Lógica de negocio para la creación de proyectos (T1).
// Esta capa NO conoce req/res (responsabilidad del controller) ni
// ejecuta queries SQL directas (responsabilidad del repository).
// Orquesta: crear el proyecto, resolver sus tecnologías (crearlas
// si no existen en el catálogo) y vincularlas al proyecto.
// ============================================================

const {
    createProject: createProjectInDb,
    findSkillsByNames,
    createSkills,
    linkProjectSkills,
} = require('../repositories/projectRepository');

/**
 * Error de dominio para datos de proyecto inválidos (CA-01).
 * El controller la distingue con "instanceof" para responder 400
 * en vez de dejar que caiga al manejador genérico (500).
 */
class InvalidProjectDataError extends Error {}

/**
 * Quita duplicados y espacios en blanco de la lista de tecnologías
 * recibida desde el formulario.
 *
 * @param {string[]} technologies
 * @returns {string[]}
 */
function normalizeTechnologies(technologies) {
    const cleaned = technologies
        .map((t) => (typeof t === 'string' ? t.trim() : ''))
        .filter((t) => t.length > 0);

    // Set elimina duplicados (ej. ["React", "react"] no debe crear 2 skills).
    return [...new Set(cleaned.map((t) => t))];
}

/**
 * Resuelve los nombres de tecnologías a ids de la tabla "skills":
 * reutiliza las que ya existen y crea las que falten en el catálogo.
 *
 * @param {string[]} names - Nombres de tecnologías ya normalizados.
 * @returns {Promise<number[]>} Ids de skills a vincular al proyecto.
 */
async function resolveSkillIds(names) {
    const existing = await findSkillsByNames(names);
    const existingNames = new Set(existing.map((s) => s.name.toLowerCase()));

    const missingNames = names.filter((n) => !existingNames.has(n.toLowerCase()));
    const created = await createSkills(missingNames);

    return [...existing, ...created].map((s) => s.id);
}

/**
 * Ejecuta el flujo completo de creación de un proyecto (HU "subir
 * proyecto", T1): valida los datos mínimos (CA-01), crea el registro
 * en "projects" vinculado al coder autenticado, y asocia las
 * tecnologías indicadas.
 *
 * @param {Object} data
 * @param {number} data.coderId - Id del coder autenticado (viene del JWT, no del body).
 * @param {string} data.title - Nombre del proyecto.
 * @param {string} data.description
 * @param {string} data.repoUrl - Enlace al repositorio.
 * @param {string} [data.imageUrl] - URL de la imagen.
 * @param {string[]} data.technologies - Lista de tecnologías utilizadas (mínimo 1).
 * @returns {Promise<Object>} El proyecto creado, con sus tecnologías y estado de calificación.
 * @throws {InvalidProjectDataError} Si falta algún campo obligatorio (CA-01).
 */
async function createProject({ coderId, title, description, repoUrl, imageUrl, technologies }) {
    // CA-01: nombre, descripción, enlace al repo y al menos una tecnología.
    if (!title || !description || !repoUrl) {
        throw new InvalidProjectDataError('Nombre, descripción y enlace al repositorio son obligatorios');
    }

    const normalizedTechnologies = normalizeTechnologies(Array.isArray(technologies) ? technologies : []);
    if (normalizedTechnologies.length === 0) {
        throw new InvalidProjectDataError('Debes indicar al menos una tecnología utilizada');
    }

    const project = await createProjectInDb({ coderId, title, description, repoUrl, imageUrl });

    const skillIds = await resolveSkillIds(normalizedTechnologies);
    await linkProjectSkills(project.id, skillIds);

    // CA-02: el proyecto recién creado nunca tiene calificación todavía,
    // por eso el badge siempre nace en "unrated" (el frontend lo muestra
    // como "Sin calificar" en el perfil y en la galería).
    return {
        id: project.id,
        coderId: project.coder_id,
        title: project.title,
        description: project.description,
        repoUrl: project.repo_url,
        imageUrl: project.image_url,
        technologies: normalizedTechnologies,
        ratingStatus: 'unrated',
        createdAt: project.created_at,
    };
}

module.exports = { createProject, InvalidProjectDataError };
