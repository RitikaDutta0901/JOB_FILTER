const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { forgotPassword, resetPassword } = require('../controllers/passwordResetController');

const resetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { success: false, message: 'Too many reset attempts. Try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/forgot-password', resetLimiter, forgotPassword);
router.post('/reset-password', resetLimiter, resetPassword);

module.exports = router;
