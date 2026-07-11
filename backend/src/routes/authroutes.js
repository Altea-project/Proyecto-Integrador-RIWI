

// ============================================================
// authroutes.js
// este archivo define las rutas HTTP relacionadas a autenticación y las conecta
// con su controller correspondiente. No contiene lógica propia.
// ============================================================

const express = require('express');
const { login } = require('../controllers/authcontroller');
const verifyToken = require('../middlewares/verifyToken');
const requireRole = require('../middlewares/requireRole');

const router = express.Router();

// POST /login (el prefijo /api se agrega al montar esta ruta en app.js,
// ej: app.use('/api', routes) -> la ruta final queda POST /api/login).
router.post('/login', login);


module.exports = router;

