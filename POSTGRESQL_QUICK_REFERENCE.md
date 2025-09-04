# PostgreSQL Quick Reference Guide

## 🗄️ Database Management

### Connect to PostgreSQL
```bash
# Connect as postgres user
psql -U postgres

# Connect to specific database
psql -U username -d database_name

# Connect with host and port
psql -h localhost -p 5432 -U username -d database_name
```

### Create Database and User
```sql
-- Create database
CREATE DATABASE event_center_db;

-- Create user
CREATE USER event_user WITH PASSWORD 'your_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE event_center_db TO event_user;

-- Connect to database
\c event_center_db

-- Grant schema privileges
GRANT ALL ON SCHEMA public TO event_user;
```

### Basic PostgreSQL Commands
```sql
-- List databases
\l

-- List tables
\dt

-- Describe table structure
\d table_name

-- List users
\du

-- Exit psql
\q

-- Show current database
SELECT current_database();

-- Show current user
SELECT current_user;
```

## 🔧 Prisma Commands

### Database Operations
```bash
# Initialize Prisma
npx prisma init

# Generate Prisma client
npx prisma generate

# Create and apply migration
npx prisma migrate dev --name migration_name

# Apply migrations in production
npx prisma migrate deploy

# Reset database (development only)
npx prisma migrate reset

# View database in browser
npx prisma studio

# Push schema changes without migration
npx prisma db push
```

### Schema Management
```bash
# Format schema file
npx prisma format

# Validate schema
npx prisma validate

# Introspect existing database
npx prisma db pull
```

## 📊 Common SQL Queries

### User Management
```sql
-- Get all users with profiles
SELECT u.*, up.* 
FROM users u 
LEFT JOIN user_profiles up ON u.id = up.user_id;

-- Get users by role
SELECT u.*, up.* 
FROM users u 
JOIN user_profiles up ON u.id = up.user_id 
WHERE up.role = 'ORGANIZER';

-- Count users by role
SELECT up.role, COUNT(*) as count 
FROM user_profiles up 
GROUP BY up.role;
```

### Event Management
```sql
-- Get events with organizer details
SELECT e.*, u.name as organizer_name, u.email as organizer_email
FROM events e
JOIN users u ON e.organizer_id = u.id
WHERE e.status = 'PUBLISHED'
ORDER BY e.created_at DESC;

-- Get events with registration count
SELECT e.*, COUNT(r.id) as registration_count
FROM events e
LEFT JOIN registrations r ON e.id = r.event_id
GROUP BY e.id
ORDER BY registration_count DESC;

-- Get events by category
SELECT category, COUNT(*) as event_count
FROM events
GROUP BY category;
```

### Registration Management
```sql
-- Get registrations with participant and event details
SELECT r.*, u.name as participant_name, e.title as event_title
FROM registrations r
JOIN users u ON r.participant_id = u.id
JOIN events e ON r.event_id = e.id
WHERE r.status = 'PENDING';

-- Get registration statistics
SELECT 
    status,
    COUNT(*) as count,
    ROUND(AVG(EXTRACT(EPOCH FROM (reviewed_at - registered_at))/3600), 2) as avg_review_time_hours
FROM registrations
GROUP BY status;
```

### Scoring and Judging
```sql
-- Get average scores by event
SELECT 
    e.title,
    AVG(s.total_score) as avg_score,
    COUNT(s.id) as score_count
FROM events e
LEFT JOIN scores s ON e.id = s.event_id
GROUP BY e.id, e.title
ORDER BY avg_score DESC;

-- Get judge scoring statistics
SELECT 
    u.name as judge_name,
    COUNT(s.id) as scores_given,
    AVG(s.total_score) as avg_score_given
FROM users u
JOIN user_profiles up ON u.id = up.user_id
JOIN scores s ON u.id = s.judge_id
WHERE up.role = 'JUDGE'
GROUP BY u.id, u.name;
```

## 🔐 Authentication Queries

### User Authentication
```sql
-- Find user by email
SELECT u.*, up.role
FROM users u
LEFT JOIN user_profiles up ON u.id = up.user_id
WHERE u.email = 'user@example.com';

-- Get user permissions
SELECT up.role, up.skills
FROM user_profiles up
WHERE up.user_id = 'user_id_here';

-- Check if user exists
SELECT EXISTS(
    SELECT 1 FROM users WHERE email = 'user@example.com'
);
```

## 📁 File Management

