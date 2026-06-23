const express = require('express');
const router = express.Router();
const { getCompanies } = require('../controllers/companyController');
const { protect } = require('../middleware/authMiddleware');

// Get all companies list
router.get('/', protect, getCompanies);

module.exports = router;
