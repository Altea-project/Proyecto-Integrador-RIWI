
const express = require('express');
const router = express.Router();

const verifyToken = require('../middlewares/verifyToken');
const { searchCoders } = require('../controllers/coderController');

// HU-08 · T1 — cualquier usuario autenticado puede buscar coders.
// No lleva requireRole: según PDR sección 4, reclutador, instructor
// y coder pueden buscar por habilidades; solo cambia lo que hace
// cada uno con el resultado (eso lo decide el frontend por rol).
router.get('/search', verifyToken, searchCoders);

module.exports = router;