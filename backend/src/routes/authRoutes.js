// ============================================================
// authRoutes.js
// este archivo define las rutas HTTP relacionadas a autenticación y registro
// de usuarios, y las conecta con su controller correspondiente
// (authController para /login, userController para /users).
// No contiene lógica propia.
// ============================================================

const express = require("express");
const { login, getCurrentUser } = require("../controllers/authController");
const {
  registerUser,
  assignTl,
  getAllUsers,
  getMyProfile,
  updateStatus,
} = require("../controllers/userController");
const verifyToken = require("../middlewares/verifyToken");
const requireRole = require("../middlewares/requireRole");

const router = express.Router();

// POST /login (el prefijo /api se agrega al montar esta ruta en app.js,
// ej: app.use('/api', routes) -> la ruta final queda POST /api/login).
router.post("/login", login);
router.get("/me", verifyToken, getCurrentUser);

// POST /users — HU-01 (issue #3): registrar un usuario nuevo. Es el
// admin autenticado quien lo crea (no es auto-registro público), por
// eso la ruta sigue la convención REST de creación de recurso
// (POST /users) en vez de /register. verifyToken identifica quién es,
// requireRole('admin') decide si tiene permiso. Valida que el rol
// exista y que el email/document no estén ya registrados antes de
// insertar (ver authService.registerUser).
router.post("/users", verifyToken, requireRole("admin"), registerUser);

// GET /users/me — T2: retorna el perfil completo del usuario autenticado
// (coder, instructor, admin o recruiter), incluido availability_status.
// Alimenta el badge de disponibilidad del dashboard del coder (CA-01).
// Solo requiere estar autenticado (verifyToken); no tiene restricción
// de rol porque cada usuario solo puede ver SU PROPIO perfil (el id
// sale de req.user, nunca de la URL ni del body) y es de solo lectura
// (CA-03): no existe ningún PATCH/PUT que permita al coder cambiar su
// propio availability_status.
router.get("/users/me", verifyToken, getMyProfile);
router.get("/users", verifyToken, requireRole("admin"), getAllUsers);

// PATCH /users/:id/assign-tl — HU-01 (issues #65 y #66): asigna un TL
// (instructor) a un usuario. Solo un admin autenticado. El service valida
// que el TL destino tenga rol instructor (T1) y guarda tl_id (T2).
router.patch(
  "/users/:id/assign-tl",
  verifyToken,
  requireRole("admin"),
  assignTl,
);

// PATCH /users/:id/status — HU-11: cambia el estado de disponibilidad de un
// usuario. Puede hacerlo un admin o un instructor; el service valida que ese
// instructor sea el TL del coder (RN-10). Guarda la auditoria (T2).
router.patch(
  "/users/:id/status",
  verifyToken,
  requireRole("admin", "instructor"),
  updateStatus,
);

module.exports = router;
