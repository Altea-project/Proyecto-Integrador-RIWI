

// ============================================================
// verifyToken.js
// Middleware GENÉRICO de autenticación (T3 de HU-00).
// Su única responsabilidad es: leer el token del header
// Authorization, validarlo, y adjuntar el usuario decodificado
// a req.user para que los siguientes middlewares/controllers lo usen.
//
// A PROPÓSITO no filtra por rol (ej. "solo Admin"). Ese filtro debe
// vivir en un middleware aparte que se combine con este, para que
// verifyToken se pueda reutilizar en CUALQUIER ruta protegida del
// proyecto (ver ejemplo de combinación al final del archivo).
// ============================================================

const { verifyJwt } = require('../utils/jwt');

/**
 * Middleware de Express. Se coloca antes de cualquier ruta que
 * requiera que el usuario esté autenticado.
 *
 * Flujo:
 * 1. Lee el header "Authorization: Bearer <token>".
 * 2. Si no viene el header o no tiene el formato correcto -> 401.
 * 3. Si el token es inválido o expiró -> 401.
 * 4. Si todo es correcto, adjunta el payload decodificado en
 *    req.user (contiene { id, roleId }) y continúa con next().
 */
function verifyToken(req, res, next) {
    const authHeader = req.headers.authorization;

  // El formato esperado es "Bearer <token>". Si no viene o no cumple
  // ese formato, no hay nada que intentar verificar.
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
        success: false,
        error: 'Token no proporcionado',
    });
    }

  // "Bearer abc123..." -> nos quedamos solo con la parte del token.
    const token = authHeader.split(' ')[1];

    try {
    const payload = verifyJwt(token);

    // A partir de aquí, cualquier controller/middleware siguiente en
    // la cadena puede leer req.user.id y req.user.roleId sin volver
    // a decodificar el token.
    req.user = payload;
    next();
    } catch (error) {
    // verifyJwt lanza error si la firma no coincide (token alterado
    // o firmado con otro secret) o si ya expiró.
    return res.status(401).json({
        success: false,
        error: 'Token inválido o expirado',
    });
    }
}

module.exports = verifyToken;

/**
 * Ejemplo de uso combinado con un filtro de rol (para HU-01-T2,
 * "middleware de autorización solo Admin"):
 *
 * function requireAdmin(req, res, next) {
 *   const ADMIN_ROLE_ID = 1; // ajustar según el seed real de la tabla roles
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
 * // verifyToken corre primero (identifica quién es),
 * // requireAdmin corre después (decide si tiene permiso).
 */