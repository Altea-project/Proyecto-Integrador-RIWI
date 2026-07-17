
// Controller delgado: no toca SQL. Solo lee req/res y traduce los
// errores de dominio del service a códigos HTTP.

const coderService = require('../services/coderService');

async function searchCoders(req, res) {
    try {
    const { skills } = req.query; // ej: "1,2,3"

    const coders = await coderService.searchCoders(skills);

    return res.status(200).json(coders);
    } catch (err) {
    if (err instanceof coderService.InvalidSkillsError) {
        return res.status(400).json({ error: err.message });
    }

    console.error('Error en searchCoders:', err);
    return res.status(500).json({ error: 'Error interno del servidor.' });
    }
}


// ------------------------------------------------------------
// HU-13 · T1 — GET /coders/:id/profile
// ------------------------------------------------------------
async function getCoderProfile(req, res) {
    try {
    const { id } = req.params;

    const profile = await coderService.getCoderProfile(id);

    return res.status(200).json(profile);
    } catch (err) {
    if (err instanceof coderService.CoderNotFoundError) {
        return res.status(404).json({ error: err.message });
    }

    console.error('Error en getCoderProfile:', err);
    return res.status(500).json({ error: 'Error interno del servidor.' });
    }
}

module.exports = { searchCoders, getCoderProfile };