// ============================================================
// gradingRoutes.js
// Rutas HTTP de calificaciones (HU-06). Solo un instructor autenticado
// puede calificar; la validación de que sea EL TL del coder vive en el
// service. No contiene lógica propia.
// ============================================================

const express = require("express");
const { createGrading, updateGrading } = require("../controllers/gradingController");
const verifyToken = require("../middlewares/verifyToken");
const requireRole = require("../middlewares/requireRole");

const router = express.Router();

// POST /gradings — T2 (#80): un instructor califica el proyecto de su coder.
router.post("/gradings", verifyToken, requireRole("instructor"), createGrading);

// PATCH /gradings/:id — T3 (#81): actualizar una calificación existente.
router.patch("/gradings/:id", verifyToken, requireRole("instructor"), updateGrading);

module.exports = router;
