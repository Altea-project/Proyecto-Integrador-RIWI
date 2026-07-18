// ============================================================
// projectRoutes.js
// este archivo define las rutas HTTP relacionadas a proyectos y las
// conecta con su controller correspondiente (projectController).
// No contiene lógica propia.
// ============================================================

const express = require("express");
const {
  createProject,
  getMyProjects,
  getProjectsByUserId,
} = require("../controllers/projectController");
const verifyToken = require("../middlewares/verifyToken");
const requireRole = require("../middlewares/requireRole");

const router = express.Router();

router.post("/projects", verifyToken, requireRole("coder"), createProject);

router.get("/projects/mine", verifyToken, requireRole("coder"), getMyProjects);

router.get("/projects/user/:id", verifyToken, getProjectsByUserId);

module.exports = router;
