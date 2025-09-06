#!/usr/bin/env node

/**
 * Backup script to export data from Convex
 * Run with: npm run backup:convex
 */

import { ConvexHttpClient } from 'convex/browser'
import fs from 'fs'
import path from 'path'

// Configuration
const CONVEX_URL = process.env.VITE_CONVEX_URL
const BACKUP_DIR = './backups'

if (!CONVEX_URL) {
  console.error('❌ Missing required environment variable: VITE_CONVEX_URL')
  process.exit(1)
}

// Initialize Convex client
const convex = new ConvexHttpClient(CONVEX_URL)

// Ensure backup directory exists
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true })
}

// Backup functions
async function backupEvents() {
  console.log('🔄 Backing up events...')
  
  try {
    const events = await convex.query('events:list', {})
    
    const backupFile = path.join(BACKUP_DIR, `events-${Date.now()}.json`)
    fs.writeFileSync(backupFile, JSON.stringify(events, null, 2))
    
    console.log(`✅ Events backed up to ${backupFile}`)
    return events.length
  } catch (error) {
    console.error('❌ Error backing up events:', error.message)
    return 0
  }
}

async function backupParticipantRegistrations() {
  console.log('🔄 Backing up participant registrations...')
  
  try {
    const registrations = await convex.query('participantRegistrations:getAllParticipantRegistrations', {})
    
    const backupFile = path.join(BACKUP_DIR, `participant-registrations-${Date.now()}.json`)
    fs.writeFileSync(backupFile, JSON.stringify(registrations, null, 2))
    
    console.log(`✅ Participant registrations backed up to ${backupFile}`)
    return registrations.length
  } catch (error) {
    console.error('❌ Error backing up participant registrations:', error.message)
    return 0
  }
}

async function backupPreQualifierTests() {
  console.log('🔄 Backing up pre-qualifier tests...')
  
  try {
    const tests = await convex.query('preQualifierTests:getAllTests', {})
    
    const backupFile = path.join(BACKUP_DIR, `pre-qualifier-tests-${Date.now()}.json`)
    fs.writeFileSync(backupFile, JSON.stringify(tests, null, 2))
    
    console.log(`✅ Pre-qualifier tests backed up to ${backupFile}`)
    return tests.length
  } catch (error) {
    console.error('❌ Error backing up pre-qualifier tests:', error.message)
    return 0
  }
}

async function backupParticipatingInstitutions() {
  console.log('🔄 Backing up participating institutions...')
  
  try {
    const institutions = await convex.query('participatingInstitutions:getActiveInstitutions', {})
    
    const backupFile = path.join(BACKUP_DIR, `participating-institutions-${Date.now()}.json`)
    fs.writeFileSync(backupFile, JSON.stringify(institutions, null, 2))
    
    console.log(`✅ Participating institutions backed up to ${backupFile}`)
    return institutions.length
  } catch (error) {
    console.error('❌ Error backing up participating institutions:', error.message)
    return 0
  }
}

async function backupNewsUpdates() {
  console.log('🔄 Backing up news updates...')
  
  try {
    const news = await convex.query('newsUpdates:getAllNews', {})
    
    const backupFile = path.join(BACKUP_DIR, `news-updates-${Date.now()}.json`)
    fs.writeFileSync(backupFile, JSON.stringify(news, null, 2))
    
    console.log(`✅ News updates backed up to ${backupFile}`)
    return news.length
  } catch (error) {
    console.error('❌ Error backing up news updates:', error.message)
    return 0
  }
}

async function backupOrganizerCredentials() {
  console.log('🔄 Backing up organizer credentials...')
  
  try {
    const credentials = await convex.query('superAdmin:getAllOrganizersJudges', {
      superAdminEmail: 'rutvikburra@gmail.com',
      superAdminPassword: 'rutvikburra1234567890@#E'
    })
    
    const backupFile = path.join(BACKUP_DIR, `organizer-credentials-${Date.now()}.json`)
    fs.writeFileSync(backupFile, JSON.stringify(credentials, null, 2))
    
    console.log(`✅ Organizer credentials backed up to ${backupFile}`)
    return credentials.length
  } catch (error) {
    console.error('❌ Error backing up organizer credentials:', error.message)
    return 0
  }
}

// Main backup function
async function runBackup() {
  console.log('🚀 Starting Convex data backup...')
  
  const startTime = Date.now()
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  
  try {
    // Test connection
    console.log('🔍 Testing Convex connection...')
    await convex.query('events:list', {})
    console.log('✅ Convex connection successful')

    // Create timestamped backup directory
    const timestampedBackupDir = path.join(BACKUP_DIR, `backup-${timestamp}`)
    if (!fs.existsSync(timestampedBackupDir)) {
      fs.mkdirSync(timestampedBackupDir, { recursive: true })
    }

    // Run backups
    const results = {
      events: await backupEvents(),
      participantRegistrations: await backupParticipantRegistrations(),
      preQualifierTests: await backupPreQualifierTests(),
      participatingInstitutions: await backupParticipatingInstitutions(),
      newsUpdates: await backupNewsUpdates(),
      organizerCredentials: await backupOrganizerCredentials()
    }

    // Create summary file
    const summary = {
      timestamp: new Date().toISOString(),
      convexUrl: CONVEX_URL,
      totalRecords: Object.values(results).reduce((sum, count) => sum + count, 0),
      breakdown: results
    }

    const summaryFile = path.join(timestampedBackupDir, 'backup-summary.json')
    fs.writeFileSync(summaryFile, JSON.stringify(summary, null, 2))

    const endTime = Date.now()
    const duration = (endTime - startTime) / 1000

    console.log('🎉 Backup completed successfully!')
    console.log(`⏱️  Total time: ${duration.toFixed(2)} seconds`)
    console.log(`📊 Total records backed up: ${summary.totalRecords}`)
    console.log('📁 Backup location:', timestampedBackupDir)
    console.log('📝 Summary:', summary)

  } catch (error) {
    console.error('❌ Backup failed:', error.message)
    process.exit(1)
  }
}

// Run backup if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runBackup()
}

export { runBackup }
