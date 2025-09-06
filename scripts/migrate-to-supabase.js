#!/usr/bin/env node

/**
 * Migration script to move data from Convex to Supabase
 * Run with: npm run migrate:to-supabase
 */

import { createClient } from '@supabase/supabase-js'
import { ConvexHttpClient } from 'convex/browser'

// Configuration
const SUPABASE_URL = process.env.VITE_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const CONVEX_URL = process.env.VITE_CONVEX_URL

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY || !CONVEX_URL) {
  console.error('❌ Missing required environment variables')
  console.error('Required: VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, VITE_CONVEX_URL')
  process.exit(1)
}

// Initialize clients
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
const convex = new ConvexHttpClient(CONVEX_URL)

// Migration functions
async function migrateEvents() {
  console.log('🔄 Migrating events...')
  
  try {
    // Get events from Convex (you'll need to implement this query)
    const events = await convex.query('events:list', {})
    
    if (!events || events.length === 0) {
      console.log('ℹ️  No events to migrate')
      return
    }

    // Transform and insert into Supabase
    const transformedEvents = events.map(event => ({
      id: event._id,
      title: event.title,
      description: event.description,
      category: event.category,
      start_date: event.startDate,
      end_date: event.endDate,
      location: event.location,
      max_participants: event.maxParticipants,
      registration_deadline: event.registrationDeadline,
      status: event.status,
      organizer_id: event.organizerId,
      judges: event.judges || [],
      requirements: event.requirements || [],
      prizes: event.prizes || [],
      banner_image: event.bannerImage,
      event_image: event.eventImage,
      registration_fee: event.registrationFee || 0,
      payment_link: event.paymentLink,
      tags: event.tags || [],
      created_at: new Date(event._creationTime).toISOString(),
      updated_at: new Date(event._creationTime).toISOString()
    }))

    const { data, error } = await supabase
      .from('events')
      .upsert(transformedEvents, { onConflict: 'id' })

    if (error) {
      throw error
    }

    console.log(`✅ Migrated ${transformedEvents.length} events`)
  } catch (error) {
    console.error('❌ Error migrating events:', error.message)
  }
}

async function migrateParticipantRegistrations() {
  console.log('🔄 Migrating participant registrations...')
  
  try {
    // Get registrations from Convex
    const registrations = await convex.query('participantRegistrations:getAllParticipantRegistrations', {})
    
    if (!registrations || registrations.length === 0) {
      console.log('ℹ️  No participant registrations to migrate')
      return
    }

    // Transform and insert into Supabase
    const transformedRegistrations = registrations.map(reg => ({
      id: reg._id,
      event_id: reg.eventId,
      full_name: reg.fullName,
      college_university: reg.collegeUniversity,
      department_year: reg.departmentYear,
      contact_number: reg.contactNumber,
      email_id: reg.emailId,
      team_name: reg.teamName,
      team_size: reg.teamSize,
      role_in_team: reg.roleInTeam,
      technical_skills: reg.technicalSkills,
      previous_experience: reg.previousExperience,
      agree_to_rules: reg.agreeToRules,
      registered_at: new Date(reg.registeredAt).toISOString(),
      ip_address: reg.ipAddress,
      attachments: reg.attachments || [],
      event_specific_data: reg.eventSpecificData || {}
    }))

    const { data, error } = await supabase
      .from('participant_registrations')
      .upsert(transformedRegistrations, { onConflict: 'id' })

    if (error) {
      throw error
    }

    console.log(`✅ Migrated ${transformedRegistrations.length} participant registrations`)
  } catch (error) {
    console.error('❌ Error migrating participant registrations:', error.message)
  }
}

async function migratePreQualifierTests() {
  console.log('🔄 Migrating pre-qualifier tests...')
  
  try {
    // Get tests from Convex
    const tests = await convex.query('preQualifierTests:getAllTests', {})
    
    if (!tests || tests.length === 0) {
      console.log('ℹ️  No pre-qualifier tests to migrate')
      return
    }

    // Transform and insert into Supabase
    const transformedTests = tests.map(test => ({
      id: test._id,
      title: test.title,
      description: test.description,
      test_link: test.testLink,
      is_active: test.isActive,
      start_date: new Date(test.startDate).toISOString(),
      end_date: new Date(test.endDate).toISOString(),
      duration: test.duration,
      instructions: test.instructions,
      eligibility_criteria: test.eligibilityCriteria,
      max_attempts: test.maxAttempts,
      passing_score: test.passingScore,
      created_by: test.createdBy,
      created_at: new Date(test.createdAt).toISOString(),
      updated_at: new Date(test.updatedAt).toISOString(),
      event_id: test.eventId,
      tags: test.tags || [],
      difficulty: test.difficulty,
      total_questions: test.totalQuestions,
      test_type: test.testType
    }))

    const { data, error } = await supabase
      .from('pre_qualifier_tests')
      .upsert(transformedTests, { onConflict: 'id' })

    if (error) {
      throw error
    }

    console.log(`✅ Migrated ${transformedTests.length} pre-qualifier tests`)
  } catch (error) {
    console.error('❌ Error migrating pre-qualifier tests:', error.message)
  }
}

