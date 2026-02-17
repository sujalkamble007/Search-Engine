-- ══════════════════════════════════════════════════════════════════════════════
-- LOCAL POSTGRESQL SETUP SCRIPT
-- Run this as postgres superuser: psql -U postgres -f setup-local.sql
-- ══════════════════════════════════════════════════════════════════════════════

-- 1. Create database
CREATE DATABASE searchengine;

-- 2. Create user with password
CREATE USER searchuser WITH PASSWORD 'search123';

-- 3. Grant connection privilege
GRANT ALL PRIVILEGES ON DATABASE searchengine TO searchuser;

-- 4. Connect to the database and grant schema privileges
\c searchengine

-- 5. Grant schema privileges
GRANT ALL ON SCHEMA public TO searchuser;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO searchuser;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO searchuser;

-- 6. Auto-grant for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO searchuser;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO searchuser;

-- Done! Now run schema.sql to create tables
\echo 'Database setup complete! Now run: psql -U searchuser -d searchengine -f schema.sql'
