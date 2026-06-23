const bcrypt = require('bcryptjs');
const db = require('../db');
const { generateToken } = require('../utils/jwtHelper');

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res, next) => {
  const { username, email, password } = req.body;

  try {
    // 1. Check if email or username already exists
    const checkUserQuery = 'SELECT id, email, username FROM users WHERE email = $1 OR username = $2';
    const checkResult = await db.query(checkUserQuery, [email, username]);

    if (checkResult.rows.length > 0) {
      const existingUser = checkResult.rows[0];
      if (existingUser.email === email) {
        return res.status(400).json({
          success: false,
          message: 'A user with this email address already exists.',
        });
      }
      if (existingUser.username === username) {
        return res.status(400).json({
          success: false,
          message: 'This username is already taken.',
        });
      }
    }

    // 2. Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 3. Insert user into DB
    const insertQuery = `
      INSERT INTO users (username, email, password_hash)
      VALUES ($1, $2, $3)
      RETURNING id, username, email, created_at
    `;
    const result = await db.query(insertQuery, [username, email, passwordHash]);
    const user = result.rows[0];

    // 4. Generate JWT
    const token = generateToken(user);

    // 5. Send response
    return res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Log in user
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    // 1. Fetch user from DB
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await db.query(query, [email]);

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const user = result.rows[0];

    // 2. Check password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // 3. Generate JWT
    const token = generateToken(user);

    // 4. Send response
    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
};
