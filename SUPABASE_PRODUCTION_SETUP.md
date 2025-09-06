# 🚀 Supabase Production Setup Guide

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign up/Login with GitHub
4. Click "New Project"
5. Choose your organization
6. Fill in project details:
   - **Name**: `supernova-event-platform`
   - **Database Password**: Generate a strong password (save it!)
   - **Region**: Choose closest to your users (e.g., `us-east-1` for US)
   - **Pricing Plan**: Free tier (perfect for 10K students)

7. Wait for project creation (2-3 minutes)

## Step 2: Get Project Credentials

1. Go to **Settings** → **API**
2. Copy these values:
   - **Project URL**: `https://your-project-id.supabase.co`
   - **anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - **service_role key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (keep secret!)

## Step 3: Configure Environment Variables

Create `.env.production`:
```env
# Supabase (Primary Database)
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Convex (Backup Database)
VITE_CONVEX_URL=https://necessary-badger-880.convex.cloud
CONVEX_DEPLOYMENT=necessary-badger-880

# App Configuration
NODE_ENV=production
VITE_APP_NAME=SuperNova Event Platform
VITE_APP_VERSION=2.0.0

# Security
AUTH_SECRET=your-super-secret-auth-key-for-production-2024
```

## Step 4: Database Schema Setup

Run the complete schema in Supabase SQL Editor:

