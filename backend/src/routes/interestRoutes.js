
const express = require('express');
const router = express.Router();

const verifyToken  = require('../middlewares/verifyToken');
const requireRole  = require('../middlewares/requireRole');
const { createInterest } = require('../controllers/interestController');

// HU-07 + HU-10 - solo los reclutadores muestran interés
router.post('/', verifyToken, requireRole("recruiter"), createInterest);

module.exports = router;