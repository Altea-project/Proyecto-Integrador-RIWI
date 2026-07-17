// ============================================================
// projectRoutes.js
// este archivo define las rutas HTTP relacionadas a proyectos y las
// conecta con su controller correspondiente (projectController).
// No contiene lógica propia.
// ============================================================

const express = require("express");
const { createProject } = require("../controllers/projectController");
const verifyToken = require("../middlewares/verifyToken");
const requireRole = require("../middlewares/requireRole");

const router = express.Router();

// POST /projects — un coder autenticado sube su proyecto. verifyToken
// identifica quién es (adjunta req.user); requireRole('coder') decide
// si tiene permiso (solo el rol coder puede subir proyectos). El
// coder_id del proyecto se toma de req.user.id dentro del controller,
// nunca del body (ver projectController.createProject).
router.post("/projects", verifyToken, requireRole("coder"), createProject);

module.exports = router;
