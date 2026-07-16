// ============================================================
// gradingController.js
// Controller de calificaciones (HU-06). Lee req/res, valida forma
// mínima, delega al service y traduce errores de dominio a HTTP.
// No contiene lógica de negocio ni SQL.
// ============================================================

const gradingService = require("../services/gradingService");

/**
 * POST /gradings — T2 (#80)
 * Body: { projectId, score, comment?, starred? }
 * El instructorId sale del token (req.user.id), nunca del body.
 * Respuestas: 201 | 400 | 403 | 404 | 401 (verifyToken) | 500
 */
async function createGrading(req, res, next) {
  try {
    const instructorId = req.user.id;
    const { projectId, score, comment, starred } = req.body || {};

    const grading = await gradingService.createGrading(instructorId, {
      projectId,
      score,
      comment,
      starred,
    });

    return res.status(201).json({ success: true, data: { grading } });
  } catch (error) {
    return handleGradingError(error, res, next);
  }
}

/**
 * PATCH /gradings/:id — T3 (#81)
 * Body: { score?, comment?, starred? } (actualización parcial)
 * Respuestas: 200 | 400 | 403 | 404 | 401 | 500
 */
async function updateGrading(req, res, next) {
  try {
    const instructorId = req.user.id;
    const gradingId = Number(req.params.id);
    const { score, comment, starred } = req.body || {};

    if (!Number.isInteger(gradingId) || gradingId <= 0) {
      return res.status(400).json({
        success: false,
        error: "El id de la calificación no es válido",
      });
    }

    const grading = await gradingService.updateGradingById(instructorId, gradingId, {
      score,
      comment,
      starred,
    });

    return res.status(200).json({ success: true, data: { grading } });
  } catch (error) {
    return handleGradingError(error, res, next);
  }
}

// Traduce los errores de dominio del service a códigos HTTP.
function handleGradingError(error, res, next) {
  if (error instanceof gradingService.ValidationError) {
    return res.status(400).json({ success: false, error: error.message });
  }
  if (error instanceof gradingService.NotFoundError) {
    return res.status(404).json({ success: false, error: error.message });
  }
  if (error instanceof gradingService.ForbiddenGradingError) {
    return res.status(403).json({ success: false, error: error.message });
  }
  return next(error);
}

module.exports = { createGrading, updateGrading };
