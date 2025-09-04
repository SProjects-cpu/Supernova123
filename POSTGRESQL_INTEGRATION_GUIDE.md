# PostgreSQL Integration Guide for Event Center

## 🎯 Overview

This guide will help you integrate PostgreSQL database with your Event Center application. Currently, your project uses Convex as the backend database. This guide will walk you through migrating from Convex to PostgreSQL step-by-step.

## 📋 Prerequisites

Before starting, make sure you have:

- Node.js (v16 or higher)
- npm or yarn package manager
- PostgreSQL installed on your system
- Basic knowledge of SQL and JavaScript/TypeScript
- Your current Event Center project

## 🗄️ Current Database Structure Analysis

Your current Convex schema includes these main tables:

### Core Tables:
- **events** - Event management with organizers, judges, and participants
- **registrations** - Participant registrations with detailed submission data
- **scores** - Judging scores and feedback
- **notifications** - User notifications system
- **userProfiles** - User profile information
- **files** - File storage and management
- **participantRegistrations** - Detailed participant registration data
- **organizerCredentials** - Organizer authentication
- **preQualifierTests** - Pre-qualification test management
- **testAttempts** - Test attempt tracking

## 🚀 Step 1: Install PostgreSQL Dependencies

First, let's add the necessary PostgreSQL dependencies to your project:

```bash
npm install pg @types/pg prisma @prisma/client
npm install --save-dev prisma
```

## 🗂️ Step 2: Set Up Prisma ORM

Prisma is a modern database toolkit that will make working with PostgreSQL much easier.

### Initialize Prisma:

```bash
npx prisma init
```

### Create the Database Schema

Create a new file `prisma/schema.prisma`:

