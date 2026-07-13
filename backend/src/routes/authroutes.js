

// ============================================================
// authroutes.js
// este archivo define las rutas HTTP relacionadas a autenticación y las conecta
// con su controller correspondiente. No contiene lógica propia.
// ============================================================

const express = require('express');
const { login, registerUser } = require('../controllers/authcontroller');
const verifyToken = require('../middlewares/verifyToken');
const requireRole = require('../middlewares/requireRole');

const router = express.Router();

// POST /login (el prefijo /api se agrega al montar esta ruta en app.js,
// ej: app.use('/api', routes) -> la ruta final queda POST /api/login).
router.post('/login', login);

// POST /register — HU-01: registrar un usuario nuevo. Solo un admin
// autenticado puede crearlo (verifyToken identifica quién es,
// requireRole('admin') decide si tiene permiso). Valida que el rol
// exista y que el email/document no estén ya registrados antes de
// insertar (ver authservice.registerUser).
router.post('/register', verifyToken, requireRole('admin'), registerUser);

module.exports = router;

