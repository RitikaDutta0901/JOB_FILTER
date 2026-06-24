const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const db = require('./db');
const authRoutes = require('./routes/authRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const roundRoutes = require('./routes/roundRoutes');
const companyRoutes = require('./routes/companyRoutes');
const noteRoutes = require('./routes/noteRoutes');
const errorHandler = require('./middleware/errorMiddleware');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS
// Security headers
app.use(helmet());

// CORS configuration (allow override via CORS_ORIGIN env var)
const corsOrigin = process.env.CORS_ORIGIN || '*';
app.use(cors({
  origin: corsOrigin,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body parser
app.use(express.json());

// Simple health check route
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    message: 'Job Tracker API is running smoothly',
    timestamp: new Date(),
  });
});

// Root route
app.get('/', (req, res) => {
  res.send('Welcome to the Job / Internship Application Tracker API.');
});

// Route mounting
app.use('/api/auth', authRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api', roundRoutes); // handles /api/applications/:id/rounds and /api/rounds/:id
app.use('/api', noteRoutes);  // handles /api/applications/:id/notes and /api/notes/:id
app.use('/api/companies', companyRoutes);

// Catch 404 routes
app.use((req, res, next) => {
  const error = new Error(`Route Not Found - ${req.method} ${req.url}`);
  error.statusCode = 404;
  next(error);
});

// Global Error Handler Middleware
app.use(errorHandler);

// Start server
const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Handle unhandled rejections/exceptions
process.on('unhandledRejection', (err) => {
  console.error(`Unhandled Rejection: ${err.message}`);
  // Keep server running in dev, but could log/gracefully exit in prod
});

module.exports = app; // Export for testing
