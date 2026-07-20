
/* GET /projects/:id (detalle de un proyecto).
Es un archivo aparte de getProjectsRoutes.js (galería) y de projectRoutes.js (crear).
OJO con el orden de montaje: "/projects/:id" es comodín, Express la hace coincidir con CUALQUIER segmento después de "/projects/", incluido "pending".
Como getProjectsRoutes.js ya define GET /projects/pending, este router se monta en app.js DESPUÉS, así "pending" se resuelve en su router y nunca se confunde con un id. */

const express = require("express");
const { getProjectById } = require("../controllers/getProjectByIdController");
const verifyToken = require("../middlewares/verifyToken");

const router = express.Router();

// GET /projects/:id — detalle de un proyecto, visible para cualquier usuario logueado (por eso no lleva requireRole).

router.get("/projects/:id", verifyToken, getProjectById);

module.exports = router;
