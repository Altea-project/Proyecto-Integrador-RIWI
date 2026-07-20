
// Define las rutas de autenticación y de usuarios y las conecta con su
// controller (authController para /login, userController para /users).
// No tiene lógica propia.

const express = require("express");
const { login, getCurrentUser } = require("../controllers/authController");
const {
  registerUser,
  assignTl,
  getAllUsers,
  getMyProfile,
  updateStatus,
  getPublicProfile,
  updateUserController,
  deleteUserController,
} = require("../controllers/userController");
const verifyToken = require("../middlewares/verifyToken");
const requireRole = require("../middlewares/requireRole");
const { getAllSkills } = require("../controllers/skillController");
const router = express.Router();

// POST /login (el prefijo /api se agrega al montar la ruta en app.js, así queda POST /api/login).

router.post("/login", login);
router.get("/me", verifyToken, getCurrentUser);

/* POST /users — HU-01: crear un usuario. 
Lo crea el admin logueado (no es registro público), por eso uso POST /users y no /register. 
verifyToken dice quién es, requireRole('admin') dice si puede. El service valida el rol y que el email/documento no estén repetidos.
*/
router.post("/users", verifyToken, requireRole("admin"), registerUser);

/* GET /users/me — devuelve el perfil completo del usuario logueado, incluido availability_status (para el badge del dashboard del coder). 
Solo pide estar logueado: cada usuario ve SU propio perfil (el id sale del token) y es solo lectura (no hay endpoint para que el coder cambie su propio estado).
*/
router.get("/users/me", verifyToken, getMyProfile);
router.get("/users", verifyToken, requireRole("admin"), getAllUsers);

// PATCH /users/:id/assign-tl — HU-02: asigna un TL a un usuario. Solo admin.
// El service valida que el TL tenga rol instructor y guarda tl_id.

router.get("/skills", verifyToken, getAllSkills);

router.patch(
  "/users/:id/assign-tl",
  verifyToken,
  requireRole("admin"),
  assignTl,
);

/* PATCH /users/:id/status — HU-11: cambia el estado de disponibilidad. 
Lo puede hacer un admin o un instructor; el service valida que ese instructor sea el TL del coder (RN-10) y guarda la auditoría. */
router.patch(
  "/users/:id/status",
  verifyToken,
  requireRole("admin", "instructor"),
  updateStatus,
);
router.get("/users/:id/public", verifyToken, getPublicProfile);

/* PATCH /users/:id — HU-01 (edición por admin): actualiza name, email, phone, document, role y company (solo recruiter). 
Va DESPUÉS de las rutas más específicas (/assign-tl y /status) para que no las intercepte. 
Nunca toca password, id ni datos de autenticación. */

router.patch(
  "/users/:id",
  verifyToken,
  requireRole("admin"),
  updateUserController,
);

/* DELETE /users/:id — HU-01 (borrado por admin): elimina un usuario. 
Solo admin. El service bloquea borrarse a sí mismo (403) y usuarios inexistentes (404). 
Va al final de las rutas /users/:id/* para no chocar con las de arriba.
*/

router.delete(
  "/users/:id",
  verifyToken,
  requireRole("admin"),
  deleteUserController,
);

module.exports = router;
