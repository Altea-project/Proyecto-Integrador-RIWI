
// GET /projects (galería de proyectos) 
/* Es un archivo aparte de projectRoutes.js a propósito: no comparte código con crear proyecto, solo el mismo recurso ("/projects"). 
Los dos routers se montan bajo "/api", así que para quien consume la API sigue siendo el mismo GET /api/projects de siempre. 
No tiene lógica propia.*/

const express = require("express");
const requireRole = require("../middlewares/requireRole");
const { getProjects, getPendingProjects } = require("../controllers/getProjectsController");
const verifyToken = require("../middlewares/verifyToken");

const router = express.Router();

/* GET /projects: galería visible para cualquier usuario logueado (por eso no lleva requireRole). 
Devuelve todos los proyectos con su calificación (si tienen) y el nombre del TL que calificó, ya ordenados según RN-04. */

router.get("/projects", verifyToken, getProjects);

// GET /projects/pending — dashboard del TL: proyectos sin calificar de sus coders. Solo instructor.
router.get("/projects/pending", verifyToken, requireRole("instructor"), getPendingProjects);

module.exports = router;
