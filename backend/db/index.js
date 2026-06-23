const { Pool } = require('pg');
require('dotenv').config();

// Construct connection config
const dbConfig = {
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_DATABASE || 'job_tracker_db',
  password: process.env.DB_PASSWORD || undefined,
  port: parseInt(process.env.DB_PORT || '5432', 10),
};

// Check in production/development
const pool = new Pool(dbConfig);

// Debug connection events
pool.on('connect', () => {
  if (process.env.NODE_ENV !== 'test') {
    console.log('PostgreSQL database pool connected successfully');
  }
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};
