// ============================================================
// projectRoutes.js
// este archivo define las rutas HTTP relacionadas a proyectos y las
// conecta con su controller correspondiente (projectController).
// No contiene lógica propia.
// ============================================================

const express = require('express');
const { createProject } = require('../controllers/projectController');
const verifyToken = require('../middlewares/verifyToken');
const requireRole = require('../middlewares/requireRole');

const router = express.Router();

// POST /projects — T1: crear un proyecto vinculado al coder autenticado.
// verifyToken identifica quién es (llena req.user desde el JWT),
// requireRole('coder') asegura que solo un coder puede subir proyectos
// (el enunciado de la HU es "Como coder, quiero subir un proyecto...").
router.post('/projects', verifyToken, requireRole('coder'), createProject);

module.exports = router;