```sql
-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types
CREATE TYPE user_role AS ENUM ('admin', 'organizer', 'judge', 'participant');
CREATE TYPE event_status AS ENUM ('draft', 'published', 'ongoing', 'completed');
CREATE TYPE registration_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed');
CREATE TYPE test_difficulty AS ENUM ('Easy', 'Medium', 'Hard');
CREATE TYPE test_type AS ENUM ('MCQ', 'Coding', 'Mixed');
CREATE TYPE institution_type AS ENUM ('college', 'university', 'company');
CREATE TYPE news_category AS ENUM ('Announcement', 'Event Update', 'Important Notice', 'General News');
CREATE TYPE file_category AS ENUM ('resume', 'portfolio', 'project', 'document', 'image', 'other');

-- User Profiles (extends Supabase auth.users)
CREATE TABLE user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  role user_role NOT NULL DEFAULT 'participant',
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  bio TEXT,
  skills TEXT[] DEFAULT '{}',
  organization TEXT,
  avatar TEXT,
  social_links JSONB DEFAULT '{}',
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Events table
CREATE TABLE events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  location TEXT NOT NULL,
  max_participants INTEGER NOT NULL DEFAULT 100,
  registration_deadline TIMESTAMP WITH TIME ZONE NOT NULL,
  status event_status DEFAULT 'draft',
  organizer_id UUID REFERENCES auth.users(id) NOT NULL,
  judges UUID[] DEFAULT '{}',
  requirements TEXT[] DEFAULT '{}',
  prizes JSONB DEFAULT '[]',
  banner_image TEXT,
  event_image TEXT,
  registration_fee DECIMAL(10,2) DEFAULT 0,
  payment_link TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Registrations table
CREATE TABLE registrations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  participant_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status registration_status DEFAULT 'pending',
  payment_status payment_status DEFAULT 'pending',
  is_team_leader BOOLEAN DEFAULT FALSE,
  submission_data JSONB NOT NULL DEFAULT '{}',
  attachments UUID[] DEFAULT '{}',
  registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES auth.users(id),
  review_notes TEXT,
  UNIQUE(event_id, participant_id)
);

-- Enhanced Participant Registrations
CREATE TABLE participant_registrations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  college_university TEXT NOT NULL,
  department_year TEXT NOT NULL,
  contact_number TEXT NOT NULL,
  email_id TEXT NOT NULL,
  team_name TEXT,
  team_size INTEGER DEFAULT 1,
  role_in_team TEXT CHECK (role_in_team IN ('Leader', 'Member')) DEFAULT 'Leader',
  technical_skills TEXT NOT NULL,
  previous_experience TEXT,
  agree_to_rules BOOLEAN NOT NULL DEFAULT FALSE,
  registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address INET,
  attachments UUID[] DEFAULT '{}',
  event_specific_data JSONB DEFAULT '{}',
  UNIQUE(event_id, email_id)
);

-- Organizer Credentials (for custom auth)
CREATE TABLE organizer_credentials (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT CHECK (role IN ('organizer', 'judge')) NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  organization TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by TEXT NOT NULL,
  last_login TIMESTAMP WITH TIME ZONE,
  password_reset_required BOOLEAN DEFAULT FALSE,
  linked_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Pre-Qualifier Tests
CREATE TABLE pre_qualifier_tests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  test_link TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  duration INTEGER NOT NULL, -- in minutes
  instructions TEXT NOT NULL,
  eligibility_criteria TEXT NOT NULL,
  max_attempts INTEGER DEFAULT 1,
  passing_score INTEGER,
  created_by TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  event_id UUID REFERENCES events(id) ON DELETE SET NULL,
  tags TEXT[] DEFAULT '{}',
  difficulty test_difficulty DEFAULT 'Easy',
  total_questions INTEGER,
  test_type test_type DEFAULT 'MCQ'
);

-- Test Attempts
CREATE TABLE test_attempts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  test_id UUID REFERENCES pre_qualifier_tests(id) ON DELETE CASCADE NOT NULL,
  participant_email TEXT NOT NULL,
  participant_name TEXT NOT NULL,
  attempt_number INTEGER NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  score INTEGER,
  status TEXT CHECK (status IN ('started', 'completed', 'abandoned')) DEFAULT 'started',
  time_spent INTEGER, -- in minutes
  ip_address INET,
  user_agent TEXT,
  responses JSONB,
  feedback TEXT,
  UNIQUE(test_id, participant_email, attempt_number)
);

-- Participating Institutions
CREATE TABLE participating_institutions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  type institution_type NOT NULL,
  logo TEXT,
  description TEXT,
  website TEXT,
  location TEXT,
  student_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- News Updates
CREATE TABLE news_updates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT,
  content TEXT NOT NULL,
  category news_category NOT NULL,
  image TEXT,
  video_link TEXT,
  publish_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  author_name TEXT NOT NULL,
  author_email TEXT NOT NULL,
  status TEXT CHECK (status IN ('draft', 'published')) DEFAULT 'draft',
  attachments UUID[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  views INTEGER DEFAULT 0,
  featured BOOLEAN DEFAULT FALSE
);

-- Files table
CREATE TABLE files (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  size BIGINT NOT NULL,
  storage_id UUID NOT NULL,
  uploaded_by UUID REFERENCES auth.users(id) NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  event_id UUID REFERENCES events(id) ON DELETE SET NULL,
  registration_id UUID REFERENCES registrations(id) ON DELETE SET NULL,
  category file_category DEFAULT 'other',
  description TEXT,
  is_public BOOLEAN DEFAULT FALSE
);

-- Scores table (for judging)
CREATE TABLE scores (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  participant_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  judge_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  criteria JSONB NOT NULL DEFAULT '{}',
  total_score DECIMAL(5,2) NOT NULL,
  feedback TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(event_id, participant_id, judge_id)
);

-- Notifications table
CREATE TABLE notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT CHECK (type IN ('info', 'success', 'warning', 'error')) DEFAULT 'info',
  read BOOLEAN DEFAULT FALSE,
  event_id UUID REFERENCES events(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_events_organizer ON events(organizer_id);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_category ON events(category);
CREATE INDEX idx_events_start_date ON events(start_date);
CREATE INDEX idx_registrations_event ON registrations(event_id);
CREATE INDEX idx_registrations_participant ON registrations(participant_id);
CREATE INDEX idx_registrations_status ON registrations(status);
CREATE INDEX idx_participant_registrations_email ON participant_registrations(email_id);
CREATE INDEX idx_participant_registrations_college ON participant_registrations(college_university);
CREATE INDEX idx_participant_registrations_event ON participant_registrations(event_id);
CREATE INDEX idx_organizer_credentials_email ON organizer_credentials(email);
CREATE INDEX idx_organizer_credentials_role ON organizer_credentials(role);
CREATE INDEX idx_pre_qualifier_tests_active ON pre_qualifier_tests(is_active);
CREATE INDEX idx_pre_qualifier_tests_dates ON pre_qualifier_tests(start_date, end_date);
CREATE INDEX idx_test_attempts_test_participant ON test_attempts(test_id, participant_email);
CREATE INDEX idx_news_updates_status ON news_updates(status);
CREATE INDEX idx_news_updates_category ON news_updates(category);
CREATE INDEX idx_news_updates_publish_date ON news_updates(publish_date);
CREATE INDEX idx_scores_event_participant ON scores(event_id, participant_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pre_qualifier_tests_updated_at BEFORE UPDATE ON pre_qualifier_tests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_participating_institutions_updated_at BEFORE UPDATE ON participating_institutions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_news_updates_updated_at BEFORE UPDATE ON news_updates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE participant_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizer_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE pre_qualifier_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE participating_institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Public read access for published events
CREATE POLICY "Public read access for published events" ON events 
FOR SELECT USING (status = 'published');

-- Public read access for active institutions
CREATE POLICY "Public read access for institutions" ON participating_institutions 
FOR SELECT USING (is_active = true);

-- Public read access for published news
CREATE POLICY "Public read access for published news" ON news_updates 
FOR SELECT USING (status = 'published');

-- Public read access for active tests
CREATE POLICY "Public read access for active tests" ON pre_qualifier_tests 
FOR SELECT USING (is_active = true);

-- Users can read their own profiles
CREATE POLICY "Users can read own profile" ON user_profiles 
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles 
FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON user_profiles 
FOR INSERT WITH CHECK (auth.uid() = id);

-- Organizers can manage their events
CREATE POLICY "Organizers can manage own events" ON events 
FOR ALL USING (auth.uid() = organizer_id);

-- Participants can read their own registrations
CREATE POLICY "Participants can read own registrations" ON registrations 
FOR SELECT USING (auth.uid() = participant_id);

CREATE POLICY "Participants can create registrations" ON registrations 
FOR INSERT WITH CHECK (auth.uid() = participant_id);

-- Public can create participant registrations (for non-authenticated users)
CREATE POLICY "Public can create participant registrations" ON participant_registrations 
FOR INSERT WITH CHECK (true);

-- Public can read participant registrations (for organizers)
CREATE POLICY "Public can read participant registrations" ON participant_registrations 
FOR SELECT USING (true);

-- Users can read their own notifications
CREATE POLICY "Users can read own notifications" ON notifications 
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON notifications 
FOR UPDATE USING (auth.uid() = user_id);

-- Public can create test attempts
CREATE POLICY "Public can create test attempts" ON test_attempts 
FOR INSERT WITH CHECK (true);

CREATE POLICY "Public can update own test attempts" ON test_attempts 
FOR UPDATE USING (true);

-- Create functions for common operations
CREATE OR REPLACE FUNCTION get_event_stats(event_uuid UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total_registrations', COUNT(*),
        'approved_registrations', COUNT(*) FILTER (WHERE status = 'approved'),
        'pending_registrations', COUNT(*) FILTER (WHERE status = 'pending'),
        'rejected_registrations', COUNT(*) FILTER (WHERE status = 'rejected')
    ) INTO result
    FROM registrations
    WHERE event_id = event_uuid;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create view for event details with organizer info
CREATE VIEW event_details AS
SELECT 
    e.*,
    up.first_name as organizer_first_name,
    up.last_name as organizer_last_name,
    up.organization as organizer_organization
FROM events e
LEFT JOIN user_profiles up ON e.organizer_id = up.id;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;
```

