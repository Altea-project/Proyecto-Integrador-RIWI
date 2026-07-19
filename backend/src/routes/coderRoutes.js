
const express = require('express');
const router = express.Router();

const verifyToken = require('../middlewares/verifyToken');
const requireRole = require('../middlewares/requireRole');
const { searchCoders, getCoderProfile, getMyCoders } = require('../controllers/coderController');

// HU-08 - cualquier usuario logueado puede buscar coders. 
// No lleva requireRole porque (según PDR sección 4) reclutador, instructor y coder pueden buscar por habilidades; 
// lo que cambia es qué hace cada uno con el resultado (eso lo decide el front según el rol).
router.get('/search', verifyToken, searchCoders);

// Dashboard del TL - coders a cargo del TL logueado (tl_id del token). 
// Solo instructor. /mine (1 segmento) no choca con /:id/profile (2 segmentos)..
router.get('/mine', verifyToken, requireRole('instructor'), getMyCoders);

// HU-13 - perfil público, visible para cualquier usuario logueado. 
// No choca con'/search' porque Express distingue por cantidad de segmentos: '/search' es 1,
// '/:id/profile' son 2.
router.get('/:id/profile', verifyToken, getCoderProfile);

module.exports = router;