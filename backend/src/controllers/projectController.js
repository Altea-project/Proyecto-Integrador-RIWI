// ============================================================
// projectController.js
// Controller de proyectos.
// Responsabilidad única: leer la petición HTTP (req), validar lo
// mínimo de forma (campos presentes, tipos básicos), delegar la
// lógica real al service, y traducir el resultado a una respuesta
// HTTP (res). No contiene lógica de negocio ni queries SQL.
// ============================================================

const projectService = require("../services/projectService");

/**
 * POST /projects
 *
 * Ruta protegida: solo un coder autenticado puede crear un proyecto
 * (ver projectRoutes.js: verifyToken + requireRole('coder')).
 * El coder_id NUNCA se toma del body -- siempre se toma de req.user.id,
 * que verifyToken adjuntó al decodificar el JWT. Esto evita que un
 * coder cree un proyecto a nombre de otro usuario.
 *
 * Body esperado:
 * {
 *   title: string,          (obligatorio)
 *   description: string,    (obligatorio)
 *   repoUrl: string,        (obligatorio)
 *   imageUrl?: string,      (opcional)
 *   isExternal?: boolean,   (opcional, default false)
 *   skillIds?: number[]     (opcional, ids de la tabla skills)
 * }
 *
 * Respuestas posibles:
 * - 201: proyecto creado -> { success: true, data: { project } }
 * - 400: faltan campos obligatorios, o algún skillId no existe -> { success: false, error }
 * - 401: token no enviado / inválido / expirado (lo maneja verifyToken, antes de llegar acá)
 * - 403: el usuario autenticado no tiene rol "coder" (lo maneja requireRole)
 * - 500: error inesperado -> delega al manejador de errores centralizado
 */
async function createProject(req, res, next) {
  try {
    const { title, description, repoUrl, imageUrl, isExternal, skillIds } =
      req.body || {};

    // Validación de forma: campos mínimos obligatorios para crear un
    // proyecto (ver schema.sql: title, description y repo_url son
    // NOT NULL). El resto de reglas (skills existentes) son de
    // negocio y viven en el service.
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

    // coderId siempre sale del token (req.user.id), nunca del body.
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
    const projects = await projectService.getMyProjects(coderId); // misma función, distinto id
    return res.status(200).json({ success: true, data: { projects } });
  } catch (error) {
    next(error);
  }
}

module.exports = { createProject, getMyProjects, getProjectsByUserId };
