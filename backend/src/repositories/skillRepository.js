const pool = require("../config/db");

async function findAllSkills() {
  const { rows } = await pool.query(
    `SELECT id, name FROM skills ORDER BY name ASC`,
  );
  return rows;
}

module.exports = { findAllSkills };