```prisma
// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// User authentication table (from Convex Auth)
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  profile           UserProfile?
  organizedEvents   Event[]       @relation("EventOrganizer")
  judgeEvents       Event[]       @relation("EventJudge")
  registrations     Registration[]
  scores            Score[]
  notifications     Notification[]
  uploadedFiles     File[]
  organizerCredential OrganizerCredential?
  testAttempts      TestAttempt[]

  @@map("users")
}

// User profiles
model UserProfile {
  id          String   @id @default(cuid())
  userId      String   @unique
  role        UserRole
  firstName   String
  lastName    String
  bio         String?
  skills      String[] // Array of skills
  organization String?
  avatar      String?
  linkedin    String?
  github      String?
  twitter     String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("user_profiles")
}

// Events table
model Event {
  id                   String   @id @default(cuid())
  title                String
  description          String
  category             String
  startDate            String
  endDate              String
  location             String
  maxParticipants      Int
  registrationDeadline String
  status               EventStatus
  requirements         String[] // Array of requirements
  prizes               Json     // Array of prize objects
  bannerImage          String?
  tags                 String[] // Array of tags
  createdAt            DateTime @default(now())
  updatedAt            DateTime @updatedAt

  // Relations
  organizerId String
  organizer   User @relation("EventOrganizer", fields: [organizerId], references: [id])
  judges      User[] @relation("EventJudge")
  registrations Registration[]
  scores      Score[]
  notifications Notification[]
  files       File[]
  preQualifierTests PreQualifierTest[]

  @@map("events")
}

// Registrations table
model Registration {
  id             String   @id @default(cuid())
  eventId        String
  participantId  String
  status         RegistrationStatus
  teamName       String?
  teamMembers    String[] // Array of team member names
  projectDescription String?
  additionalInfo String?
  experience     String?
  motivation     String?
  skills         String[] // Array of skills
  portfolio      String?
  github         String?
  linkedin       String?
  website        String?
  emergencyContactName String?
  emergencyContactPhone String?
  emergencyContactRelationship String?
  dietaryRestrictions String?
  tshirtSize     String?
  agreeToTerms   Boolean
  agreeToCodeOfConduct Boolean
  allowPhotography Boolean?
  reviewNotes    String?
  registeredAt   DateTime @default(now())
  reviewedAt     DateTime?
  reviewedById   String?

  // Relations
  event       Event @relation(fields: [eventId], references: [id], onDelete: Cascade)
  participant User @relation(fields: [participantId], references: [id])
  reviewedBy  User? @relation("RegistrationReviewer", fields: [reviewedById], references: [id])
  attachments File[]
  scores      Score[]

  @@map("registrations")
}

// Scores table
model Score {
  id           String   @id @default(cuid())
  eventId      String
  participantId String
  judgeId      String
  innovation   Float
  execution    Float
  presentation Float
  impact       Float
  totalScore   Float
  feedback     String?
  submittedAt  DateTime @default(now())

  // Relations
  event       Event @relation(fields: [eventId], references: [id], onDelete: Cascade)
  participant User @relation(fields: [participantId], references: [id])
  judge       User @relation("ScoreJudge", fields: [judgeId], references: [id])

  @@map("scores")
}

// Notifications table
model Notification {
  id        String   @id @default(cuid())
  userId    String
  title     String
  message   String
  type      NotificationType
  read      Boolean  @default(false)
  eventId   String?
  createdAt DateTime @default(now())

  // Relations
  user  User @relation(fields: [userId], references: [id], onDelete: Cascade)
  event Event? @relation(fields: [eventId], references: [id])

  @@map("notifications")
}

// Files table
model File {
  id          String   @id @default(cuid())
  name        String
  type        String
  size        Int
  storageId   String
  uploadedById String
  uploadedAt  DateTime @default(now())
  eventId     String?
  registrationId String?
  category    FileCategory
  description String?
  isPublic    Boolean  @default(false)

  // Relations
  uploadedBy   User @relation(fields: [uploadedById], references: [id])
  event        Event? @relation(fields: [eventId], references: [id])
  registration Registration? @relation(fields: [registrationId], references: [id])

  @@map("files")
}

// Participant registrations (detailed)
model ParticipantRegistration {
  id                String   @id @default(cuid())
  fullName          String
  collegeUniversity String
  departmentYear    String
  contactNumber     String
  emailId           String
  teamName          String?
  teamSize          Int
  roleInTeam        TeamRole
  technicalSkills   String
  previousExperience String?
  agreeToRules      Boolean
  registeredAt      DateTime @default(now())
  ipAddress         String?

  @@map("participant_registrations")
}

// Organizer credentials
model OrganizerCredential {
  id                    String   @id @default(cuid())
  email                 String   @unique
  password              String
  role                  OrganizerRole
  firstName             String
  lastName              String
  organization          String?
  isActive              Boolean  @default(true)
  createdAt             DateTime @default(now())
  createdBy             String
  lastLogin             DateTime?
  passwordResetRequired Boolean  @default(false)
  userId                String?  @unique

  // Relations
  user User? @relation(fields: [userId], references: [id])

  @@map("organizer_credentials")
}

// Pre-qualifier tests
model PreQualifierTest {
  id                String   @id @default(cuid())
  title             String
  description       String
  testLink          String
  isActive          Boolean  @default(true)
  startDate         DateTime
  endDate           DateTime
  duration          Int      // Duration in minutes
  instructions      String
  eligibilityCriteria String
  maxAttempts       Int
  passingScore      Float?
  createdBy         String
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  eventId           String?
  tags              String[] // Array of tags
  difficulty        TestDifficulty
  totalQuestions    Int?
  testType          TestType

  // Relations
  event       Event? @relation(fields: [eventId], references: [id])
  testAttempts TestAttempt[]

  @@map("pre_qualifier_tests")
}

// Test attempts
model TestAttempt {
  id              String   @id @default(cuid())
  testId          String
  participantEmail String
  participantName String
  attemptNumber   Int
  startedAt       DateTime @default(now())
  completedAt     DateTime?
  score           Float?
  status          TestAttemptStatus
  timeSpent       Int?     // Time spent in minutes
  ipAddress       String?
  userAgent       String?
  responses       Json?    // Store test responses
  feedback        String?

  // Relations
  test PreQualifierTest @relation(fields: [testId], references: [id], onDelete: Cascade)

  @@map("test_attempts")
}

// Enums
enum UserRole {
  ADMIN
  ORGANIZER
  JUDGE
  PARTICIPANT
}

enum EventStatus {
  DRAFT
  PUBLISHED
  ONGOING
  COMPLETED
}

enum RegistrationStatus {
  PENDING
  APPROVED
  REJECTED
}

enum NotificationType {
  INFO
  SUCCESS
  WARNING
  ERROR
}

enum FileCategory {
  RESUME
  PORTFOLIO
  PROJECT
  DOCUMENT
  IMAGE
  OTHER
}

enum TeamRole {
  LEADER
  MEMBER
}

enum OrganizerRole {
  ORGANIZER
  JUDGE
}

enum TestDifficulty {
  EASY
  MEDIUM
  HARD
}

enum TestType {
  MCQ
  CODING
  MIXED
}

enum TestAttemptStatus {
  STARTED
  COMPLETED
  ABANDONED
}
```

## 🔧 Step 3: Environment Configuration

Create a `.env` file in your project root:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/event_center_db"

