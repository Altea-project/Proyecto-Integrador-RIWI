// Ruta del catálogo de skills. Solo GET, protegida con verifyToken (cualquier usuario logueado puede necesitar la lista). 

const express = require("express");
const router = express.Router();

const verifyToken = require("../middlewares/verifyToken");
const { getAllSkills } = require("../controllers/skillController");

// GET /api/skills - lista de tecnologias para poblar el selector.
router.get("/skills", verifyToken, getAllSkills);

module.exports = router;
