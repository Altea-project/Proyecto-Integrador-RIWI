

// ============================================================
// authRoutes.js
// este archivo define las rutas HTTP relacionadas a autenticación y registro
// de usuarios, y las conecta con su controller correspondiente
// (authController para /login, userController para /users).
// No contiene lógica propia.
// ============================================================

const express = require('express');
const { login } = require('../controllers/authController');
const { registerUser } = require('../controllers/userController');
const verifyToken = require('../middlewares/verifyToken');
const requireRole = require('../middlewares/requireRole');

const router = express.Router();

// POST /login (el prefijo /api se agrega al montar esta ruta en app.js,
// ej: app.use('/api', routes) -> la ruta final queda POST /api/login).
router.post('/login', login);

// POST /users — HU-01 (issue #3): registrar un usuario nuevo. Es el
// admin autenticado quien lo crea (no es auto-registro público), por
// eso la ruta sigue la convención REST de creación de recurso
// (POST /users) en vez de /register. verifyToken identifica quién es,
// requireRole('admin') decide si tiene permiso. Valida que el rol
// exista y que el email/document no estén ya registrados antes de
// insertar (ver authService.registerUser).
router.post('/users', verifyToken, requireRole('admin'), registerUser);

module.exports = router;