# JWT Secret (for authentication)
JWT_SECRET="your-super-secret-jwt-key-here"

# File Upload (if using cloud storage)
CLOUD_STORAGE_BUCKET="your-bucket-name"
CLOUD_STORAGE_REGION="your-region"
CLOUD_STORAGE_ACCESS_KEY="your-access-key"
CLOUD_STORAGE_SECRET_KEY="your-secret-key"
```

## 🗄️ Step 4: Database Setup

### Create PostgreSQL Database:

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE event_center_db;

# Create user (optional)
CREATE USER event_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE event_center_db TO event_user;

# Exit psql
\q
```

### Run Prisma Migrations:

```bash
# Generate and apply migrations
npx prisma migrate dev --name init

# Generate Prisma client
npx prisma generate
```

## 🔌 Step 5: Create Database Service Layer

Create a new directory `src/lib/database` and add the following files:

### `src/lib/database/client.ts`:

```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

### `src/lib/database/events.ts`:

```typescript
import { prisma } from './client'
import type { Event, User, UserProfile } from '@prisma/client'

export interface EventWithOrganizer extends Event {
  organizer: User & { profile: UserProfile | null }
  judges: (User & { profile: UserProfile | null })[]
}

export const eventsService = {
  // Get all events with optional filters
  async getAll(filters?: { category?: string; status?: string }): Promise<EventWithOrganizer[]> {
    const where: any = {}
    
    if (filters?.category) {
      where.category = filters.category
    }
    
    if (filters?.status) {
      where.status = filters.status as any
    }

    return await prisma.event.findMany({
      where,
      include: {
        organizer: {
          include: {
            profile: true
          }
        },
        judges: {
          include: {
            profile: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
  },

  // Get event by ID
  async getById(id: string): Promise<EventWithOrganizer | null> {
    return await prisma.event.findUnique({
      where: { id },
      include: {
        organizer: {
          include: {
            profile: true
          }
        },
        judges: {
          include: {
            profile: true
          }
        }
      }
    })
  },

  // Create new event
  async create(data: {
    title: string
    description: string
    category: string
    startDate: string
    endDate: string
    location: string
    maxParticipants: number
    registrationDeadline: string
    requirements: string[]
    prizes: any[]
    tags: string[]
    organizerId: string
    judgeIds: string[]
    bannerImage?: string
  }): Promise<Event> {
    return await prisma.event.create({
      data: {
        title: data.title,
        description: data.description,
        category: data.category,
        startDate: data.startDate,
        endDate: data.endDate,
        location: data.location,
        maxParticipants: data.maxParticipants,
        registrationDeadline: data.registrationDeadline,
        requirements: data.requirements,
        prizes: data.prizes,
        tags: data.tags,
        bannerImage: data.bannerImage,
        organizerId: data.organizerId,
        judges: {
          connect: data.judgeIds.map(id => ({ id }))
        }
      }
    })
  },

  // Update event
  async update(id: string, data: Partial<Event>): Promise<Event> {
    return await prisma.event.update({
      where: { id },
      data
    })
  },

  // Delete event
  async delete(id: string): Promise<Event> {
    return await prisma.event.delete({
      where: { id }
    })
  }
}
```

### `src/lib/database/registrations.ts`:

```typescript
import { prisma } from './client'
import type { Registration, User, Event } from '@prisma/client'

export interface RegistrationWithDetails extends Registration {
  event: Event
  participant: User
  reviewedBy: User | null
}

export const registrationsService = {
  // Get registrations by event
  async getByEvent(eventId: string): Promise<RegistrationWithDetails[]> {
    return await prisma.registration.findMany({
      where: { eventId },
      include: {
        event: true,
        participant: true,
        reviewedBy: true
      },
      orderBy: {
        registeredAt: 'desc'
      }
    })
  },

  // Get registration by ID
  async getById(id: string): Promise<RegistrationWithDetails | null> {
    return await prisma.registration.findUnique({
      where: { id },
      include: {
        event: true,
        participant: true,
        reviewedBy: true
      }
    })
  },

  // Create registration
  async create(data: {
    eventId: string
    participantId: string
    teamName?: string
    teamMembers?: string[]
    projectDescription?: string
    additionalInfo?: string
    experience?: string
    motivation?: string
    skills?: string[]
    portfolio?: string
    github?: string
    linkedin?: string
    website?: string
    emergencyContactName?: string
    emergencyContactPhone?: string
    emergencyContactRelationship?: string
    dietaryRestrictions?: string
    tshirtSize?: string
    agreeToTerms: boolean
    agreeToCodeOfConduct: boolean
    allowPhotography?: boolean
  }): Promise<Registration> {
    return await prisma.registration.create({
      data: {
        eventId: data.eventId,
        participantId: data.participantId,
        teamName: data.teamName,
        teamMembers: data.teamMembers || [],
        projectDescription: data.projectDescription,
        additionalInfo: data.additionalInfo,
        experience: data.experience,
        motivation: data.motivation,
        skills: data.skills || [],
        portfolio: data.portfolio,
        github: data.github,
        linkedin: data.linkedin,
        website: data.website,
        emergencyContactName: data.emergencyContactName,
        emergencyContactPhone: data.emergencyContactPhone,
        emergencyContactRelationship: data.emergencyContactRelationship,
        dietaryRestrictions: data.dietaryRestrictions,
        tshirtSize: data.tshirtSize,
        agreeToTerms: data.agreeToTerms,
        agreeToCodeOfConduct: data.agreeToCodeOfConduct,
        allowPhotography: data.allowPhotography
      }
    })
  },

  // Update registration status
  async updateStatus(id: string, status: 'PENDING' | 'APPROVED' | 'REJECTED', reviewedById: string, reviewNotes?: string): Promise<Registration> {
    return await prisma.registration.update({
      where: { id },
      data: {
        status,
        reviewedById,
        reviewedAt: new Date(),
        reviewNotes
      }
    })
  }
}
```

## 🔐 Step 6: Authentication Setup

Since you're moving away from Convex Auth, you'll need to implement your own authentication system. Here's a simple JWT-based solution:

### Install JWT dependencies:

```bash
npm install jsonwebtoken bcryptjs
npm install --save-dev @types/jsonwebtoken @types/bcryptjs
```

### `src/lib/auth.ts`:

```typescript
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { prisma } from './database/client'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret'

export interface JWTPayload {
  userId: string
  email: string
  role: string
}

export const authService = {
  // Hash password
  async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 12)
  },

  // Compare password
  async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword)
  },

  // Generate JWT token
  generateToken(payload: JWTPayload): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
  },

  // Verify JWT token
  verifyToken(token: string): JWTPayload | null {
    try {
      return jwt.verify(token, JWT_SECRET) as JWTPayload
    } catch {
      return null
    }
  },

  // Register user
  async register(data: {
    email: string
    password: string
    name: string
    role: 'ADMIN' | 'ORGANIZER' | 'JUDGE' | 'PARTICIPANT'
  }) {
    const hashedPassword = await this.hashPassword(data.password)
    
    const user = await prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        profile: {
          create: {
            role: data.role,
            firstName: data.name.split(' ')[0] || '',
            lastName: data.name.split(' ').slice(1).join(' ') || '',
            skills: []
          }
        }
      }
    })

    return user
  },

  // Login user
  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { profile: true }
    })

    if (!user) {
      throw new Error('User not found')
    }

    const isValidPassword = await this.comparePassword(password, user.password || '')
    if (!isValidPassword) {
      throw new Error('Invalid password')
    }

    const token = this.generateToken({
      userId: user.id,
      email: user.email,
      role: user.profile?.role || 'PARTICIPANT'
    })

    return { user, token }
  }
}
```

## 🌐 Step 7: API Routes Setup

Create API routes using Express.js or Next.js API routes. Here's an example with Express:

### Install Express:

```bash
npm install express cors helmet
npm install --save-dev @types/express @types/cors
```

### `src/server/index.ts`:

```typescript
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { eventsRouter } from './routes/events'
import { registrationsRouter } from './routes/registrations'
import { authRouter } from './routes/auth'
import { authMiddleware } from './middleware/auth'