### File Operations
```sql
-- Get files by category
SELECT category, COUNT(*) as file_count, SUM(size) as total_size
FROM files
GROUP BY category;

-- Get files uploaded by user
SELECT f.*, u.name as uploader_name
FROM files f
JOIN users u ON f.uploaded_by_id = u.id
WHERE f.uploaded_by_id = 'user_id_here';

-- Get large files
SELECT name, size, uploaded_at
FROM files
WHERE size > 10485760  -- 10MB
ORDER BY size DESC;
```

## 🔔 Notification System

### Notification Queries
```sql
-- Get unread notifications for user
SELECT *
FROM notifications
WHERE user_id = 'user_id_here' AND read = false
ORDER BY created_at DESC;

-- Get notification statistics
SELECT 
    type,
    COUNT(*) as count,
    COUNT(CASE WHEN read = true THEN 1 END) as read_count
FROM notifications
GROUP BY type;

-- Get recent notifications
SELECT n.*, u.name as user_name
FROM notifications n
JOIN users u ON n.user_id = u.id
WHERE n.created_at > NOW() - INTERVAL '7 days'
ORDER BY n.created_at DESC;
```

## 🧪 Testing Queries

### Test Management
```sql
-- Get active tests
SELECT *
FROM pre_qualifier_tests
WHERE is_active = true AND end_date > NOW()
ORDER BY start_date;

-- Get test attempts by participant
SELECT ta.*, pt.title as test_title
FROM test_attempts ta
JOIN pre_qualifier_tests pt ON ta.test_id = pt.id
WHERE ta.participant_email = 'participant@example.com'
ORDER BY ta.started_at DESC;

-- Get test statistics
SELECT 
    pt.title,
    COUNT(ta.id) as attempt_count,
    AVG(ta.score) as avg_score,
    COUNT(CASE WHEN ta.status = 'COMPLETED' THEN 1 END) as completed_count
FROM pre_qualifier_tests pt
LEFT JOIN test_attempts ta ON pt.id = ta.test_id
GROUP BY pt.id, pt.title;
```

## 🔍 Performance Queries

### Index Usage
```sql
-- Check index usage
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;

-- Check table sizes
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

## 🛠️ Maintenance Queries

### Database Maintenance
```sql
-- Vacuum database
VACUUM ANALYZE;

-- Check for dead tuples
SELECT schemaname, tablename, n_dead_tup, n_live_tup
FROM pg_stat_user_tables
WHERE n_dead_tup > 0;

-- Get database size
SELECT pg_size_pretty(pg_database_size('event_center_db'));

-- Check connection count
SELECT count(*) FROM pg_stat_activity;
```

## 📈 Analytics Queries

### Event Analytics
```sql
-- Monthly event creation trend
SELECT 
    DATE_TRUNC('month', created_at) as month,
    COUNT(*) as events_created
FROM events
GROUP BY month
ORDER BY month;

-- Registration conversion rate
SELECT 
    e.title,
    e.max_participants,
    COUNT(r.id) as registrations,
    ROUND((COUNT(r.id)::float / e.max_participants) * 100, 2) as conversion_rate
FROM events e
LEFT JOIN registrations r ON e.id = r.event_id
WHERE e.status = 'COMPLETED'
GROUP BY e.id, e.title, e.max_participants
ORDER BY conversion_rate DESC;
```

## 🚨 Error Handling

### Common Error Solutions
```sql
-- Reset sequence if out of sync
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));

-- Fix foreign key constraints
ALTER TABLE registrations 
ADD CONSTRAINT fk_registrations_event 
FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE;

-- Check for orphaned records
SELECT r.id 
FROM registrations r 
LEFT JOIN events e ON r.event_id = e.id 
WHERE e.id IS NULL;
```

## 📝 Migration Tips

### Data Migration
```sql
-- Backup table before migration
CREATE TABLE events_backup AS SELECT * FROM events;

-- Restore from backup
INSERT INTO events SELECT * FROM events_backup;

-- Check data integrity
SELECT COUNT(*) FROM events;
SELECT COUNT(*) FROM registrations;
SELECT COUNT(*) FROM users;
```

---

**💡 Pro Tips:**
- Always backup your database before major changes
- Use transactions for data consistency
- Monitor query performance with `EXPLAIN ANALYZE`
- Set up regular database maintenance tasks
- Use prepared statements to prevent SQL injection
- Keep your Prisma client updated with `npx prisma generate`
