const express = require('express');
const router = express.Router();
const {
  getApplications,
  getApplicationById,
  createApplication,
  updateApplication,
  deleteApplication,
} = require('../controllers/applicationController');
const { protect } = require('../middleware/authMiddleware');
const { validateApplication } = require('../middleware/validationMiddleware');

// Protect all routes within this router
router.use(protect);

// Routes
router.route('/')
  .get(getApplications)
  .post(validateApplication, createApplication);

router.route('/:id')
  .get(getApplicationById)
  .put(validateApplication, updateApplication)
  .delete(deleteApplication);

module.exports = router;
