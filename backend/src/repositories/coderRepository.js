
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
        WITH matched_projects AS (
            -- Proyectos que coinciden con al menos una skill buscada, SIN duplicar.
            -- (DISTINCT: un proyecto con 2 skills coincidentes aparece una sola vez.)
            SELECT DISTINCT p.id AS project_id, p.coder_id
            FROM projects p
            JOIN project_skills ps ON ps.project_id = p.id
            WHERE ps.skill_id = ANY($1::int[])
        ),
        coder_scores AS (
            -- Promedio y estrella sobre PROYECTOS distintos -> ya no se infla el AVG.
            SELECT mp.coder_id,
                    ROUND(AVG(g.score)) AS avg_score,
                    BOOL_OR(g.starred)  AS has_starred
            FROM matched_projects mp
            LEFT JOIN gradings g ON g.project_id = mp.project_id
            GROUP BY mp.coder_id
        ),
        coder_skills AS (
            -- Los nombres de las skills coincidentes, agregados aparte.
            SELECT mp.coder_id,
                    ARRAY_AGG(DISTINCT sk.name) AS skills
            FROM matched_projects mp
            JOIN project_skills ps ON ps.project_id = mp.project_id
                                    AND ps.skill_id = ANY($1::int[])
            JOIN skills sk ON sk.id = ps.skill_id
            GROUP BY mp.coder_id
        )
        SELECT
            u.id,
            u.name,
            u.avatar_url,
            u.availability_status,
            cs.avg_score,
            cs.has_starred,
            csk.skills
        FROM users u
        JOIN roles r ON r.id = u.role_id AND r.name = 'coder'
        JOIN coder_scores cs  ON cs.coder_id = u.id
        JOIN coder_skills csk ON csk.coder_id = u.id
        WHERE u.availability_status <> 'unavailable'   // RN-09
        ORDER BY cs.avg_score DESC NULLS LAST, cs.has_starred DESC // RN-05
    `;

    const { rows } = await pool.query(query, [skillIds]);
    return rows;
}

module.exports = { searchBySkills };