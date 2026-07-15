// passwordRoutes.js
// Define la ruta del cambio de contraseña y la conecta con su controller.
// No tiene lógica; solo dice qué método + ruta llama a qué función.

const express = require('express');
const { changePassword } = require('../controllers/passwordController');
const verifyToken = require('../middlewares/verifyToken');

const router = express.Router();

// Queda como PATCH /api/change-password al montarse en app.js.
// verifyToken va primero: hay que estar logueado (con la contraseña temporal)
// para cambiarla. No lleva requireRole porque cualquier usuario cambia la suya.
// Body: { newPassword, confirmPassword }  (no se pide la contraseña actual,
// porque el usuario acaba de iniciar sesión con la temporal).
// Usamos PATCH porque actualizamos algo que ya existe (el usuario).
router.patch('/change-password', verifyToken, changePassword);

module.exports = router;

// Falta un paso en src/app.js para activarla (2 líneas, junto al
// app.use('/api', authRoutes) que ya existe):
//
//   const passwordRoutes = require('./routes/passwordRoutes');
//   app.use('/api', passwordRoutes);
