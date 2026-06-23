-- Database Schema for Job/Internship Application Tracker

-- Enable UUID extension if we want to use UUIDs in future (keeping standard SERIAL for simplicity but ready for extensions)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist to start fresh during setup
DROP TABLE IF EXISTS notes CASCADE;
DROP TABLE IF EXISTS rounds CASCADE;
DROP TABLE IF EXISTS applications CASCADE;
DROP TABLE IF EXISTS companies CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 1. Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL CHECK (char_length(username) >= 3),
    email VARCHAR(100) UNIQUE NOT NULL CHECK (email ~* '^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$'),
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Companies Table
CREATE TABLE companies (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    website VARCHAR(255),
    industry VARCHAR(100),
    logo_url VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Applications Table
CREATE TABLE applications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE RESTRICT,
    job_title VARCHAR(100) NOT NULL,
    job_description TEXT,
    job_url VARCHAR(255),
    salary NUMERIC(12, 2) CHECK (salary >= 0),
    location VARCHAR(100),
    work_mode VARCHAR(50) CHECK (work_mode IN ('Remote', 'Hybrid', 'On-site')),
    status VARCHAR(50) NOT NULL DEFAULT 'Applied' CHECK (status IN ('Applied', 'Shortlisted', 'OA', 'Interview', 'Offer', 'Rejected', 'Withdrawn')),
    applied_date DATE NOT NULL DEFAULT CURRENT_DATE,
    deadline TIMESTAMP WITH TIME ZONE,
    resume_url VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Rounds Table (Interview and assessment rounds)
CREATE TABLE rounds (
    id SERIAL PRIMARY KEY,
    application_id INTEGER NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    round_name VARCHAR(100) NOT NULL, -- e.g., 'Resume Screening', 'Online Assessment', 'Technical Interview 1', 'HR Round'
    round_type VARCHAR(50) NOT NULL CHECK (round_type IN ('OA', 'Technical', 'Behavioral', 'Managerial', 'HR', 'Other')),
    scheduled_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Completed', 'Cancelled')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Notes Table
CREATE TABLE notes (
    id SERIAL PRIMARY KEY,
    application_id INTEGER NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for Query Optimization
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_applications_user_id ON applications(user_id);
CREATE INDEX idx_applications_company_id ON applications(company_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_rounds_application_id ON rounds(application_id);
CREATE INDEX idx_notes_application_id ON notes(application_id);

-- Trigger Function to update updated_at automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create Triggers
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_companies_updated_at 
    BEFORE UPDATE ON companies 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_applications_updated_at 
    BEFORE UPDATE ON applications 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rounds_updated_at 
    BEFORE UPDATE ON rounds 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notes_updated_at 
    BEFORE UPDATE ON notes 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
