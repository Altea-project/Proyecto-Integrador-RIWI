

// ============================================================
// routes.js
// Define las rutas HTTP relacionadas a autenticación y las conecta
// con su controller correspondiente. No contiene lógica propia.
// ============================================================

const express = require('express');
const { login, registerUser } = require('../controllers/controller');
const { verifyToken } = require('../middlewares/verifyToken');
const { requireAdmin } = require('../middlewares/requierAdmin');

const router = express.Router();

// POST /login (el prefijo /api se agrega al montar esta ruta en app.js,
// ej: app.use('/api', routes) -> la ruta final queda POST /api/login).
router.post('/login', login);
    
// POST /register — HU-01: registrar un usuario nuevo. Solo un admin
// autenticado puede crearlo (verifyToken identifica quién es,
// requireAdmin decide si tiene permiso). Valida que email y document
// no estén ya registrados antes de insertar.
router.post('/register', verifyToken, requireAdmin, registerUser);

module.exports = router;