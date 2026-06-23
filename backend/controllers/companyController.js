const db = require('../db');

/**
 * @desc    Get all companies
 * @route   GET /api/companies
 * @access  Private
 */
const getCompanies = async (req, res, next) => {
  try {
    const query = 'SELECT * FROM companies ORDER BY name ASC';
    const result = await db.query(query);

    return res.status(200).json({
      success: true,
      count: result.rows.length,
      companies: result.rows,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCompanies,
};
