// ============================================================
// projectService.js
// Lógica de negocio de proyectos (HU: coder sube su proyecto).
// Esta capa NO conoce req/res (responsabilidad del controller) ni
// ejecuta queries SQL directas (responsabilidad del repository).
// Orquesta: validar los datos de negocio, validar los skills (si
// vienen), crear el proyecto y vincular sus skills.
// ============================================================

const {
  createProject,
  findSkillsByIds,
  linkSkillsToProject,
} = require("../repositories/projectRepository");

/**
 * Error de dominio para skills inexistentes.
 * Se define como clase propia (en vez de un Error genérico) para que
 * el controller pueda distinguirlo de errores inesperados (ej. caída
 * de la base de datos) usando "instanceof", y responder 400 en vez
 * de 500.
 */
class InvalidSkillsError extends Error {}

/**
 * Crea un proyecto nuevo asociado al coder autenticado.
 *
 * CA: el proyecto siempre queda vinculado al coder dueño del token
 * (coderId), nunca a un coder_id enviado por el cliente en el body
 * -- así se evita que un coder registre proyectos a nombre de otro.
 *
 * Si vienen skillIds, se valida que todos existan en la tabla
 * "skills" antes de vincularlos (project_skills); si alguno no
 * existe, no se crea nada (falla la operación completa).
 *
 * @param {number} coderId - Id del coder autenticado (viene de req.user.id, del JWT).
 * @param {Object} data
 * @param {string} data.title
 * @param {string} data.description
 * @param {string} data.repoUrl
 * @param {string} [data.imageUrl]
 * @param {boolean} [data.isExternal=false]
 * @param {number[]} [data.skillIds] - Ids de skills a vincular con el proyecto.
 * @returns {Promise<Object>} El proyecto creado, con sus skillIds vinculados.
 * @throws {InvalidSkillsError} Si algún skillId enviado no existe.
 */
async function createProjectForCoder(coderId, data) {
  const { title, description, repoUrl, imageUrl, isExternal, skillIds } = data;

  // Si se enviaron skills, se validan ANTES de crear el proyecto:
  // así evitamos crear un proyecto "huérfano" si la lista de skills
  // trae un id inválido.
  let validSkillIds = [];
  if (skillIds && skillIds.length > 0) {
    const uniqueSkillIds = [...new Set(skillIds.map(Number))];
    const foundSkills = await findSkillsByIds(uniqueSkillIds);

    if (foundSkills.length !== uniqueSkillIds.length) {
      const foundIds = foundSkills.map((skill) => skill.id);
      const missingIds = uniqueSkillIds.filter((id) => !foundIds.includes(id));
      throw new InvalidSkillsError(
        `Los siguientes skillIds no existen: ${missingIds.join(", ")}`,
      );
    }

    validSkillIds = uniqueSkillIds;
  }

  const newProject = await createProject({
    coderId,
    title,
    description,
    repoUrl,
    imageUrl,
    isExternal,
  });

  if (validSkillIds.length > 0) {
    await linkSkillsToProject(newProject.id, validSkillIds);
  }

  return {
    id: newProject.id,
    coderId: newProject.coder_id,
    title: newProject.title,
    description: newProject.description,
    imageUrl: newProject.image_url,
    repoUrl: newProject.repo_url,
    isExternal: newProject.is_external,
    skillIds: validSkillIds,
    createdAt: newProject.created_at,
    updatedAt: newProject.updated_at,
  };
}

module.exports = {
  createProjectForCoder,
  InvalidSkillsError,
};
