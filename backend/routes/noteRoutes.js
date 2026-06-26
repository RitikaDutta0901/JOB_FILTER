const express = require('express');
const router = express.Router();
const {
  getNotesForApplication,
  createNote,
  updateNote,
  deleteNote,
} = require('../controllers/noteController');
const { protect } = require('../middleware/authMiddleware');

// Protect all note actions
router.use(protect);

// Nested routes under application
router.get('/applications/:id/notes', getNotesForApplication);
router.post('/applications/:id/notes', createNote);

// Direct note routes
router.put('/notes/:id', updateNote);
router.delete('/notes/:id', deleteNote);

module.exports = router;
