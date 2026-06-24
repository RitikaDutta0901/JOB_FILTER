# Job & Internship Application Tracker

A placement-ready, full-stack application built to track job and internship applications, interview rounds, and application statistics. This project demonstrates high-quality software architecture, raw SQL querying, database indexing, JWT authentication, and a clean frontend-backend split.

## Technology Stack

- **Frontend**: React.js, Vite, Axios, Tailwind CSS, Context API, Recharts (for Analytics)
- **Backend**: Node.js, Express.js, PostgreSQL (pg driver), JWT Authentication, Bcrypt (password hashing)
- **Database**: PostgreSQL (DDL schemas, constraints, custom triggers, database indexes)

---

## Project Structure

```
project-root
│
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable UI elements (Navbar, Sidebar, etc.)
│   │   ├── pages/       # Page components (Login, Dashboard, Application details, etc.)
│   │   ├── context/     # Auth Context and Application Global state
│   │   ├── services/    # API calling layer (Axios interceptors)
│   │   ├── routes/      # Frontend Routing definition
│   │   └── assets/      # Dynamic static assets (logos, icons)
│   ├── package.json
│   └── tailwind.config.js
│
├── backend/
│   ├── controllers/     # HTTP request handlers containing route logic
│   ├── routes/          # Express route definitions
│   ├── middleware/      # Authentication, Validation, and Error middleware
│   ├── db/              # Database connection pools
│   ├── models/          # Raw SQL schema query runners
│   ├── utils/           # Encryption, JWT helper, and date formatters
│   ├── config/          # Environment configuration loaders
│   └── package.json
│
├── database/
│   ├── schema.sql       # Database schema initialization script
│   └── seed.sql         # Seed data script for testing
│
├── docs/                # System documentation
│
├── README.md            # Project main documentation
├── .env.example         # Environment template
└── .gitignore           # Version control ignore lists
```

---

## Database Design

The relational database is built using **PostgreSQL** with a fully normalized design containing five tables:

1. **`users`**: Manages credentials and unique profiles.
2. **`companies`**: Centralized records of companies applied to (ensuring analytics can easily query patterns across users).
3. **`applications`**: Core tracking record containing job description, work mode, salary, status, and deadlines.
4. **`rounds`**: Tracks interview stages (OA, Technical, HR, etc.) dynamically.
5. **`notes`**: Enables free-form text remarks for application tracking.

### DDL Schema and Seeding
- Schema details are in [database/schema.sql](file:///home/ritika/JOB_FILTER/database/schema.sql)
- Sample seeds are in [database/seed.sql](file:///home/ritika/JOB_FILTER/database/seed.sql)

---

## Installation & Setup

### Prerequisites
- Node.js (v18+)
- PostgreSQL (v14+)
- Docker (optional, for containerized runs)

### 1. Database Setup (local)
Start Postgres and create the database, then run migrations and seed data:

```bash
createdb job_tracker_db
psql -d job_tracker_db -f database/schema.sql
psql -d job_tracker_db -f database/seed.sql
```

### 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Update .env with your DB credentials and JWT secret
npm run dev
```

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### Docker (optional)
Build and run containers using the provided `docker-compose.yml`:

```bash
docker-compose up --build
```