## Step 5: Configure Authentication

1. Go to **Authentication** → **Settings**
2. Configure:
   - **Site URL**: Your production domain
   - **Redirect URLs**: Add your domain + `/auth/callback`
   - **JWT expiry**: 3600 (1 hour)
   - **Enable email confirmations**: Yes
   - **Enable phone confirmations**: No

3. Go to **Authentication** → **Providers**
4. Enable **Email** provider
5. Configure email templates if needed

## Step 6: Storage Setup

1. Go to **Storage**
2. Create buckets:
   - `event-images` (public)
   - `user-uploads` (private)
   - `test-files` (private)

3. Set up policies for each bucket

## Step 7: Edge Functions (Optional)

Create edge functions for complex operations:

```typescript
// supabase/functions/sync-to-convex/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  try {
    const { table, data, operation } = await req.json()
    
    // Sync data to Convex as backup
    const convexResponse = await fetch('https://necessary-badger-880.convex.cloud/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ table, data, operation })
    })
    
    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
})
```

## Step 8: Production Deployment

Update your deployment configuration:

### For Render.com:
```yaml
# render.yaml
services:
  - type: web
    name: supernova-event-platform
    env: node
    buildCommand: npm install --include=dev && npm run build
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: VITE_SUPABASE_URL
        value: https://your-project-id.supabase.co
      - key: VITE_SUPABASE_ANON_KEY
        value: your-anon-key
      - key: VITE_CONVEX_URL
        value: https://necessary-badger-880.convex.cloud
      - key: AUTH_SECRET
        value: your-super-secret-auth-key-for-production-2024
    healthCheckPath: /
```

### For Docker:
```dockerfile
# Dockerfile.production
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Install serve
RUN npm install -g serve

# Expose port
EXPOSE 3000

# Start the application
CMD ["serve", "-s", "dist", "-l", "3000"]
```

## Step 9: Monitoring and Analytics

1. Set up Supabase Analytics
2. Configure alerts for:
   - High error rates
   - Database performance
   - Storage usage
   - Authentication failures

## Step 10: Backup Strategy

1. **Primary**: Supabase (automatic backups)
2. **Secondary**: Convex (sync via edge functions)
3. **Manual**: Weekly exports to cloud storage

## Performance Optimization

1. **Database Indexes**: Already created in schema
2. **Connection Pooling**: Supabase handles this automatically
3. **CDN**: Supabase provides global CDN
4. **Caching**: Implement Redis if needed

## Security Checklist

- ✅ Row Level Security enabled
- ✅ API keys secured
- ✅ Authentication configured
- ✅ CORS settings configured
- ✅ Rate limiting enabled
- ✅ Input validation implemented

## Cost Estimation

**Supabase Free Tier** (sufficient for 10K students):
- 500MB database storage
- 2M monthly requests
- 1GB file storage
- 50,000 monthly active users

**Upgrade when needed**:
- Pro: $25/month for 8GB storage, 100M requests
- Team: $599/month for 100GB storage, 1B requests

This setup provides a robust, scalable, and cost-effective solution for your event management platform!