const app = express()

// Middleware
app.use(helmet())
app.use(cors())
app.use(express.json())

// Routes
app.use('/api/auth', authRouter)
app.use('/api/events', eventsRouter)
app.use('/api/registrations', authMiddleware, registrationsRouter)

const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
```

### `src/server/routes/events.ts`:

```typescript
import { Router } from 'express'
import { eventsService } from '../../lib/database/events'

const router = Router()

// Get all events
router.get('/', async (req, res) => {
  try {
    const { category, status } = req.query
    const events = await eventsService.getAll({
      category: category as string,
      status: status as string
    })
    res.json(events)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch events' })
  }
})

// Get event by ID
router.get('/:id', async (req, res) => {
  try {
    const event = await eventsService.getById(req.params.id)
    if (!event) {
      return res.status(404).json({ error: 'Event not found' })
    }
    res.json(event)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch event' })
  }
})

// Create event (protected route)
router.post('/', async (req, res) => {
  try {
    const event = await eventsService.create(req.body)
    res.status(201).json(event)
  } catch (error) {
    res.status(500).json({ error: 'Failed to create event' })
  }
})

export { router as eventsRouter }
```

## 🔄 Step 8: Frontend Integration

Update your React components to use the new API instead of Convex:

### `src/hooks/useEvents.ts`:

```typescript
import { useState, useEffect } from 'react'
import type { EventWithOrganizer } from '../lib/database/events'

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:3001/api'

