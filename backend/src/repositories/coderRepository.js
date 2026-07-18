
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
            SELECT DISTINCT p.id AS project_id, p.coder_id
            FROM projects p
            JOIN project_skills ps ON ps.project_id = p.id
            WHERE ps.skill_id = ANY($1::int[])
        ),
        coder_scores AS (

            SELECT mp.coder_id,
                    ROUND(AVG(g.score)) AS avg_score,
                    BOOL_OR(g.starred)  AS has_starred
            FROM matched_projects mp
            LEFT JOIN gradings g ON g.project_id = mp.project_id
            GROUP BY mp.coder_id
        ),
        coder_skills AS (

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
        WHERE u.availability_status <> 'unavailable'   
        ORDER BY cs.avg_score DESC NULLS LAST, cs.has_starred DESC 
    `;

    const { rows } = await pool.query(query, [skillIds]);
    return rows;
}


// ------------------------------------------------------------
// HU-13 · T1 — Perfil público del coder.
// Se divide en 3 consultas pequeñas (en vez de un solo JOIN
// gigante) para no tener que des-duplicar filas en JS: un solo
// JOIN entre projects y project_skills generaría una fila por
// cada combinación proyecto×skill.
// ------------------------------------------------------------

// Datos básicos del coder. Devuelve undefined si no existe o si
// el id pertenece a un usuario que no tiene rol 'coder'.
async function findCoderById(coderId) {
    const query = `
        SELECT u.id, u.name, u.avatar_url, u.availability_status
        FROM users u
        JOIN roles r ON r.id = u.role_id AND r.name = 'coder'
        WHERE u.id = $1
    `;
    const { rows } = await pool.query(query, [coderId]);
    return rows[0];
}

// Habilidades derivadas: unión de las skills de todos los
// proyectos del coder. No existe tabla user_skills en el MVP
// (PDR 3.2, notas de modelado).
async function findSkillsByCoderId(coderId) {
    const query = `
        SELECT DISTINCT sk.id, sk.name
        FROM project_skills ps
        JOIN projects p ON p.id = ps.project_id
        JOIN skills sk ON sk.id = ps.skill_id
        WHERE p.coder_id = $1
    `;
    const { rows } = await pool.query(query, [coderId]);
    return rows;
}

// Proyectos del coder con su calificación (si la tienen). LEFT
// JOIN para que los proyectos sin calificar también aparezcan
// (con score/starred en null), igual que en la galería (HU-12).
async function findProjectsByCoderId(coderId) {
    const query = `
        SELECT
            p.id, p.title, p.description, p.image_url, p.repo_url, p.is_external,
            g.score, g.comment, g.starred, g.graded_at
        FROM projects p
        LEFT JOIN gradings g ON g.project_id = p.id
        WHERE p.coder_id = $1
        ORDER BY g.score DESC NULLS LAST, g.starred DESC
    `;
    const { rows } = await pool.query(query, [coderId]);
    return rows;
}

// ------------------------------------------------------------
// TL Dashboard — Lista los coders a cargo de un TL (tl_id = $1), con su
// puntaje promedio (AVG de las calificaciones de sus proyectos) y la
// cantidad de proyectos. LEFT JOIN a projects/gradings para que un coder
// sin proyectos o sin calificar igual aparezca (avg_score null).
// El JOIN projects->gradings es 1:1 por proyecto (project_id UNIQUE),
// asi que el AVG no se infla.
// ------------------------------------------------------------
async function findCodersByTl(tlId) {
    const query = `
        SELECT
            u.id,
            u.name,
            u.avatar_url,
            u.availability_status,
            ROUND(AVG(g.score)) AS avg_score,
            COUNT(DISTINCT p.id) AS project_count
        FROM users u
        LEFT JOIN projects p ON p.coder_id = u.id
        LEFT JOIN gradings g ON g.project_id = p.id
        WHERE u.tl_id = $1
        GROUP BY u.id, u.name, u.avatar_url, u.availability_status
        ORDER BY avg_score DESC NULLS LAST, u.name ASC
    `;
    const { rows } = await pool.query(query, [tlId]);
    return rows;
}

module.exports = {
    searchBySkills,
    findCoderById,
    findSkillsByCoderId,
    findProjectsByCoderId,
    findCodersByTl
};