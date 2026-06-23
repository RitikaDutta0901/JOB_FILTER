const db = require('../db');

/**
 * @desc    Get all rounds for a specific application
 * @route   GET /api/applications/:id/rounds
 * @access  Private
 */
const getRoundsForApplication = async (req, res, next) => {
  const userId = req.user.id;
  const applicationId = req.params.id;

  try {
    // 1. Verify application ownership
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

    // 2. Fetch rounds
    const roundsQuery = `
      SELECT * FROM rounds 
      WHERE application_id = $1 
      ORDER BY scheduled_at ASC, id ASC
    `;
    const result = await db.query(roundsQuery, [applicationId]);

    return res.status(200).json({
      success: true,
      count: result.rows.length,
      rounds: result.rows,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add a round to an application
 * @route   POST /api/applications/:id/rounds
 * @access  Private
 */
const createRound = async (req, res, next) => {
  const userId = req.user.id;
  const applicationId = req.params.id;
  const { roundName, roundType, scheduledAt, status, notes } = req.body;

  try {
    // 1. Verify application ownership
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

    // 2. Insert Round
    const insertQuery = `
      INSERT INTO rounds (application_id, round_name, round_type, scheduled_at, status, notes)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const params = [
      applicationId,
      roundName.trim(),
      roundType,
      scheduledAt || null,
      status || 'Pending',
      notes || null,
    ];

    const result = await db.query(insertQuery, params);

    return res.status(201).json({
      success: true,
      message: 'Interview round created successfully',
      round: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a specific round
 * @route   PUT /api/rounds/:id
 * @access  Private
 */
const updateRound = async (req, res, next) => {
  const userId = req.user.id;
  const roundId = req.params.id;
  const { roundName, roundType, scheduledAt, status, notes } = req.body;

  try {
    // 1. Verify round exists and belongs to user's application
    const checkQuery = `
      SELECT r.id, r.application_id 
      FROM rounds r
      JOIN applications a ON r.application_id = a.id
      WHERE r.id = $1 AND a.user_id = $2
    `;
    const checkResult = await db.query(checkQuery, [roundId, userId]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Interview round not found or unauthorized',
      });
    }

    // 2. Perform Update
    const updateQuery = `
      UPDATE rounds
      SET
        round_name = COALESCE($1, round_name),
        round_type = COALESCE($2, round_type),
        scheduled_at = $3,
        status = COALESCE($4, status),
        notes = $5
      WHERE id = $6
      RETURNING *
    `;

    const params = [
      roundName ? roundName.trim() : null,
      roundType || null,
      scheduledAt || null,
      status || null,
      notes || null,
      roundId,
    ];

    const result = await db.query(updateQuery, params);

    return res.status(200).json({
      success: true,
      message: 'Interview round updated successfully',
      round: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a specific round
 * @route   DELETE /api/rounds/:id
 * @access  Private
 */
const deleteRound = async (req, res, next) => {
  const userId = req.user.id;
  const roundId = req.params.id;

  try {
    // 1. Verify ownership
    const checkQuery = `
      SELECT r.id 
      FROM rounds r
      JOIN applications a ON r.application_id = a.id
      WHERE r.id = $1 AND a.user_id = $2
    `;
    const checkResult = await db.query(checkQuery, [roundId, userId]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Interview round not found or unauthorized',
      });
    }

    // 2. Delete round
    await db.query('DELETE FROM rounds WHERE id = $1', [roundId]);

    return res.status(200).json({
      success: true,
      message: 'Interview round deleted successfully',
      id: roundId,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRoundsForApplication,
  createRound,
  updateRound,
  deleteRound,
};
