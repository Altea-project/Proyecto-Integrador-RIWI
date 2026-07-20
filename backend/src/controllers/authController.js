
// Controller de autenticación. 
// Solo lee la petición (req), valida que estén los campos, le pasa el trabajo real al service y arma la respuesta (res). 
// No tiene lógica de negocio ni queries.

const authService = require("../services/authService");

// POST /login
// Body: { email, password }
// Devuelve 200 con el token si sale bien, 400 si faltan datos, 401 si las
// credenciales están mal, y 500 (vía next) si pasa algo inesperado.
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    // Valido que vengan los campos antes de tocar la BD (así no gasto
    // una consulta si ya sé que faltan datos).
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: "Correo y contraseña son obligatorios",
      });
    }

    // Todo lo demás (buscar usuario, comparar contraseña, generar token) lo hace el service.
    const result = await authService.login(email, password);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    // Si el service tiró error de credenciales, respondo 401 con mensaje genérico.
    if (error instanceof authService.InvalidCredentialsError) {
      return res.status(401).json({
        success: false,
        error: error.message,
      });
    }

    // Cualquier otro error (ej: se cayó la BD) lo mando al manejador central de app.js.
    next(error);
  }
}

// GET /me
// Ruta protegida. Devuelve los datos del usuario dueño del token.
// El front la usa al arrancar para recuperar la sesión después de recargar
// (el token queda en localStorage pero el usuario en memoria se pierde).
async function getCurrentUser(req, res, next) {
  try {
    const result = await authService.getCurrentUser(req.user.id);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    if (error instanceof authService.UserNotFoundError) {
      return res.status(404).json({
        success: false,
        error: error.message,
      });
    }

    next(error);
  }
}

module.exports = { login, getCurrentUser };
