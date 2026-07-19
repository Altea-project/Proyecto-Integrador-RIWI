
// Controller de usuarios (HU-01: registro por el admin, y demás acciones).
// Solo lee la petición, valida que estén los campos, delega en el service y arma la respuesta. No tiene lógica de negocio ni queries.

const authService = require("../services/authService");

// POST /users
// Solo el admin puede crear usuarios (lo garantiza la ruta con verifyToken +
// requireRole('admin')). Body: { name, email, role, phone?, document?, company? }.
// 201 si se crea, 400 si faltan campos o el rol no existe, 409 si el email o documento ya existen.
async function registerUser(req, res, next) {
  try {
    const { name, email, role, phone, document, company } = req.body;

    // Solo valido que vengan los campos mínimos. 
    // El resto (rol válido, email/documento únicos) lo valida el service.
    if (!name || !email || !role) {
      return res.status(400).json({
        success: false,
        error: "name, email y role son obligatorios",
      });
    }

    const result = await authService.registerUser({
      name,
      email,
      role,
      phone,
      document,
      company,
    });

    return res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    if (error instanceof authService.RoleNotFoundError) {
      return res.status(400).json({ success: false, error: error.message });
    }

    if (
      error instanceof authService.EmailAlreadyExistsError ||
      error instanceof authService.DocumentAlreadyExistsError
    ) {
      return res.status(409).json({ success: false, error: error.message });
    }

    next(error);
  }
}

// GET /users
// Solo el admin. Devuelve la lista completa de usuarios.
async function getAllUsers(req, res, next) {
  try {
    const users = await authService.getAllUsers();
    return res.status(200).json({
      success: true,
      data: { users },
    });
  } catch (error) {
    next(error);
  }
}

// PATCH /users/:id/assign-tl
// Solo admin. Asigna un TL (instructor) a un usuario.
// :id = usuario que recibe el TL. Body: { tlId }.
async function assignTl(req, res, next) {
  try {
    const userId = Number(req.params.id);
    const { tlId } = req.body || {};

    // Validacion de forma (igual estilo que registerUser).
    if (!tlId) {
      return res.status(400).json({
        success: false,
        error: "Debes enviar el tlId (id del instructor a asignar como TL)",
      });
    }
    if (
      !Number.isInteger(userId) ||
      userId <= 0 ||
      !Number.isInteger(Number(tlId)) ||
      Number(tlId) <= 0
    ) {
      return res.status(400).json({
        success: false,
        error: "El id del usuario y el tlId deben ser numeros validos",
      });
    }

    const user = await authService.assignTl(userId, Number(tlId));

    return res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (error) {
    if (error instanceof authService.UserNotFoundError) {
      return res.status(404).json({ success: false, error: error.message });
    }
    if (error instanceof authService.InvalidTlError) {
      return res.status(400).json({ success: false, error: error.message });
    }
    next(error);
  }
}

// GET /users/me
// Ruta protegida. Devuelve el perfil completo del usuario logueado, incluido
// availability_status (que es lo que el dashboard del coder usa para el badge).
// Es solo lectura: por aca no se cambia el estado, eso lo hace el TL/admin.
async function getMyProfile(req, res, next) {
  try {
    const user = await authService.getMyProfile(req.user.id);

    return res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (error) {
    if (error instanceof authService.UserNotFoundError) {
      return res.status(404).json({ success: false, error: error.message });
    }

    next(error);
  }
}

// PATCH /users/:id/status
// Cambia el estado de disponibilidad de un usuario.
async function updateStatus(req, res, next) {
  try {
    const targetUserId = Number(req.params.id);
    const { status } = req.body || {};

    if (!Number.isInteger(targetUserId) || targetUserId <= 0) {
      return res.status(400).json({
        success: false,
        error: "El id del usuario no es válido",
      });
    }

    const user = await authService.changeAvailabilityStatus(
      req.user,
      targetUserId,
      status,
    );

    return res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (error) {
    if (error instanceof authService.InvalidStatusError) {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }

    if (error instanceof authService.UserNotFoundError) {
      return res.status(404).json({
        success: false,
        error: error.message,
      });
    }

    if (error instanceof authService.ForbiddenStatusError) {
      return res.status(403).json({
        success: false,
        error: error.message,
      });
    }

    next(error);
  }
}

// GET /users/:id/public
// Perfil público de un coder, visible para cualquier usuario logueado.
async function getPublicProfile(req, res, next) {
  try {
    const userId = Number(req.params.id);
    const user = await authService.getMyProfile(userId);

    // El perfil público es solo para coders (HU-13). Si el id es de otro rol
    // (admin, instructor, recruiter) no hay perfil que mostrar -> 404.
    if (!user || user.roleName !== "coder") {
      return res.status(404).json({
        success: false,
        error: "Perfil no encontrado.",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          roleName: user.roleName,
          avatarUrl: user.avatarUrl,
          availabilityStatus: user.availabilityStatus,
          tlName: user.tlName,
        },
      },
    });
  } catch (error) {
    if (error instanceof authService.UserNotFoundError) {
      return res.status(404).json({
        success: false,
        error: error.message,
      });
    }

    next(error);
  }
}

// PATCH /users/:id
// Solo admin. Edita los datos de un usuario (modal "Editar miembro").
// Las validaciones de negocio (rol válido, email/documento únicos, company
// solo para reclutador) las hace el service. No se toca password ni id.
async function updateUserController(req, res, next) {
  try {
    const userId = Number(req.params.id);
    if (!Number.isInteger(userId) || userId <= 0) {
      return res.status(400).json({
        success: false,
        error: "El id del usuario no es válido",
      });
    }

    const { name, email, role, phone, document, company } = req.body || {};

    const user = await authService.updateUser(userId, {
      name,
      email,
      role,
      phone,
      document,
      company,
    });

    return res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (error) {
    if (error instanceof authService.UserNotFoundError) {
      return res.status(404).json({ success: false, error: error.message });
    }
    if (error instanceof authService.RoleNotFoundError) {
      return res.status(400).json({ success: false, error: error.message });
    }
    if (
      error instanceof authService.EmailAlreadyExistsError ||
      error instanceof authService.DocumentAlreadyExistsError
    ) {
      return res.status(409).json({ success: false, error: error.message });
    }
    next(error);
  }
}

// DELETE /users/:id
// Solo admin. Elimina un usuario (modal "Delete Member"). El service valida
// que el usuario exista y que el admin no se borre a sí mismo.
async function deleteUserController(req, res, next) {
  try {
    const userId = Number(req.params.id);
    if (!Number.isInteger(userId) || userId <= 0) {
      return res.status(400).json({
        success: false,
        error: "El id del usuario no es válido",
      });
    }

    await authService.deleteUser(userId, req.user);

    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    if (error instanceof authService.UserNotFoundError) {
      return res.status(404).json({ success: false, error: error.message });
    }
    if (error instanceof authService.ForbiddenStatusError) {
      return res.status(403).json({ success: false, error: error.message });
    }
    next(error);
  }
}

module.exports = {
  registerUser,
  assignTl,
  getMyProfile,
  getAllUsers,
  updateStatus,
  getPublicProfile,
  updateUserController,
  deleteUserController,
};
