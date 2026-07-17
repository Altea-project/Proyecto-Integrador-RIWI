
// Capa de acceso a datos: solo SQL, sin lógica de negocio.
// A diferencia de interestRepository, aquí no se recibe `client` de una
// transacción porque esta es una única consulta de LECTURA: no hay nada
// que deba revertirse si algo falla, así que usa el `pool` directamente.

const pool = require('../config/db');

// ------------------------------------------------------------
// HU-08 · T1 — Busca coders que tengan al menos una de las
// habilidades pedidas, excluyendo a los 'unavailable' (RN-09).
// Devuelve el puntaje promedio y si tienen algún proyecto con
// estrella, para que el service pueda aplicar el orden (RN-05).
// ------------------------------------------------------------
async function searchBySkills(skillIds) {
    const query = `
        SELECT
            u.id,
            u.name,
            u.avatar_url,
            u.availability_status,
            ROUND(AVG(g.score)) AS avg_score,
            BOOL_OR(g.starred) AS has_starred,
            ARRAY_AGG(DISTINCT sk.name) AS skills
        FROM users u
        JOIN roles r ON r.id = u.role_id AND r.name = 'coder'
        JOIN projects p ON p.coder_id = u.id
        JOIN project_skills ps ON ps.project_id = p.id
        JOIN skills sk ON sk.id = ps.skill_id
        LEFT JOIN gradings g ON g.project_id = p.id
        WHERE u.availability_status <> 'unavailable'   -- RN-09
            AND ps.skill_id = ANY($1::int[])
        GROUP BY u.id, u.name, u.avatar_url, u.availability_status
        ORDER BY avg_score DESC NULLS LAST, has_starred DESC
    `;

    const { rows } = await pool.query(query, [skillIds]);
    return rows;
}

module.exports = { searchBySkills };