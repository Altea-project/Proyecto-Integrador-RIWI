// ============================================================
// getProjectByIdRoutes.js
// HU · T4 — GET /projects/:id (detalle de un proyecto).
//
// Archivo INDEPENDIENTE de getProjectsRoutes.js (galería) y de
// projectRoutes.js (crear proyecto). Ver nota en
// getProjectByIdRepository.js.
//
// IMPORTANTE — orden de montaje (pedido explícito de la HU):
// "/projects/:id" es una ruta comodín: Express la hace coincidir con
// CUALQUIER segmento después de "/projects/", incluida la palabra
// "pending". getProjectsRoutes.js ya define GET /projects/pending
// (TL Dashboard), así que este router se debe montar en app.js
// DESPUÉS de getProjectsRoutes -- así Express ya resolvió
// "/projects/pending" en su propio router antes de intentar
// "/projects/:id" en este, y "pending" nunca se confunde con un id.
// ============================================================

const express = require("express");
const { getProjectById } = require("../controllers/getProjectByIdController");
const verifyToken = require("../middlewares/verifyToken");

const router = express.Router();

// GET /projects/:id — detalle de un proyecto, visible para cualquier
// usuario autenticado (sin restricción de rol, por eso no lleva
// requireRole).
router.get("/projects/:id", verifyToken, getProjectById);

module.exports = router;
