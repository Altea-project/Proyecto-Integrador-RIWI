
// Controller de proyectos. Lee req, valida la forma (campos presentes, tipos),
// llama al service y arma la respuesta. No tiene lógica de negocio ni SQL.

const projectService = require("../services/projectService");

// POST /projects
// Solo un coder logueado puede crear un proyecto (ruta con verifyToken +
// requireRole('coder')). El coder_id NUNCA sale del body, siempre de
// req.user.id, para que un coder no cree proyectos a nombre de otro.

// Body: { title, description, repoUrl, imageUrl?, isExternal?, skillIds? }
async function createProject(req, res, next) {
  try {
    const { title, description, repoUrl, imageUrl, isExternal, skillIds } =
      req.body || {};

    // Valido los campos obligatorios (en el schema title, description y repo_url son NOT NULL). 
    // Que las skills existan lo valida el service.
    if (!title || !description || !repoUrl) {
      return res.status(400).json({
        success: false,
        error: "title, description y repoUrl son obligatorios",
      });
    }

    if (skillIds !== undefined) {
      const isValidSkillIds =
        Array.isArray(skillIds) &&
        skillIds.every((id) => Number.isInteger(id) && id > 0);
      if (!isValidSkillIds) {
        return res.status(400).json({
          success: false,
          error: "skillIds debe ser un arreglo de ids numéricos válidos",
        });
      }
    }

    // coderId siempre del token, nunca del body.
    const coderId = req.user.id;

    const project = await projectService.createProjectForCoder(coderId, {
      title,
      description,
      repoUrl,
      imageUrl,
      isExternal,
      skillIds,
    });

    return res.status(201).json({
      success: true,
      data: { project },
    });
  } catch (error) {
    if (error instanceof projectService.InvalidSkillsError) {
      return res.status(400).json({ success: false, error: error.message });
    }

    next(error);
  }
}

async function getMyProjects(req, res, next) {
  try {
    const coderId = req.user.id;
    const projects = await projectService.getMyProjects(coderId);
    return res.status(200).json({ success: true, data: { projects } });
  } catch (error) {
    next(error);
  }
}

async function getProjectsByUserId(req, res, next) {
  try {
    const coderId = Number(req.params.id);
    const projects = await projectService.getMyProjects(coderId); // misma función, otro id
    return res.status(200).json({ success: true, data: { projects } });
  } catch (error) {
    next(error);
  }
}

module.exports = { createProject, getMyProjects, getProjectsByUserId };
