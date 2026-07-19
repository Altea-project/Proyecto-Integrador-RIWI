
// Este archivo define las rutas de proyectos y las conecta con projectController.
// No tiene lógica propia.

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
