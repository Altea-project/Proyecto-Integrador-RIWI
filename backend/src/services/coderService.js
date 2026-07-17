
// Capa de lógica de negocio. Aquí no hay transacción (es solo lectura),
// pero sí hay una regla que vale la pena aislar del controller: convertir
// y validar el query param "skills" antes de tocar la base de datos.

const coderRepository = require('../repositories/coderRepository');

// Error de dominio propio, igual que en interestService, para que el
// controller no tenga que interpretar mensajes de texto.
class InvalidSkillsError extends Error {}

// HU-13 · T1 — error de dominio para cuando el :id no corresponde
// a ningún coder existente.
class CoderNotFoundError extends Error {}

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

// ------------------------------------------------------------
// HU-13 · T1 — Arma el perfil público del coder combinando las
// 3 consultas del repository en un solo objeto de respuesta.
// No hay transacción porque son 3 lecturas independientes; si
// una fallara no hay nada que "revertir" en las otras dos.
// ------------------------------------------------------------
async function getCoderProfile(coderId) {
    const id = parseInt(coderId, 10);
    if (Number.isNaN(id)) {
    throw new CoderNotFoundError('Id de coder inválido.');
    }

    const coder = await coderRepository.findCoderById(id);
    if (!coder) {
    throw new CoderNotFoundError('Coder no encontrado.');
    }

    const [skills, projects] = await Promise.all([
    coderRepository.findSkillsByCoderId(id),
    coderRepository.findProjectsByCoderId(id)
    ]);

    return { ...coder, skills, projects };
}

module.exports = { searchCoders, getCoderProfile, InvalidSkillsError, CoderNotFoundError };