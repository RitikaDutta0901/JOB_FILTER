-- Seed Data for Job/Internship Application Tracker

-- Clear existing data (in correct dependency order)
TRUNCATE interview_roadmap_topics, notes, rounds, applications, companies, users RESTART IDENTITY CASCADE;

-- 1. Seed Users (password for both is 'password123' using standard bcrypt format)
-- NOTE: Updated to a bcrypt hash that matches 'password123'
INSERT INTO users (username, email, password_hash) VALUES
('ritika_admin', 'admin@example.com', '$2a$10$9WXXqGmdAltU6Ra0Jic8MuAccTeKs1y3HGIRQt5fZO5EssKJmRCAm'),
('john_doe', 'john@example.com', '$2a$10$9WXXqGmdAltU6Ra0Jic8MuAccTeKs1y3HGIRQt5fZO5EssKJmRCAm');

-- 2. Seed Companies
INSERT INTO companies (name, website, industry, logo_url) VALUES
('Google', 'https://google.com', 'Tech / Search', 'https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg'),
('Meta', 'https://meta.com', 'Tech / Social Media', 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Meta_Platforms_Inc._logo.svg'),
('Netflix', 'https://netflix.com', 'Entertainment / Streaming', 'https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg'),
('Amazon', 'https://amazon.com', 'E-Commerce / Cloud', 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg'),
('Microsoft', 'https://microsoft.com', 'Tech / Software', 'https://upload.wikimedia.org/wikipedia/commons/9/96/Microsoft_logo_%282012%29.svg'),
('Stripe', 'https://stripe.com', 'Finance / Payments', 'https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_blue.svg');

-- 3. Seed Applications (Assigned to john_doe, user_id = 2)
-- Using dates relative to current time to mock a realistic pipeline
INSERT INTO applications (user_id, company_id, job_title, job_description, job_url, salary, location, work_mode, status, applied_date, deadline) VALUES
(2, 1, 'Software Engineer', 'Generalist software engineering role working on backend cloud systems.', 'https://careers.google.com/jobs/1234', 150000.00, 'Mountain View, CA', 'Hybrid', 'Offer', '2026-05-01', '2026-05-15 23:59:59+00'),
(2, 2, 'Frontend Engineer', 'React and JavaScript heavy application development on the core social feed team.', 'https://metacareers.com/jobs/5678', 160000.00, 'Menlo Park, CA', 'On-site', 'Interview', '2026-05-15', '2026-06-01 23:59:59+00'),
(2, 3, 'Senior Full-stack Engineer', 'Designing high-throughput streaming systems using Node.js and React.', 'https://jobs.netflix.com/jobs/9101', 200000.00, 'Los Gatos, CA', 'Remote', 'OA', '2026-06-01', '2026-06-30 23:59:59+00'),
(2, 4, 'Software Development Engineer II', 'Working on AWS EC2 orchestration layer systems using Java and Go.', 'https://amazon.jobs/jobs/1121', 145000.00, 'Seattle, WA', 'Hybrid', 'Rejected', '2026-04-10', NULL),
(2, 5, 'Backend Developer', 'Developing APIs and storage solutions using ASP.NET Core and Azure SQL.', 'https://careers.microsoft.com/jobs/3141', 135000.00, 'Redmond, WA', 'Hybrid', 'Shortlisted', '2026-06-10', '2026-07-05 23:59:59+00'),
(2, 6, 'Product Engineer', 'Building merchant dashboard features using React, Ruby on Rails, and Postgres.', 'https://stripe.com/jobs/5161', 155000.00, 'San Francisco, CA', 'Remote', 'Applied', '2026-06-20', '2026-07-15 23:59:59+00');

-- 4. Seed Interview/Assessment Rounds
-- Google rounds (completed to Offer)
INSERT INTO rounds (application_id, round_name, round_type, scheduled_at, status, notes) VALUES
(1, 'Resume Screening', 'Other', '2026-05-03 10:00:00+00', 'Completed', 'Recruiter phone screen went well. Handed off to technical coordinator.'),
(1, 'Online Assessment', 'OA', '2026-05-08 14:00:00+00', 'Completed', 'Solved 2/2 coding tasks. Focus was on graphs and dynamic programming.'),
(1, 'Technical Interview 1', 'Technical', '2026-05-18 15:00:00+00', 'Completed', 'Coding interview: solved a binary search tree reconstruction problem in 35 minutes.'),
(1, 'Technical Interview 2', 'Technical', '2026-05-19 16:30:00+00', 'Completed', 'Coding interview: graph coloring problem. Optimal time complexity O(V+E).'),
(1, 'HR / Fit Round', 'HR', '2026-05-25 11:00:00+00', 'Completed', 'Behavioral round, discussed career goals and alignment with core values.');

-- Meta rounds (ongoing)
INSERT INTO rounds (application_id, round_name, round_type, scheduled_at, status, notes) VALUES
(2, 'Resume Screening', 'Other', '2026-05-18 09:00:00+00', 'Completed', 'Screened by sourcer. Basic details checked.'),
(2, 'Technical Phone Screen', 'Technical', '2026-05-28 14:00:00+00', 'Completed', 'Solved 2 medium array/string manipulation questions. Recruiter scheduled on-site rounds.'),
(2, 'Onsite System Design', 'Technical', '2026-06-26 15:00:00+00', 'Pending', 'Prepare for designing a feed system or real-time notification engine.');

-- Netflix rounds (ongoing)
INSERT INTO rounds (application_id, round_name, round_type, scheduled_at, status, notes) VALUES
(3, 'Online Assessment', 'OA', '2026-06-24 10:00:00+00', 'Pending', 'Codesignal test link received. Needs to be completed by tomorrow.');

-- Microsoft rounds (ongoing)
INSERT INTO rounds (application_id, round_name, round_type, scheduled_at, status, notes) VALUES
(5, 'Resume Screening', 'Other', '2026-06-12 11:00:00+00', 'Completed', 'Initial screening passed.');

-- 5. Seed Notes
INSERT INTO notes (application_id, content) VALUES
(1, 'Google HR recruiter mentioned that stock options vest over 4 years with a 1-year cliff.'),
(1, 'Google offer negotiated successfully to base $150k + 15% bonus + $80k equity.'),
(2, 'Meta onsite consists of 2 coding rounds, 1 system design, and 1 behavioral (Jedi) round.'),
(3, 'Netflix has a high emphasis on ownership, freedom, and responsibility. Read their culture memo.'),
(4, 'Amazon rejected after online assessment. Need to work on speed and practice more on LP (Leadership Principles).'),
(5, 'Microsoft recruiter mentioned they are currently hiring for Azure Functions team.');
