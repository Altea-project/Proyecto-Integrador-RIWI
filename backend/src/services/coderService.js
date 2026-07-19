/* Lógica de negocio de coders. 
No hay transacción (es solo lectura), pero sí una regla que saco del controller: validar y convertir el query param "skills" antes de tocar la BD.
*/

const coderRepository = require("../repositories/coderRepository");

// Errores de dominio propios, igual que en interestService, para que el
// controller no tenga que leer mensajes de texto.
class InvalidSkillsError extends Error {}

// HU-13 - error para cuando el :id no es de ningún coder.
class CoderNotFoundError extends Error {}

// HU-08 - Recibe el string "1,2,3" que llega por query, lo valida y lo pasa a un array de enteros antes de mandarlo al repository.

async function searchCoders(skillsParam) {
  // Si no enviaron skills, devolver todos los coders.
  if (!skillsParam) {
    return coderRepository.findAllCoders();
  }

  const skillIds = skillsParam
    .split(",")
    .map((s) => parseInt(s.trim(), 10))
    .filter((id) => !Number.isNaN(id));

  if (skillIds.length === 0) {
    throw new InvalidSkillsError(
      "El parámetro skills no contiene ids válidos.",
    );
  }

  return coderRepository.searchBySkills(skillIds);
}

/* HU-13 - Arma el perfil público del coder juntando las 3 consultas del repository en un solo objeto. 
No uso transacción porque son 3 lecturas independientes: si una falla, no hay nada que revertir en las otras.
*/
async function getCoderProfile(coderId) {
  const id = parseInt(coderId, 10);
  if (Number.isNaN(id)) {
    throw new CoderNotFoundError("Id de coder inválido.");
  }

  const coder = await coderRepository.findCoderById(id);
  if (!coder) {
    throw new CoderNotFoundError("Coder no encontrado.");
  }

  const [skills, projects] = await Promise.all([
    coderRepository.findSkillsByCoderId(id),
    coderRepository.findProjectsByCoderId(id),
  ]);

  return { ...coder, skills, projects };
}

/*Dashboard del TL - Coders a cargo del TL logueado. El tlId viene del token, nunca de la URL. 
Mapea las filas a camelCase para el frontend.*/

async function getMyCoders(tlId) {
  const rows = await coderRepository.findCodersByTl(tlId);
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    avatarUrl: row.avatar_url,
    availabilityStatus: row.availability_status,
    avgScore: row.avg_score !== null ? Number(row.avg_score) : null,
    projectCount: Number(row.project_count),
  }));
}

module.exports = {
  searchCoders,
  getCoderProfile,
  getMyCoders,
  InvalidSkillsError,
  CoderNotFoundError,
};
