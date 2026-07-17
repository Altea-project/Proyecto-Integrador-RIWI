const skillService = require("../services/skillService");

async function getAllSkills(req, res, next) {
  try {
    const skills = await skillService.getAllSkills();

    return res.status(200).json({
      success: true,
      data: { skills },
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { getAllSkills };
