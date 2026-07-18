const { findAllSkills } = require("../repositories/skillRepository");

async function getAllSkills() {
  return await findAllSkills();
}

module.exports = { getAllSkills };
