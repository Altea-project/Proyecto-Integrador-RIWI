

// Middleware de autorización por rol (HU-01 T2: "solo Admin").
// Lo hago como una fábrica requireRole(...roles) en vez de uno fijo de admin,
// porque otras rutas (ej: calificar = solo instructor) van a necesitar lo mismo y así no lo reescribo cada vez.

// OJO: siempre va DESPUÉS de verifyToken en la ruta, porque necesita que req.user ya exista (lo llena verifyToken).

/*
 * Recibe los roles permitidos (ej: 'admin') y devuelve el middleware.
 * Los comparo en minúscula para que no falle por mayúsculas.
 *
 * Ejemplos:
 *   router.post('/users', verifyToken, requireRole('admin'), createUser);
 *   router.post('/gradings', verifyToken, requireRole('admin', 'instructor'), createGrading);
 */

function requireRole(...allowedRoles) {
    const normalizedAllowedRoles = allowedRoles.map((role) => role.toLowerCase());

    return function (req, res, next) {
    // Si esto falla es porque usé requireRole sin verifyToken antes
    // sea, un error mío programando, no del usuario
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