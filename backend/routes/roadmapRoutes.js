const express = require('express');
const router = express.Router();
const {
  getRoadmapForApplication,
  updateRoadmapTopic,
  regenerateRoadmapForApplication,
} = require('../controllers/roadmapController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/applications/:id/roadmap', getRoadmapForApplication);
router.put('/roadmap-topics/:id', updateRoadmapTopic);
router.post('/applications/:id/roadmap/regenerate', regenerateRoadmapForApplication);

module.exports = router;
