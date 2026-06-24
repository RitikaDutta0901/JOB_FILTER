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
const corsEnv = process.env.CORS_ORIGIN || '*';
console.log('CORS config:', { CORS_ORIGIN: corsEnv, NODE_ENV: process.env.NODE_ENV || 'development' });

let corsOptions;
if (process.env.NODE_ENV === 'production') {
  corsOptions = {
    origin: corsEnv,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  };
} else {
  // In development allow the request origin (handles localhost/127.0.0.1:5173 Vite host)
  corsOptions = {
    origin: (origin, callback) => {
      // Allow requests with no origin (curl, server-to-server) and typical dev origins
      if (!origin) return callback(null, true);
      return callback(null, true);
    },
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
app.use('/api/companies', companyRoutes);

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
