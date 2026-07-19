
// Acceso a la tabla skills. Solo lectura: devuelve el catálogo de tecnologías para llenar los selectores del frontend (HU-03 - T3).

const pool = require("../config/db");

// Devuelve todas las skills (id, name) ordenadas por nombre.
async function findAllSkills() {
  const { rows } = await pool.query(
    "SELECT id, name FROM skills ORDER BY name",
  );
  return rows;
}

module.exports = { findAllSkills };
