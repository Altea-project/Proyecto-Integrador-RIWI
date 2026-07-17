
// Capa de lógica de negocio. Aquí no hay transacción (es solo lectura),
// pero sí hay una regla que vale la pena aislar del controller: convertir
// y validar el query param "skills" antes de tocar la base de datos.

const coderRepository = require('../repositories/coderRepository');

// Error de dominio propio, igual que en interestService, para que el
// controller no tenga que interpretar mensajes de texto.
class InvalidSkillsError extends Error {}

// ------------------------------------------------------------
// HU-08 · T1 — Recibe el string "1,2,3" que llega por query,
// lo valida y lo convierte a un array de enteros antes de
// pasarlo al repository.
// ------------------------------------------------------------
async function searchCoders(skillsParam) {
    if (!skillsParam) {
    throw new InvalidSkillsError('Debes indicar al menos una habilidad');
    }

    const skillIds = skillsParam
    .split(',')
    .map(s => parseInt(s.trim(), 10))
    .filter(id => !Number.isNaN(id));

    if (skillIds.length === 0) {
    throw new InvalidSkillsError('El parámetro skills no contiene ids válidos.');
    }

    return coderRepository.searchBySkills(skillIds);
}

module.exports = { searchCoders, InvalidSkillsError };