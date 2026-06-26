const express = require('express');
const router = express.Router();
const {
  getRoadmapForApplication,
  updateRoadmapTopic,
} = require('../controllers/roadmapController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/applications/:id/roadmap', getRoadmapForApplication);
router.put('/roadmap-topics/:id', updateRoadmapTopic);

module.exports = router;
