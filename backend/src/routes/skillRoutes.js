// ============================================================
// skillRoutes.js
// Ruta del catalogo de skills. Solo GET, protegida con verifyToken
// (cualquier usuario autenticado puede necesitar la lista). HU-03 - T3.
// ============================================================
const express = require("express");
const router = express.Router();

const verifyToken = require("../middlewares/verifyToken");
const { getAllSkills } = require("../controllers/skillController");

// GET /api/skills - lista de tecnologias para poblar el selector.
router.get("/skills", verifyToken, getAllSkills);

module.exports = router;
