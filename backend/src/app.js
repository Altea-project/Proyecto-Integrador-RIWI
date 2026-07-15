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

const app = express();

// Middlewares globales
app.use(cors()); // Permite que el frontend (otro origen/puerto) consuma la API.
app.use(express.json()); // Parsea el body de las peticiones como JSON -> req.body

// Rutas
// Todo lo que venga de authRoutes queda bajo el prefijo /api
// (ej: POST /login en authRoutes.js -> queda POST /api/login)
app.use('/api', authRoutes);
app.use('/api', passwordRoutes); // PATCH /api/change-password
app.use('/api', projectRoutes); // POST /api/projects

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
