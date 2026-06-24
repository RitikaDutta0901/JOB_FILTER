const express = require('express');
const router = express.Router();
const {
  getApplications,
  getApplicationById,
  createApplication,
  updateApplication,
  deleteApplication,
  getApplicationStats,
} = require('../controllers/applicationController');
const { protect } = require('../middleware/authMiddleware');
const { validateApplication } = require('../middleware/validationMiddleware');

// Protect all routes within this router
router.use(protect);

// Analytics Stats Route (Must be mounted before /:id)
router.get('/stats', getApplicationStats);

// Routes
router.route('/')
  .get(getApplications)
  .post(validateApplication, createApplication);

router.route('/:id')
  .get(getApplicationById)
  .put(validateApplication, updateApplication)
  .delete(deleteApplication);

module.exports = router;
