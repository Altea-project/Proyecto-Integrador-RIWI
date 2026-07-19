/* GET /projects (galería de proyectos) 
Es un archivo aparte de projectService.js a propósito: no comparte código con crear proyecto, solo la tabla "projects"
Su trabajo: pasar las filas crudas del repository a camelCase para el front. No conoce req/res ni ejecuta SQL
*/

const { findAllForGallery, findPendingByTl } = require("../repositories/getProjectsRepository");

//Abrevia el nombre del TL calificador para la card de la galería.
/* "Juan Pérez López" -> "Juan P." (primer nombre + inicial del último apellido). 
Si el nombre es una sola palabra, lo devuelvo tal cual. */

function abbreviateName(fullName) {
  if (!fullName) return null;

  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];

  const [firstName] = parts;
  const lastInitial = parts[parts.length - 1][0].toUpperCase();
  return `${firstName} ${lastInitial}.`;
}


// Arma la galería de proyectos para cualquier usuario logueado.
// Pasa las filas crudas (snake_case, con nulls cuando no hay calificación) a
// camelCase para el front:
// - coderName: nombre del coder dueño (ya resuelto por el JOIN).
// - graded: boolean, para el badge "Sin calificar".
// - score/starred: null/false cuando no está calificado (para no mostrar un
//   score 0 falso ni una estrella fantasma).
// - gradedBy: null si no hay calificación; si la hay, nombre completo y
//   abreviado.
// El orden ya viene de la query (RN-04); acá no reordeno nada.

async function getGalleryProjects() {
  const rows = await findAllForGallery();

  return rows.map((row) => {
    const graded = row.score !== null && row.score !== undefined;

    return {
      id: row.id,
      title: row.title,
      description: row.description,
      imageUrl: row.image_url,
      repoUrl: row.repo_url,
      isExternal: row.is_external,
      coderName: row.coder_name,
      graded,
      score: graded ? row.score : null,
      starred: graded ? row.starred : false,
      gradedBy: graded
        ? {
            name: row.graded_by_name,
            abbreviatedName: abbreviateName(row.graded_by_name),
          }
        : null,
    };
  });
}

/**
 * (TL Dashboard) Proyectos pendientes de revision del TL autenticado.
 * Mapea las filas del repository a camelCase para el frontend.
 */
async function getPendingProjects(tlId) {
  const rows = await findPendingByTl(tlId);
  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    isExternal: row.is_external,
    createdAt: row.created_at,
    coderName: row.coder_name,
    skills: row.skills || [],
  }));
}

module.exports = {
  getGalleryProjects,
  getPendingProjects,
};
