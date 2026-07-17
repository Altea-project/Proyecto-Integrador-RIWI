// ============================================================
// getProjectsService.js
// HU-12 · T1 — GET /projects (galería de proyectos).
//
// Archivo INDEPENDIENTE de projectService.js a propósito (ver nota en
// getProjectsRepository.js): esta feature no comparte código con
// createProject, solo comparte la tabla "projects".
//
// Lógica de negocio: traduce las filas crudas del repository a un
// shape de negocio (camelCase) listo para el frontend. NO conoce
// req/res (responsabilidad del controller) ni ejecuta queries SQL
// directas (responsabilidad del repository).
// ============================================================

const { findAllForGallery } = require("../repositories/getProjectsRepository");

/**
 * (T1 - HU-12) Abrevia el nombre del TL/instructor calificador para la
 * card de la galería (CA-01: "nombre abreviado del TL calificador").
 * "Juan Pérez López" -> "Juan P." (primer nombre + inicial del último
 * apellido). Si el nombre trae una sola palabra, se devuelve tal cual.
 *
 * @param {string|null} fullName
 * @returns {string|null}
 */
function abbreviateName(fullName) {
  if (!fullName) return null;

  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];

  const [firstName] = parts;
  const lastInitial = parts[parts.length - 1][0].toUpperCase();
  return `${firstName} ${lastInitial}.`;
}

/**
 * (T1 - HU-12) Arma la galería de proyectos para cualquier usuario
 * autenticado.
 *
 * Traduce las filas crudas del repository (snake_case, con nulls
 * cuando el proyecto no tiene calificación) a un shape de negocio
 * (camelCase) que el frontend puede consumir directamente:
 * - graded: boolean -> soporta el badge "Sin calificar" (CA-02).
 * - score/starred: null/false cuando el proyecto no ha sido calificado,
 *   para no filtrar un "score: 0" falso ni un "starred: true" fantasma.
 * - gradedBy: null si no hay calificación; si la hay, incluye el
 *   nombre completo y la versión abreviada (CA-01).
 *
 * El orden ya viene resuelto desde la query (RN-04); este método NO
 * reordena nada.
 *
 * @returns {Promise<Object[]>} Proyectos listos para la galería.
 */
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

module.exports = {
  getGalleryProjects,
};
