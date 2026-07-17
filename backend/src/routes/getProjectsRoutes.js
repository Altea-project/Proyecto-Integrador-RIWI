// ============================================================
// getProjectsRoutes.js
// HU-12 · T1 — GET /projects (galería de proyectos).
//
// Archivo INDEPENDIENTE de projectRoutes.js a propósito (ver nota en
// getProjectsRepository.js): esta feature no comparte código con
// createProject, solo comparte el mismo recurso HTTP ("/projects").
// Ambos routers se montan bajo el mismo prefijo "/api" en app.js, así
// que para quien consume la API el endpoint sigue siendo el único
// GET /api/projects de siempre.
//
// No contiene lógica propia.
// ============================================================

const express = require("express");
const { getProjects } = require("../controllers/getProjectsController");
const verifyToken = require("../middlewares/verifyToken");

const router = express.Router();

// GET /projects — HU-12 · T1: galería de proyectos, visible para
// cualquier usuario autenticado (sin restricción de rol, por eso no
// lleva requireRole). Devuelve todos los proyectos con su calificación
// (si existe) y el nombre del TL que calificó, ya ordenados según
// RN-04 (ver getProjectsRepository.findAllForGallery).
router.get("/projects", verifyToken, getProjects);

module.exports = router;
