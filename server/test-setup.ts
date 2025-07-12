#!/usr/bin/env bun
/**
 * Simple Database Test Script
 * 
 * This script tests basic Supabase operations and inserts sample data
 * Run with: bun test-setup.ts
 */

import { createClient } from '@supabase/supabase-js'

// Get environment variables from .env
const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing environment variables!')
  console.error('Please check your .env file contains:')
  console.error('SUPABASE_URL=your_project_url')
  console.error('SUPABASE_ANON_KEY=your_anon_key')
  process.exit(1)
}

// Extract API URL from dashboard URL if needed
function getApiUrl(url: string): string {
  const dashboardMatch = url.match(/project\/([a-z0-9]+)/)
  if (dashboardMatch) {
    const projectRef = dashboardMatch[1]
    return `https://${projectRef}.supabase.co`
  }
  return url
}

const apiUrl = getApiUrl(SUPABASE_URL)
console.log('🚀 ProofQuest Database Test')
console.log('===========================')
console.log(`🔗 API URL: ${apiUrl}`)

// Create Supabase client
const supabase = createClient(apiUrl, SUPABASE_ANON_KEY)

async function testConnection(): Promise<boolean> {
  console.log('\n🔌 Testing Supabase connection...')
  
  try {
    // Simple test query
    const { error } = await supabase
      .from('users')
      .select('address')
      .limit(1)
    
    if (error) {
      if (error.message.includes('relation "users" does not exist')) {
        console.log('⚠️  Tables not found - you need to set up the database first!')
        console.log('📝 Please run the SQL script from scripts/setup-database.sql in your Supabase SQL editor')
        return false
      }
      throw error
    }
    
    console.log('✅ Connection successful!')
    return true
    
  } catch (error) {
    console.error('❌ Connection failed:', error)
    return false
  }
}

async function insertSampleUser(): Promise<void> {
  console.log('\n👤 Creating sample user...')
  
  const sampleUser = {
    address: '0xtest1234567890123456789012345678901234567890'.toLowerCase(),
    nickname: 'Test User',
    bio: 'Created by test script'
  }
  
  try {
    const { data, error } = await supabase
      .from('users')
      .upsert(sampleUser, { onConflict: 'address' })
      .select()
      .single()
    
    if (error) {
      console.log(`❌ Failed: ${error.message}`)
      return
    }
    
    console.log(`✅ User created: ${data.nickname} (${data.address})`)
    
  } catch (error) {
    console.log(`❌ Error: ${error}`)
  }
}

async function insertSampleQuest(): Promise<void> {
  console.log('\n🎯 Creating sample quest...')
  
  const sampleQuest = {
    title: 'Test Quest - Database Verification',
    description: 'This is a test quest created to verify database functionality. Complete this quest to test the system.',
    quest_type: 'twitter-interaction',
    interaction_type: 'follow',
    target_account: '@TestAccount',
    reward_type: 'ETH',
    total_reward_pool: 0.001,
    reward_per_participant: 0.0001,
    distribution_method: 'immediate',
    start_date: new Date().toISOString(),
    end_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    reward_claim_deadline: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
    creator_id: '0xtest1234567890123456789012345678901234567890',
    status: 'active'
  }
  
  try {
    const { data, error } = await supabase
      .from('quests')
      .insert(sampleQuest)
      .select()
      .single()
    
    if (error) {
      console.log(`❌ Failed: ${error.message}`)
      return
    }
    
    console.log(`✅ Quest created: ${data.title}`)
    console.log(`   ID: ${data.id}`)
    
  } catch (error) {
    console.log(`❌ Error: ${error}`)
  }
}

async function showStats(): Promise<void> {
  console.log('\n📊 Database Statistics:')
  
  const tables = ['users', 'quests', 'quest_participations']
  
  for (const table of tables) {
    try {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true })
      
      if (error) {
        console.log(`   ${table}: Error - ${error.message}`)
      } else {
        console.log(`   ${table}: ${count} records`)
      }
    } catch (err) {
      console.log(`   ${table}: Table not accessible`)
    }
  }
}

async function main(): Promise<void> {
  // Test connection
  const connected = await testConnection()
  
  if (!connected) {
    console.log('\n💡 Setup Instructions:')
    console.log('1. Copy the contents of scripts/setup-database.sql')
    console.log('2. Open your Supabase project\'s SQL editor')
    console.log('3. Paste and execute the SQL script')
    console.log('4. Run this test script again')
    return
  }
  
  // Insert sample data
  await insertSampleUser()
  await insertSampleQuest()
  
  // Show stats
  await showStats()
  
  console.log('\n🎉 Database test completed!')
  console.log('\n💡 Next steps:')
  console.log('   • Start the server: bun run dev')
  console.log('   • Test API: curl http://localhost:3001/health')
  console.log('   • Browse users: curl http://localhost:3001/api/users')
}

// Run the test
main().catch(console.error)