const db = require('../db');

/**
 * @desc    Get all notes for a specific application
 * @route   GET /api/applications/:id/notes
 * @access  Private
 */
const getNotesForApplication = async (req, res, next) => {
  const userId = req.user.id;
  const applicationId = req.params.id;

  try {
    // 1. Verify ownership of the parent application
    const appCheck = await db.query(
      'SELECT id FROM applications WHERE id = $1 AND user_id = $2',
      [applicationId, userId]
    );

    if (appCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Application not found or unauthorized',
      });
    }

    // 2. Query notes
    const notesQuery = 'SELECT * FROM notes WHERE application_id = $1 ORDER BY created_at DESC';
    const result = await db.query(notesQuery, [applicationId]);

    return res.status(200).json({
      success: true,
      count: result.rows.length,
      notes: result.rows,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add a note to an application
 * @route   POST /api/applications/:id/notes
 * @access  Private
 */
const createNote = async (req, res, next) => {
  const userId = req.user.id;
  const applicationId = req.params.id;
  const { content } = req.body;

  if (!content || content.trim() === '') {
    return res.status(400).json({
      success: false,
      message: 'Note content is required',
    });
  }

  try {
    // 1. Verify ownership of application
    const appCheck = await db.query(
      'SELECT id FROM applications WHERE id = $1 AND user_id = $2',
      [applicationId, userId]
    );

    if (appCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Application not found or unauthorized',
      });
    }

    // 2. Insert note
    const insertQuery = 'INSERT INTO notes (application_id, content) VALUES ($1, $2) RETURNING *';
    const result = await db.query(insertQuery, [applicationId, content.trim()]);

    return res.status(201).json({
      success: true,
      message: 'Note added successfully',
      note: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a specific note
 * @route   DELETE /api/notes/:id
 * @access  Private
 */
const deleteNote = async (req, res, next) => {
  const userId = req.user.id;
  const noteId = req.params.id;

  try {
    // Verify note exists and parent application belongs to logged-in user
    const checkQuery = `
      SELECT n.id 
      FROM notes n
      JOIN applications a ON n.application_id = a.id
      WHERE n.id = $1 AND a.user_id = $2
    `;
    const checkResult = await db.query(checkQuery, [noteId, userId]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Note not found or unauthorized',
      });
    }

    // Delete the note
    await db.query('DELETE FROM notes WHERE id = $1', [noteId]);

    return res.status(200).json({
      success: true,
      message: 'Note deleted successfully',
      id: noteId,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNotesForApplication,
  createNote,
  deleteNote,
};
