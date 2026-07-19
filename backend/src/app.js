// ============================================================
// app.js
// este archivo configura la aplicación Express: middlewares globales y rutas.
// NO arranca el servidor (eso lo hace server.js con app.listen).
// Separar esto permite, por ejemplo, testear la app sin levantar
// un puerto real.
// ============================================================

const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const passwordRoutes = require('./routes/passwordRoutes'); // T5: cambio de contraseña
const projectRoutes = require('./routes/projectRoutes'); // POST /projects: coder sube su proyecto
const getProjectsRoutes = require('./routes/getProjectsRoutes'); // HU-12 · T1: GET /projects (galería) + GET /projects/pending
const getProjectByIdRoutes = require('./routes/getProjectByIdRoutes'); // GET /projects/:id (detalle de un proyecto)
const interestRoutes = require('./routes/interestRoutes'); // POST /interests: reclutador muestra interés en un proyecto
const gradingRoutes = require('./routes/gradingRoutes'); // HU-06: POST /gradings, PATCH /gradings/:id
const coderRoutes = require('./routes/coderRoutes');
const skillRoutes = require('./routes/skillRoutes'); // HU-03 - T3: GET /skills (catalogo de tecnologias)

const app = express();

// Middlewares globales
// CORS: en desarrollo se permite cualquier puerto de localhost (Vite suele
// usar 5173); en producción se restringe al dominio del frontend definido en
// la variable FRONTEND_URL. Antes estaba abierto a cualquier origen.
const isLocalhost = (origin) =>
    /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);

app.use(cors({
    origin(origin, callback) {
        if (!origin) return callback(null, true); // Postman/curl -> permitido
        if (isLocalhost(origin)) return callback(null, true);
        if (process.env.FRONTEND_URL && origin === process.env.FRONTEND_URL) {
            return callback(null, true);
        }
        return callback(new Error('Origen no permitido por CORS'));
    },
}));
app.use(express.json()); // Parsea el body de las peticiones como JSON -> req.body

// Rutas
// Todo lo que venga de authRoutes queda bajo el prefijo /api
// (ej: POST /login en authRoutes.js -> queda POST /api/login)
app.use('/api', authRoutes);
app.use('/api', passwordRoutes); // PATCH /api/change-password
app.use('/api', projectRoutes); // POST /api/projects
app.use('/api', getProjectsRoutes); // GET /api/projects (galería) + GET /api/projects/pending
// GET /api/projects/:id (detalle). Se monta DESPUÉS de getProjectsRoutes
// a propósito: esa contiene GET /projects/pending, y "/projects/:id"
// coincide con cualquier segmento -incluido "pending"-, así que si este
// router se montara antes, "pending" terminaría entrando aquí como si
// fuera un id (ver nota en getProjectByIdRoutes.js).
app.use('/api', getProjectByIdRoutes);
app.use('/api/interests', interestRoutes); // POST /api/interests
app.use('/api', gradingRoutes); // POST /api/gradings, PATCH /api/gradings/:id
app.use('/api/coders', coderRoutes); // GET /api/coders/search
app.use('/api', skillRoutes); // GET /api/skills (HU-03 - T3)

// Ruta de salud simple, útil para confirmar que el servidor responde
// antes de probar rutas más complejas.
app.get('/', (req, res) => {
    res.json({ success: true, message: 'API de Altea funcionando' });
});

// Manejador de errores centralizado (versión mínima por ahora).
// Cualquier next(error) de un controller termina aquí.
// IMPORTANTE: va SIEMPRE al final, después de todas las rutas.
app.use((error, req, res, next) => {
  // express.json() lanza un SyntaxError cuando el body no es JSON válido
  // (ej: falta un valor, coma de más, comillas sin cerrar). Es un error
  // del cliente (400), no una falla del servidor (500).
    if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    return res.status(400).json({
        success: false,
        error: 'El cuerpo de la petición no es JSON válido',
    });
    }

    console.error(error);
    res.status(500).json({
    success: false,
    error: 'Error interno del servidor',
    });
});

module.exports = app;
