
// ============================================================
// Este archivo contiene el middleware de AUTORIZACIÓN (T2 de HU-01: "Middleware de autorización solo Admin").
//
// Se construye como fábrica genérica requireRole(...roles) en vez
// de un middleware fijo "solo Admin", porque HU-01 no será la única
// ruta que necesite restringir por rol -- otras HUs del backlog
// (ej. calificar proyectos = solo Instructor) van a necesitar el
// mismo patrón. Reutilizar esta fábrica evita reescribir el mismo
// middleware varias veces.
//
// IMPORTANTE: este middleware SIEMPRE debe ir después de
// verifyToken.js en la cadena de la ruta, porque depende de que
// req.user ya exista (verifyToken es quien lo llena).
// ============================================================

/**
 * Fábrica de middlewares de autorización por rol.
 *
 * @param {...string} allowedRoles - Nombres de rol permitidos (ej. 'admin').
 *   Se comparan en minúscula para que no falle por diferencias de mayúsculas.
 * @returns {Function} Middleware de Express.
 *
 * @example
 * // Solo Admin (caso de HU-01-T2):
 * router.post('/users', verifyToken, requireRole('admin'), createUser);
 *
 * @example
 * // Admin o Instructor (ejemplo de reutilización futura):
 * router.post('/gradings', verifyToken, requireRole('admin', 'instructor'), createGrading);
 */
function requireRole(...allowedRoles) {
    const normalizedAllowedRoles = allowedRoles.map((role) => role.toLowerCase());

    return function (req, res, next) {
    // Si esto falla, significa que requireRole se usó sin verifyToken antes
    // en la ruta -- error de programación, no del usuario final.
    if (!req.user || !req.user.roleName) {
        return res.status(401).json({
        success: false,
        error: 'No se pudo determinar el usuario autenticado',
        });
    }

    const userRole = req.user.roleName.toLowerCase();

    if (!normalizedAllowedRoles.includes(userRole)) {
        return res.status(403).json({
        success: false,
        error: 'No tienes permisos para realizar esta acción',
        });
    }

    next();
    };
}

module.exports = requireRole;