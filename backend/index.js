const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const db = require('./db');
const authRoutes = require('./routes/authRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const roundRoutes = require('./routes/roundRoutes');
const companyRoutes = require('./routes/companyRoutes');
const profileRoutes = require('./routes/profileRoutes');
const noteRoutes = require('./routes/noteRoutes');
const roadmapRoutes = require('./routes/roadmapRoutes');
const passwordResetRoutes = require('./routes/passwordResetRoutes');
const exportRoutes = require('./routes/exportRoutes');
const errorHandler = require('./middleware/errorMiddleware');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS
// Security headers
app.use(helmet());

let corsOptions;
if (process.env.NODE_ENV === 'production') {
  const corsOrigin = process.env.CORS_ORIGIN;
  if (!corsOrigin) {
    console.warn('WARNING: CORS_ORIGIN not set. Allowing same-origin only.');
  }
  corsOptions = {
    origin: corsOrigin || false,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  };
} else {
  corsOptions = {
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  };
}
app.use(cors(corsOptions));

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
app.use('/api', roadmapRoutes); // handles /api/applications/:id/roadmap and /api/roadmap-topics/:id
app.use('/api/companies', companyRoutes);
app.use('/api/users', profileRoutes);
app.use('/api/auth', passwordResetRoutes);
app.use('/api', exportRoutes);

// Catch 404 routes
app.use((req, res, next) => {
  const error = new Error(`Route Not Found - ${req.method} ${req.url}`);
  error.statusCode = 404;
  next(error);
});

// Global Error Handler Middleware
app.use(errorHandler);

// Start server with robust error handling
let server;
// Only start the HTTP server when not in test mode to allow supertest to import the app
if (process.env.NODE_ENV !== 'test') {
  try {
    server = app.listen(PORT, () => {
      console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    }).on('error', (err) => {
      if (err && err.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. If this is unexpected, run \`fuser -k ${PORT}/tcp\` to free it, or set a different PORT via environment.`);
        process.exit(1);
      }
      console.error('Server error:', err);
      process.exit(1);
    });
  } catch (err) {
    console.error('Failed to start server (synchronous error):', err);
    process.exit(1);
  }
}

// Catch uncaught exceptions so we don't see unhandled 'error' crashes
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err && err.stack ? err.stack : err);
  process.exit(1);
});

// Handle unhandled rejections/exceptions
process.on('unhandledRejection', (err) => {
  console.error(`Unhandled Rejection: ${err && err.message ? err.message : err}`);
});

module.exports = app; // Export for testing
