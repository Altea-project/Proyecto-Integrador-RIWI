/*  projectService.js
Lógica de negocio de proyectos (el coder sube su proyecto). 
No conoce req/res ni ejecuta SQL. Se encarga de validar los datos, validar las skills (si vienen), crear el proyecto y vincular sus skills.*/

const {
  createProjectWithSkills,
  findSkillsByIds,
  findProjectsByCoderId,
} = require("../repositories/projectRepository");

/* Error de dominio para skills que no existen. Es una clase propia para que el controller lo distinga con "instanceof" y responda 400 en vez de 500.*/
class InvalidSkillsError extends Error {}

/* Crea un proyecto nuevo del coder logueado. 
El proyecto siempre queda vinculado al coder del token (coderId), nunca a un coder_id que venga en el body, así un coder no registra proyectos a nombre de otro.
Si vienen skillIds, valido que todos existan antes de vincularlos; si alguno no existe, no se crea nada.*/
async function createProjectForCoder(coderId, data) {
  const { title, description, repoUrl, imageUrl, isExternal, skillIds } = data;

  /* Si mandaron skills, las valido ANTES de crear el proyecto, así no queda un proyecto huérfano si la lista trae un id inválido.*/
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

  const newProject = await createProjectWithSkills(
    { coderId, title, description, repoUrl, imageUrl, isExternal },
    validSkillIds,
  );

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

async function getMyProjects(coderId) {
  return await findProjectsByCoderId(coderId);
}

module.exports = {
  createProjectForCoder,
  InvalidSkillsError,
  getMyProjects,
};
