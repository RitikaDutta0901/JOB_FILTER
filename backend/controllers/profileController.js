const db = require('../db');
const bcrypt = require('bcryptjs');

const getProfile = async (req, res, next) => {
  const userId = req.user.id;

  try {
    const result = await db.query(
      'SELECT id, username, email, created_at, updated_at FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.status(200).json({ success: true, user: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  const userId = req.user.id;
  const { username, email } = req.body;

  try {
    const updates = [];
    const params = [];
    let idx = 1;

    if (username !== undefined) {
      if (username.trim().length < 3) {
        return res.status(400).json({ success: false, message: 'Username must be at least 3 characters' });
      }
      const existing = await db.query('SELECT id FROM users WHERE username = $1 AND id != $2', [username.trim(), userId]);
      if (existing.rows.length > 0) {
        return res.status(400).json({ success: false, message: 'Username already taken' });
      }
      updates.push(`username = $${idx++}`);
      params.push(username.trim());
    }

    if (email !== undefined) {
      const emailRegex = /^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ success: false, message: 'Invalid email format' });
      }
      const existing = await db.query('SELECT id FROM users WHERE email = $1 AND id != $2', [email, userId]);
      if (existing.rows.length > 0) {
        return res.status(400).json({ success: false, message: 'Email already in use' });
      }
      updates.push(`email = $${idx++}`);
      params.push(email);
    }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: 'No fields to update' });
    }

    params.push(userId);
    const result = await db.query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = $${idx} RETURNING id, username, email, created_at, updated_at`,
      params
    );

    return res.status(200).json({ success: true, user: result.rows[0], message: 'Profile updated successfully' });
  } catch (error) {
    next(error);
  }
};

const updatePassword = async (req, res, next) => {
  const userId = req.user.id;
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ success: false, message: 'Current and new password are required' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
  }

  try {
    const userResult = await db.query('SELECT password_hash FROM users WHERE id = $1', [userId]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isValid = await bcrypt.compare(currentPassword, userResult.rows[0].password_hash);
    if (!isValid) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await db.query('UPDATE users SET password_hash = $1 WHERE id = $2', [passwordHash, userId]);

    return res.status(200).json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getProfile, updateProfile, updatePassword };
