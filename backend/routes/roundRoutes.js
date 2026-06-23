const express = require('express');
const router = express.Router();
const {
  getRoundsForApplication,
  createRound,
  updateRound,
  deleteRound,
} = require('../controllers/roundController');
const { protect } = require('../middleware/authMiddleware');
const { validateRound } = require('../middleware/validationMiddleware');

// Protect all routes
router.use(protect);

// Application-specific rounds routes
router.get('/applications/:id/rounds', getRoundsForApplication);
router.post('/applications/:id/rounds', validateRound, createRound);

// Specific round management routes
router.put('/rounds/:id', validateRound, updateRound);
router.delete('/rounds/:id', deleteRound);

module.exports = router;
