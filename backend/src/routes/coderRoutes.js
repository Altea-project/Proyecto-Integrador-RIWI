
const express = require('express');
const router = express.Router();

const verifyToken = require('../middlewares/verifyToken');
const requireRole = require('../middlewares/requireRole');
const { searchCoders, getCoderProfile, getMyCoders } = require('../controllers/coderController');

// HU-08 · T1 — cualquier usuario autenticado puede buscar coders.
// No lleva requireRole: según PDR sección 4, reclutador, instructor
// y coder pueden buscar por habilidades; solo cambia lo que hace
// cada uno con el resultado (eso lo decide el frontend por rol).
router.get('/search', verifyToken, searchCoders);

// TL Dashboard — coders a cargo del TL autenticado (tl_id del token).
// Solo instructor. /mine (1 segmento) no colisiona con /:id/profile (2).
router.get('/mine', verifyToken, requireRole('instructor'), getMyCoders);

// HU-13 · T1 — perfil público, visible para cualquier autenticado.
// No colisiona con '/search' porque Express distingue por cantidad
// de segmentos: '/search' es un solo segmento, '/:id/profile' son dos.
router.get('/:id/profile', verifyToken, getCoderProfile);

module.exports = router;