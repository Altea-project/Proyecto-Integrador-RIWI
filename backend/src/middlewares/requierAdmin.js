
// Middleware de AUTORIZACIÓN. Debe usarse SIEMPRE después de
// verifyToken en la cadena de la ruta, porque depende de que
// req.user ya exista.


// ver db/seed.sql: los roles se insertan en este orden exacto
// ('admin', 'instructor', 'coder', 'recruiter'), así que 'admin'
// queda con id = 1 al usar SERIAL PRIMARY KEY.
const ADMIN_ROLE_ID = 1;

function requireAdmin(req, res, next) {
    if (!req.user || req.user.roleId !== ADMIN_ROLE_ID) {
        return res.status(403).json({
            success: false,
            error: 'Acceso solo para administradores',
        });
    }

    next();
}

module.exports = { requireAdmin };