const express = require('express');
const router = express.Router();
const { exportApplicationsCSV } = require('../controllers/exportController');
const { protect } = require('../middleware/authMiddleware');

router.get('/applications/csv', protect, exportApplicationsCSV);

module.exports = router;
