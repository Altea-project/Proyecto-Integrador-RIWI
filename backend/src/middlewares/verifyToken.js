

/* Middleware de autenticación (HU-00 T3).
Lo único que hace: leer el token del header Authorization, validarlo y dejar el usuario decodificado en req.user para los siguientes middlewares.
No filtra por rol a propósito. Ese filtro va en otro middleware (requireRole) para poder reusar verifyToken en cualquier ruta protegida. */

const { verifyJwt } = require('../utils/jwt');

// Se pone antes de cualquier ruta que necesite estar logueado.
// Pasos:
// 1. Lee "Authorization: Bearer <token>".
// 2. Si no viene o el formato está mal -> 401.
// 3. Si el token es inválido o venció -> 401.
// 4. Si todo bien, guarda el payload en req.user y sigue con next().
function verifyToken(req, res, next) {
    const authHeader = req.headers.authorization;

  // El formato tiene que ser "Bearer <token>". Si no viene así, no hay
  // nada que verificar.
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
        success: false,
        error: 'Token no proporcionado',
    });
    }

  // De "Bearer abc123..." me quedo solo con el token.
    const token = authHeader.split(' ')[1];

    try {
    const payload = verifyJwt(token);

    // De aca en adelante los controllers pueden leer req.user.id y req.user.roleId sin volver a decodificar el token.
    req.user = payload;
    next();
    } catch (error) {
    // verifyJwt tira error si la firma no coincide (token alterado o firmado con otro secret) o si ya venció.
    return res.status(401).json({
        success: false,
        error: 'Token inválido o expirado',
    });
    }
}

module.exports = verifyToken;

/*
 * Ejemplo de cómo combinarlo con un filtro de rol:
 *
 * function requireAdmin(req, res, next) {
 *   const ADMIN_ROLE_ID = 1; // según el seed real de la tabla roles
 *   if (req.user.roleId !== ADMIN_ROLE_ID) {
 *     return res.status(403).json({
 *       success: false,
 *       error: 'Acceso solo para administradores',
 *     });
 *   }
 *   next();
 * }
 *
 * // En la ruta:
 * router.post('/users', verifyToken, requireAdmin, createUser);
 * // verifyToken corre primero (dice quién es),
 * // requireAdmin corre después (dice si puede).
 */