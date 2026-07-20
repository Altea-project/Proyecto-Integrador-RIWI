
// Las consultas SQL del cambio de contraseña. Solo habla con la BD, no valida ni decide nada.


const pool = require('../config/db');

// Trae al usuario por id (el id sale del token). Necesito su password_hash
// para comprobar que la contraseña actual que escribió es la correcta.
async function findUserById(id) {
    const { rows } = await pool.query(
        `SELECT id, email, password_hash, must_change_password
        FROM users
        WHERE id = $1`,
        [id]
    );

    return rows[0];
}

// Guarda la nueva contraseña y de paso apaga must_change_password, para que el
// usuario no vuelva a caer en la pantalla de cambio obligatorio.
// Siempre recibe el hash ya calculado, nunca la contraseña en texto plano.
async function updatePassword(id, newPasswordHash) {
    await pool.query(
        `UPDATE users
        SET password_hash = $1,
            must_change_password = false,
            updated_at = now()
        WHERE id = $2`,
        [newPasswordHash, id]
    );
}

module.exports = { findUserById, updatePassword };