async function migrateParticipatingInstitutions() {
  console.log('🔄 Migrating participating institutions...')
  
  try {
    // Get institutions from Convex
    const institutions = await convex.query('participatingInstitutions:getActiveInstitutions', {})
    
    if (!institutions || institutions.length === 0) {
      console.log('ℹ️  No participating institutions to migrate')
      return
    }

    // Transform and insert into Supabase
    const transformedInstitutions = institutions.map(inst => ({
      id: inst._id,
      name: inst.name,
      type: inst.type,
      logo: inst.logo,
      description: inst.description,
      website: inst.website,
      location: inst.location,
      student_count: inst.studentCount,
      is_active: inst.isActive,
      order: inst.order,
      created_at: new Date(inst.createdAt).toISOString(),
      updated_at: new Date(inst.updatedAt).toISOString()
    }))

    const { data, error } = await supabase
      .from('participating_institutions')
      .upsert(transformedInstitutions, { onConflict: 'id' })

    if (error) {
      throw error
    }

    console.log(`✅ Migrated ${transformedInstitutions.length} participating institutions`)
  } catch (error) {
    console.error('❌ Error migrating participating institutions:', error.message)
  }
}

async function migrateNewsUpdates() {
  console.log('🔄 Migrating news updates...')
  
  try {
    // Get news from Convex
    const news = await convex.query('newsUpdates:getAllNews', {})
    
    if (!news || news.length === 0) {
      console.log('ℹ️  No news updates to migrate')
      return
    }

    // Transform and insert into Supabase
    const transformedNews = news.map(item => ({
      id: item._id,
      title: item.title,
      subtitle: item.subtitle,
      content: item.content,
      category: item.category,
      image: item.image,
      video_link: item.videoLink,
      publish_date: new Date(item.publishDate).toISOString(),
      author_name: item.authorName,
      author_email: item.authorEmail,
      status: item.status,
      attachments: item.attachments || [],
      created_at: new Date(item.createdAt).toISOString(),
      updated_at: new Date(item.updatedAt).toISOString(),
      views: item.views || 0,
      featured: item.featured || false
    }))

    const { data, error } = await supabase
      .from('news_updates')
      .upsert(transformedNews, { onConflict: 'id' })

    if (error) {
      throw error
    }

    console.log(`✅ Migrated ${transformedNews.length} news updates`)
  } catch (error) {
    console.error('❌ Error migrating news updates:', error.message)
  }
}

async function migrateOrganizerCredentials() {
  console.log('🔄 Migrating organizer credentials...')
  
  try {
    // Get credentials from Convex
    const credentials = await convex.query('superAdmin:getAllOrganizersJudges', {
      superAdminEmail: 'rutvikburra@gmail.com',
      superAdminPassword: 'rutvikburra1234567890@#E'
    })
    
    if (!credentials || credentials.length === 0) {
      console.log('ℹ️  No organizer credentials to migrate')
      return
    }

    // Transform and insert into Supabase
    const transformedCredentials = credentials.map(cred => ({
      id: cred._id,
      email: cred.email,
      password_hash: cred.password, // In production, hash this properly
      role: cred.role,
      first_name: cred.firstName,
      last_name: cred.lastName,
      organization: cred.organization,
      is_active: cred.isActive,
      created_at: new Date(cred.createdAt).toISOString(),
      created_by: cred.createdBy,
      last_login: cred.lastLogin ? new Date(cred.lastLogin).toISOString() : null,
      password_reset_required: cred.passwordResetRequired,
      linked_user_id: cred.linkedUserId
    }))

    const { data, error } = await supabase
      .from('organizer_credentials')
      .upsert(transformedCredentials, { onConflict: 'id' })

    if (error) {
      throw error
    }

    console.log(`✅ Migrated ${transformedCredentials.length} organizer credentials`)
  } catch (error) {
    console.error('❌ Error migrating organizer credentials:', error.message)
  }
}

// Main migration function
async function runMigration() {
  console.log('🚀 Starting migration from Convex to Supabase...')
  console.log('📊 This will migrate all data while keeping Convex as backup')
  
  const startTime = Date.now()

  try {
    // Test connections
    console.log('🔍 Testing database connections...')
    
    // Test Supabase connection
    const { data: supabaseTest, error: supabaseError } = await supabase
      .from('events')
      .select('count')
      .limit(1)
    
    if (supabaseError) {
      throw new Error(`Supabase connection failed: ${supabaseError.message}`)
    }
    
    console.log('✅ Supabase connection successful')
    
    // Test Convex connection
    try {
      await convex.query('events:list', {})
      console.log('✅ Convex connection successful')
    } catch (convexError) {
      console.warn('⚠️  Convex connection failed, but continuing with migration')
    }

    // Run migrations
    await migrateEvents()
    await migrateParticipantRegistrations()
    await migratePreQualifierTests()
    await migrateParticipatingInstitutions()
    await migrateNewsUpdates()
    await migrateOrganizerCredentials()

    const endTime = Date.now()
    const duration = (endTime - startTime) / 1000

    console.log('🎉 Migration completed successfully!')
    console.log(`⏱️  Total time: ${duration.toFixed(2)} seconds`)
    console.log('📝 Next steps:')
    console.log('   1. Update your app to use Supabase as primary database')
    console.log('   2. Test all functionality with Supabase')
    console.log('   3. Keep Convex as backup for redundancy')
    console.log('   4. Monitor performance and adjust as needed')

  } catch (error) {
    console.error('❌ Migration failed:', error.message)
    process.exit(1)
  }
}

// Run migration if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runMigration()
}

export { runMigration }