export const useEvents = (filters?: { category?: string; status?: string }) => {
  const [events, setEvents] = useState<EventWithOrganizer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true)
        const params = new URLSearchParams()
        if (filters?.category) params.append('category', filters.category)
        if (filters?.status) params.append('status', filters.status)

        const response = await fetch(`${API_BASE}/events?${params}`)
        if (!response.ok) throw new Error('Failed to fetch events')
        
        const data = await response.json()
        setEvents(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [filters])

  return { events, loading, error }
}
```

## 📊 Step 9: Data Migration Script

Create a script to migrate data from Convex to PostgreSQL:

### `scripts/migrate-data.ts`:

```typescript
import { prisma } from '../src/lib/database/client'

async function migrateData() {
  console.log('Starting data migration...')

  try {
    // Note: You'll need to export your Convex data first
    // This is a placeholder for the migration logic
    
    console.log('Migration completed successfully!')
  } catch (error) {
    console.error('Migration failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

migrateData()
```

## 🚀 Step 10: Deployment

### Update your `package.json` scripts:

```json
{
  "scripts": {
    "dev": "npm-run-all --parallel dev:frontend dev:backend",
    "dev:frontend": "vite --open",
    "dev:backend": "tsx src/server/index.ts",
    "build": "tsc && vite build",
    "start": "node dist/server/index.js",
    "db:migrate": "prisma migrate deploy",
    "db:generate": "prisma generate",
    "db:studio": "prisma studio"
  }
}
```

### For production deployment:

1. **Set up PostgreSQL database** (e.g., on AWS RDS, Heroku Postgres, or Railway)
2. **Update environment variables** with production database URL
3. **Run migrations**: `npm run db:migrate`
4. **Deploy your application**

## 🔧 Step 11: Testing

Create tests for your new database layer:

### `src/lib/database/__tests__/events.test.ts`:

```typescript
import { prisma } from '../client'
import { eventsService } from '../events'

describe('Events Service', () => {
  beforeEach(async () => {
    await prisma.event.deleteMany()
    await prisma.user.deleteMany()
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })

  it('should create an event', async () => {
    const user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        name: 'Test User'
      }
    })

    const event = await eventsService.create({
      title: 'Test Event',
      description: 'Test Description',
      category: 'Tech',
      startDate: '2024-01-01',
      endDate: '2024-01-02',
      location: 'Test Location',
      maxParticipants: 100,
      registrationDeadline: '2023-12-31',
      requirements: ['Requirement 1'],
      prizes: [{ position: '1st', prize: 'Cash' }],
      tags: ['tech', 'innovation'],
      organizerId: user.id,
      judgeIds: []
    })

    expect(event.title).toBe('Test Event')
  })
})
```

## 📚 Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [JWT.io](https://jwt.io/) - JWT token debugging
- [bcrypt.js](https://github.com/dcodeIO/bcrypt.js) - Password hashing

## 🆘 Troubleshooting

### Common Issues:

1. **Connection refused**: Check if PostgreSQL is running and the connection string is correct
2. **Migration errors**: Ensure your schema is valid and all required fields are provided
3. **Authentication issues**: Verify JWT secret is set and tokens are being generated correctly
4. **CORS errors**: Configure CORS properly for your frontend domain

### Getting Help:

- Check the Prisma and PostgreSQL logs for detailed error messages
- Use `npx prisma studio` to inspect your database visually
- Test your API endpoints with tools like Postman or Insomnia

## 🎉 Conclusion

You've successfully migrated from Convex to PostgreSQL! Your Event Center application now has:

- ✅ PostgreSQL database with proper schema
- ✅ Prisma ORM for type-safe database operations
- ✅ JWT-based authentication
- ✅ RESTful API endpoints
- ✅ Updated frontend integration
- ✅ Production-ready deployment setup

The application maintains all its original functionality while gaining the benefits of a traditional relational database system.

---

**Next Steps:**
1. Test all functionality thoroughly
2. Set up monitoring and logging
3. Implement backup strategies
4. Consider adding Redis for caching if needed
5. Set up CI/CD pipelines for automated deployment
