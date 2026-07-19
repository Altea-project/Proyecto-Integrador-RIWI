
/* Rutas de calificaciones . 
Solo un instructor logueado puede calificar; que sea EL TL del coder lo valida el service. 
No tiene lógica propia. */

const express = require("express");
const { createGrading, updateGrading } = require("../controllers/gradingController");
const verifyToken = require("../middlewares/verifyToken");
const requireRole = require("../middlewares/requireRole");

const router = express.Router();

// POST /gradings — un instructor califica el proyecto de su coder.
router.post("/gradings", verifyToken, requireRole("instructor"), createGrading);

// PATCH /gradings/:id — actualizar una calificación existente.
router.patch("/gradings/:id", verifyToken, requireRole("instructor"), updateGrading);

module.exports = router;
