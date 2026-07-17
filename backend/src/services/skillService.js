// ============================================================
// skillService.js
// Logica del catalogo de skills. No hay reglas complejas: pide el
// listado al repository y lo entrega tal cual.
// ============================================================
const skillRepository = require('../repositories/skillRepository');

// Lista completa de skills para el selector de tecnologias.
async function getAllSkills() {
    return skillRepository.findAllSkills();
}

module.exports = { getAllSkills };
