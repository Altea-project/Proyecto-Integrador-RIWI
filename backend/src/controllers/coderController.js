
// Controller de coders. No toca SQL: solo lee req/res y pasa los errores del service a códigos HTTP.

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


// GET /coders/:id/profile - perfil público del coder (HU-13)
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

// GET /coders/mine - los coders a cargo del TL logueado (dashboard del TL).
async function getMyCoders(req, res) {
    try {
    const coders = await coderService.getMyCoders(req.user.id);
    return res.status(200).json(coders);
    } catch (err) {
    console.error('Error en getMyCoders:', err);
    return res.status(500).json({ error: 'Error interno del servidor.' });
    }
}

module.exports = { searchCoders, getCoderProfile, getMyCoders };