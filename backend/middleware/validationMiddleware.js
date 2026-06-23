/**
 * Validation Middleware for routes
 */

// Helper to validate email format
const isValidEmail = (email) => {
  const emailRegex = /^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$/;
  return emailRegex.test(email);
};

// Validate user registration payload
const validateRegister = (req, res, next) => {
  const { username, email, password } = req.body;

  const errors = {};

  if (!username || username.trim().length < 3) {
    errors.username = 'Username must be at least 3 characters long';
  }

  if (!email || !isValidEmail(email)) {
    errors.email = 'Please provide a valid email address';
  }

  if (!password || password.length < 6) {
    errors.password = 'Password must be at least 6 characters long';
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  next();
};

// Validate login payload
const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = {};

  if (!email || !isValidEmail(email)) {
    errors.email = 'Please provide a valid email address';
  }

  if (!password) {
    errors.password = 'Password is required';
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  next();
};

// Validate job application payload
const validateApplication = (req, res, next) => {
  const { companyName, jobTitle, status, workMode, salary, appliedDate } = req.body;
  const errors = {};

  if (!companyName || companyName.trim() === '') {
    errors.companyName = 'Company name is required';
  }

  if (!jobTitle || jobTitle.trim() === '') {
    errors.jobTitle = 'Job title is required';
  }

  const validStatuses = ['Applied', 'Shortlisted', 'OA', 'Interview', 'Offer', 'Rejected', 'Withdrawn'];
  if (!status || !validStatuses.includes(status)) {
    errors.status = `Status must be one of: ${validStatuses.join(', ')}`;
  }

  const validWorkModes = ['Remote', 'Hybrid', 'On-site'];
  if (workMode && !validWorkModes.includes(workMode)) {
    errors.workMode = `Work mode must be one of: ${validWorkModes.join(', ')}`;
  }

  if (salary !== undefined && salary !== null && isNaN(Number(salary))) {
    errors.salary = 'Salary must be a valid number';
  }

  if (appliedDate && isNaN(Date.parse(appliedDate))) {
    errors.appliedDate = 'Applied date must be a valid date';
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  next();
};

// Validate interview round payload
const validateRound = (req, res, next) => {
  const { roundName, roundType, status, scheduledAt } = req.body;
  const errors = {};

  if (!roundName || roundName.trim() === '') {
    errors.roundName = 'Round name is required';
  }

  const validRoundTypes = ['OA', 'Technical', 'Behavioral', 'Managerial', 'HR', 'Other'];
  if (!roundType || !validRoundTypes.includes(roundType)) {
    errors.roundType = `Round type must be one of: ${validRoundTypes.join(', ')}`;
  }

  const validStatuses = ['Pending', 'Completed', 'Cancelled'];
  if (status && !validStatuses.includes(status)) {
    errors.status = `Status must be one of: ${validStatuses.join(', ')}`;
  }

  if (scheduledAt && isNaN(Date.parse(scheduledAt))) {
    errors.scheduledAt = 'Scheduled date/time must be a valid date';
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  next();
};

module.exports = {
  validateRegister,
  validateLogin,
  validateApplication,
  validateRound,
};
