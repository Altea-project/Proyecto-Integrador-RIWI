// ============================================================
// skillController.js
// Traduce la peticion HTTP GET /skills a la capa de servicio y
// arma la respuesta. HU-03 - T3.
// ============================================================
const skillService = require('../services/skillService');

// GET /api/skills - catalogo de tecnologias para poblar selectores.
async function getSkills(req, res) {
    try {
        const skills = await skillService.getAllSkills();
        return res.status(200).json(skills);
    } catch (err) {
        console.error('Error en getSkills:', err);
        return res.status(500).json({ error: 'Error interno del servidor.' });
    }
}

module.exports = { getSkills };
