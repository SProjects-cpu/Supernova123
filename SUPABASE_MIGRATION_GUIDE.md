# 🚀 Supabase Migration Guide for SuperNova

## Why Supabase?

- **Free Tier**: 500MB storage + 2M monthly requests (perfect for 10K students)
- **PostgreSQL**: Reliable, ACID-compliant database
- **Real-time**: Built-in real-time subscriptions
- **Authentication**: Integrated auth system
- **Performance**: Global CDN, fast queries
- **Scalability**: Easy to upgrade when needed

## Step 1: Setup Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Note your project URL and anon key
4. Enable Row Level Security (RLS) for security

## Step 2: Database Schema Migration

The following SQL will create all tables matching your current Convex schema:

```sql
-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (Supabase auth.users is built-in)
CREATE TABLE user_profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  role TEXT CHECK (role IN ('admin', 'organizer', 'judge', 'participant')) NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  bio TEXT,
  skills TEXT[] DEFAULT '{}',
  organization TEXT,
  avatar TEXT,
  social_links JSONB DEFAULT '{}',
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
  max_participants INTEGER NOT NULL,
  registration_deadline TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT CHECK (status IN ('draft', 'published', 'ongoing', 'completed')) DEFAULT 'draft',
  organizer_id UUID REFERENCES auth.users(id) NOT NULL,
  judges UUID[] DEFAULT '{}',
  requirements TEXT[] DEFAULT '{}',
  prizes JSONB DEFAULT '[]',
  banner_image TEXT,
  event_image TEXT,
  registration_fee DECIMAL DEFAULT 0,
  payment_link TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Registrations table
CREATE TABLE registrations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_id UUID REFERENCES events(id) NOT NULL,
  participant_id UUID REFERENCES auth.users(id) NOT NULL,
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  payment_status TEXT CHECK (payment_status IN ('pending', 'paid', 'failed')) DEFAULT 'pending',
  is_team_leader BOOLEAN DEFAULT FALSE,
  submission_data JSONB NOT NULL,
  attachments UUID[] DEFAULT '{}',
  registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES auth.users(id),
  review_notes TEXT
);

-- Participant Registrations (enhanced)
CREATE TABLE participant_registrations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_id UUID REFERENCES events(id),
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
  agree_to_rules BOOLEAN NOT NULL,
  registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address INET,
  attachments UUID[] DEFAULT '{}',
  event_specific_data JSONB DEFAULT '{}'
);

-- Organizer Credentials
CREATE TABLE organizer_credentials (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT CHECK (role IN ('organizer', 'judge')) NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  organization TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by TEXT NOT NULL,
  last_login TIMESTAMP WITH TIME ZONE,
  password_reset_required BOOLEAN DEFAULT FALSE,
  linked_user_id UUID REFERENCES auth.users(id)
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
  event_id UUID REFERENCES events(id),
  tags TEXT[] DEFAULT '{}',
  difficulty TEXT CHECK (difficulty IN ('Easy', 'Medium', 'Hard')) DEFAULT 'Easy',
  total_questions INTEGER,
  test_type TEXT CHECK (test_type IN ('MCQ', 'Coding', 'Mixed')) DEFAULT 'MCQ'
);

-- Test Attempts
CREATE TABLE test_attempts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  test_id UUID REFERENCES pre_qualifier_tests(id) NOT NULL,
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
  feedback TEXT
);

-- Participating Institutions
CREATE TABLE participating_institutions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('college', 'university', 'company')) NOT NULL,
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
  category TEXT CHECK (category IN ('Announcement', 'Event Update', 'Important Notice', 'General News')) NOT NULL,
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
  event_id UUID REFERENCES events(id),
  registration_id UUID REFERENCES registrations(id),
  category TEXT CHECK (category IN ('resume', 'portfolio', 'project', 'document', 'image', 'other')) DEFAULT 'other',
  description TEXT,
  is_public BOOLEAN DEFAULT FALSE
);

-- Create indexes for performance
CREATE INDEX idx_events_organizer ON events(organizer_id);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_category ON events(category);
CREATE INDEX idx_registrations_event ON registrations(event_id);
CREATE INDEX idx_registrations_participant ON registrations(participant_id);
CREATE INDEX idx_registrations_status ON registrations(status);
CREATE INDEX idx_participant_registrations_email ON participant_registrations(email_id);
CREATE INDEX idx_participant_registrations_college ON participant_registrations(college_university);
CREATE INDEX idx_participant_registrations_event ON participant_registrations(event_id);
CREATE INDEX idx_organizer_credentials_email ON organizer_credentials(email);
CREATE INDEX idx_organizer_credentials_role ON organizer_credentials(role);
CREATE INDEX idx_pre_qualifier_tests_active ON pre_qualifier_tests(is_active);
CREATE INDEX idx_test_attempts_test_participant ON test_attempts(test_id, participant_email);
CREATE INDEX idx_news_updates_status ON news_updates(status);
CREATE INDEX idx_news_updates_category ON news_updates(category);

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

-- Create RLS policies (basic - customize as needed)
CREATE POLICY "Public read access for events" ON events FOR SELECT USING (status = 'published');
CREATE POLICY "Public read access for institutions" ON participating_institutions FOR SELECT USING (is_active = true);
CREATE POLICY "Public read access for news" ON news_updates FOR SELECT USING (status = 'published');

-- Users can read their own profiles
CREATE POLICY "Users can read own profile" ON user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = id);

-- Organizers can manage their events
CREATE POLICY "Organizers can manage own events" ON events FOR ALL USING (auth.uid() = organizer_id);

-- Participants can read their own registrations
CREATE POLICY "Participants can read own registrations" ON registrations FOR SELECT USING (auth.uid() = participant_id);
CREATE POLICY "Participants can create registrations" ON registrations FOR INSERT WITH CHECK (auth.uid() = participant_id);
```

## Step 3: Install Supabase Client

```bash
npm install @supabase/supabase-js
```

## Step 4: Environment Configuration

Create `.env.local`:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Step 5: Supabase Client Setup

Create `src/lib/supabase.ts`:
```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

## Migration Benefits

1. **Performance**: PostgreSQL is faster for complex queries
2. **Reliability**: ACID compliance ensures data integrity
3. **Scalability**: Easy to upgrade to paid plans
4. **Real-time**: Built-in real-time subscriptions
5. **Cost**: Free tier handles 10K students easily
6. **Features**: Rich ecosystem of extensions and tools

## Next Steps

1. Run the SQL schema in Supabase dashboard
2. Update your React components to use Supabase client
3. Migrate existing data (if any)
4. Test thoroughly
5. Deploy with new configuration

This migration will give you a more robust, scalable, and cost-effective solution for your event management platform!
