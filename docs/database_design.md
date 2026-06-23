# Relational Database Design Documentation

This document describes the PostgreSQL database schema for the Job/Internship Application Tracker.

## Entity Relationship Diagram (ERD) Conceptual Schema

```mermaid
erDiagram
    USERS ||--o{ APPLICATIONS : "creates"
    COMPANIES ||--o{ APPLICATIONS : "receives application"
    APPLICATIONS ||--o{ ROUNDS : "contains"
    APPLICATIONS ||--o{ NOTES : "has"

    USERS {
        int id PK
        string username UNIQUE
        string email UNIQUE
        string password_hash
        timestamp created_at
        timestamp updated_at
    }

    COMPANIES {
        int id PK
        string name UNIQUE
        string website
        string industry
        string logo_url
        timestamp created_at
        timestamp updated_at
    }

    APPLICATIONS {
        int id PK
        int user_id FK
        int company_id FK
        string job_title
        text job_description
        string job_url
        numeric salary
        string location
        string work_mode
        string status
        date applied_date
        timestamp deadline
        string resume_url
        timestamp created_at
        timestamp updated_at
    }

    ROUNDS {
        int id PK
        int application_id FK
        string round_name
        string round_type
        timestamp scheduled_at
        string status
        text notes
        timestamp created_at
        timestamp updated_at
    }

    NOTES {
        int id PK
        int application_id FK
        text content
        timestamp created_at
        timestamp updated_at
    }
```

---

## Table Details

### 1. `users` Table
Stores user registration info. Custom constraints validate emails and minimum username length.
- **Constraints**:
  - `username` check length >= 3.
  - `email` check regex pattern match to verify structural validity.
- **Indexes**:
  - `idx_users_email` (implicitly generated unique index, added explicit non-unique index to speed up lookup/joins if required, although unique constraints automatically construct B-tree indexes).

### 2. `companies` Table
Stores records of different companies. Unique on name to prevent duplication, acting as a normalized lookup catalog.

### 3. `applications` Table
Stores the application details.
- **Constraints**:
  - `salary` check greater than or equal to 0.
  - `work_mode` constrained to `Remote`, `Hybrid`, `On-site`.
  - `status` constrained to `Applied`, `Shortlisted`, `OA`, `Interview`, `Offer`, `Rejected`, `Withdrawn`.
- **Foreign Keys**:
  - `user_id` links to `users(id)` with `ON DELETE CASCADE`. If a user deletes their profile, all their tracking records are cleared.
  - `company_id` links to `companies(id)` with `ON DELETE RESTRICT` to ensure company entity lookup catalogs are preserved as long as applications reference them.
- **Indexes**:
  - `idx_applications_user_id`: Crucial since all applications are fetched filter-by-user.
  - `idx_applications_company_id`: Useful for grouping analytics.
  - `idx_applications_status`: Optimizes search filtering dashboard queries.

### 4. `rounds` Table
Stores interview rounds associated with an application (OA, Technical, Behavioral, Managerial, HR, etc.).
- **Constraints**:
  - `round_type` checked for OA, Technical, Behavioral, Managerial, HR, Other.
  - `status` checked for Pending, Completed, Cancelled.
- **Foreign Keys**:
  - `application_id` links to `applications(id)` with `ON DELETE CASCADE`.

### 5. `notes` Table
Stores miscellaneous application notes.
- **Foreign Keys**:
  - `application_id` links to `applications(id)` with `ON DELETE CASCADE`.

---

## Automated Timestamps (Production-Grade Design)
To avoid having to manually send `updated_at = CURRENT_TIMESTAMP` values in raw SQL updates, we implement a trigger function `update_updated_at_column()` using PL/pgSQL:
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';
```
This is bound to every table on `BEFORE UPDATE` which updates the field automatically at the database level, ensuring data integrity.
