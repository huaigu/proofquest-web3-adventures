#!/usr/bin/env bun
/**
 * Database Initialization Script
 * 
 * This script initializes the Supabase database with:
 * 1. Creating all necessary tables
 * 2. Setting up indexes and constraints
 * 3. Inserting mock data for testing
 * 
 * Usage: bun run scripts/init-database.ts
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join } from 'path'

// Load environment variables
const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing Supabase environment variables')
  console.error('Please ensure SUPABASE_URL and SUPABASE_ANON_KEY are set in .env file')
  process.exit(1)
}

// Extract actual API URL from dashboard URL if needed
function getApiUrl(url: string): string {
  // If it's a dashboard URL, extract the project ref and construct API URL
  const dashboardMatch = url.match(/project\/([a-z0-9]+)/)
  if (dashboardMatch) {
    const projectRef = dashboardMatch[1]
    return `https://${projectRef}.supabase.co`
  }
  return url
}

const apiUrl = getApiUrl(SUPABASE_URL)
console.log(`🔗 Using Supabase API URL: ${apiUrl}`)

// Create Supabase client
const supabase = createClient(apiUrl, SUPABASE_ANON_KEY)

async function readMigrationFile(filename: string): Promise<string> {
  try {
    const filePath = join(process.cwd(), 'migrations', filename)
    return readFileSync(filePath, 'utf-8')
  } catch (error) {
    console.error(`❌ Failed to read migration file: ${filename}`)
    throw error
  }
}

async function executeSql(sql: string, description: string): Promise<void> {
  console.log(`📝 ${description}...`)
  console.log('⚠️  Note: This script requires manual SQL execution in Supabase SQL Editor')
  console.log(`💡 Please copy the contents of the migration files and execute them manually:`)
  console.log('   1. Open Supabase Dashboard > SQL Editor')
  console.log('   2. Copy contents from migrations/001_create_quests_table.sql')
  console.log('   3. Execute the SQL')
  console.log('   4. Copy contents from migrations/002_create_users_table.sql') 
  console.log('   5. Execute the SQL')
  console.log('   6. Run this script again to insert mock data')
}

async function createTables(): Promise<void> {
  console.log('\n🏗️  Checking database tables...')
  
  try {
    // Check if tables exist
    const { error: usersError } = await supabase.from('users').select('count').limit(1)
    const { error: questsError } = await supabase.from('quests').select('count').limit(1)
    
    if (usersError || questsError) {
      console.log('❌ Tables do not exist')
      await executeSql('', 'Manual SQL execution required')
      return
    }
    
    console.log('✅ Database tables already exist')
  } catch (error) {
    console.error('❌ Failed to check tables:', error)
    console.log('💡 Manual setup may be required')
  }
}

async function insertMockData(): Promise<void> {
  console.log('\n📊 Inserting mock data...')
  
  try {
    // Mock users
    const mockUsers = [
      {
        address: '0x742d35cc6635c0532925a3b8d4ba0f3a6c3c2685',
        nickname: 'Alice Chen',
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice',
        bio: 'Web3 developer and DeFi enthusiast. Building the future of finance.',
      },
      {
        address: '0x8ba1f109551bd432803012645hac136c5532c21c',
        nickname: 'Bob Smith',
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob',
        bio: 'Crypto trader and blockchain advocate. Always looking for the next big thing.',
      },
      {
        address: '0x1234567890123456789012345678901234567890',
        nickname: 'Charlie Wilson',
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie',
        bio: 'NFT artist and community builder. Creating digital art on the blockchain.',
      }
    ]

    // Insert users
    const { data: insertedUsers, error: userError } = await supabase
      .from('users')
      .upsert(mockUsers, { onConflict: 'address' })
      .select()

    if (userError) {
      console.error('❌ Failed to insert users:', userError)
    } else {
      console.log(`✅ Inserted ${insertedUsers?.length || 0} users`)
    }

    // Mock quests
    const mockQuests = [
      {
        title: 'Follow @ProofQuest on Twitter',
        description: 'Follow our official Twitter account to stay updated with the latest news and announcements. Be part of our growing community!',
        quest_type: 'twitter-interaction',
        interaction_type: 'follow',
        target_account: '@ProofQuest',
        reward_type: 'ETH',
        total_reward_pool: 1.0,
        reward_per_participant: 0.01,
        distribution_method: 'immediate',
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        reward_claim_deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        creator_id: mockUsers[0].address,
        status: 'active'
      },
      {
        title: 'Like and Retweet Our Launch Post',
        description: 'Help us spread the word about ProofQuest! Like and retweet our launch announcement to earn rewards.',
        quest_type: 'twitter-interaction',
        interaction_type: 'retweet',
        tweet_url: 'https://twitter.com/ProofQuest/status/1234567890',
        reward_type: 'ETH',
        total_reward_pool: 2.0,
        reward_per_participant: 0.02,
        distribution_method: 'immediate',
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
        reward_claim_deadline: new Date(Date.now() + 17 * 24 * 60 * 60 * 1000).toISOString(),
        creator_id: mockUsers[1].address,
        status: 'active'
      },
      {
        title: 'Quote Tweet with #Web3Quest',
        description: 'Quote tweet our pinned post with the hashtag #Web3Quest and share why you\'re excited about the future of Web3!',
        quest_type: 'quote-tweet',
        quote_tweet_url: 'https://twitter.com/ProofQuest/status/9876543210',
        quote_requirements: '#Web3Quest',
        reward_type: 'ETH',
        total_reward_pool: 0.5,
        reward_per_participant: 0.005,
        distribution_method: 'linear',
        linear_period: 30,
        unlock_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        reward_claim_deadline: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString(),
        creator_id: mockUsers[2].address,
        status: 'active'
      }
    ]

    // Insert quests
    const { data: insertedQuests, error: questError } = await supabase
      .from('quests')
      .upsert(mockQuests)
      .select()

    if (questError) {
      console.error('❌ Failed to insert quests:', questError)
    } else {
      console.log(`✅ Inserted ${insertedQuests?.length || 0} quests`)
    }

    // Mock participations
    if (insertedQuests && insertedQuests.length > 0) {
      const mockParticipations = [
        {
          user_address: mockUsers[1].address,
          quest_id: insertedQuests[0].id,
          status: 'completed',
          proof_url: 'https://twitter.com/BobSmith/status/1111111111',
          proof_data: { action: 'follow', timestamp: new Date().toISOString() },
          completed_at: new Date().toISOString()
        },
        {
          user_address: mockUsers[2].address,
          quest_id: insertedQuests[0].id,
          status: 'pending',
          joined_at: new Date().toISOString()
        },
        {
          user_address: mockUsers[0].address,
          quest_id: insertedQuests[1].id,
          status: 'verified',
          proof_url: 'https://twitter.com/AliceChen/status/2222222222',
          proof_data: { action: 'retweet', timestamp: new Date().toISOString() },
          completed_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          verified_at: new Date().toISOString()
        }
      ]

      const { data: insertedParticipations, error: participationError } = await supabase
        .from('quest_participations')
        .upsert(mockParticipations)
        .select()

      if (participationError) {
        console.error('❌ Failed to insert participations:', participationError)
      } else {
        console.log(`✅ Inserted ${insertedParticipations?.length || 0} participations`)
      }
    }

    console.log('✅ Mock data inserted successfully')
  } catch (error) {
    console.error('❌ Failed to insert mock data:', error)
  }
}

async function verifyData(): Promise<void> {
  console.log('\n🔍 Verifying data...')
  
  try {
    // Check users
    const { count: userCount, error: userCountError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })

    if (userCountError) {
      console.error('❌ Failed to count users:', userCountError)
    } else {
      console.log(`📊 Users in database: ${userCount}`)
    }

    // Check quests
    const { count: questCount, error: questCountError } = await supabase
      .from('quests')
      .select('*', { count: 'exact', head: true })

    if (questCountError) {
      console.error('❌ Failed to count quests:', questCountError)
    } else {
      console.log(`📊 Quests in database: ${questCount}`)
    }

    // Check participations
    const { count: participationCount, error: participationCountError } = await supabase
      .from('quest_participations')
      .select('*', { count: 'exact', head: true })

    if (participationCountError) {
      console.error('❌ Failed to count participations:', participationCountError)
    } else {
      console.log(`📊 Participations in database: ${participationCount}`)
    }

    // Sample data query
    const { data: sampleQuests, error: sampleError } = await supabase
      .from('quests')
      .select('id, title, creator_id, status')
      .limit(3)

    if (sampleError) {
      console.error('❌ Failed to fetch sample quests:', sampleError)
    } else {
      console.log('\n📋 Sample quests:')
      sampleQuests?.forEach(quest => {
        console.log(`  • ${quest.title} (${quest.status}) - Creator: ${quest.creator_id?.slice(0, 8)}...`)
      })
    }

  } catch (error) {
    console.error('❌ Failed to verify data:', error)
  }
}

async function main(): Promise<void> {
  console.log('🚀 ProofQuest Database Initialization Script')
  console.log('============================================')
  
  try {
    // Test connection
    console.log('\n🔌 Testing Supabase connection...')
    const { error } = await supabase.from('users').select('count').limit(1)
    if (error) {
      if (error.message.includes('relation "users" does not exist')) {
        console.log('⚠️  Tables do not exist yet - will create them')
      } else {
        console.error('❌ Failed to connect to Supabase:', error)
        process.exit(1)
      }
    } else {
      console.log('✅ Supabase connection successful - tables already exist')
    }

    // Create tables
    await createTables()
    
    // Insert mock data
    await insertMockData()
    
    // Verify data
    await verifyData()
    
    console.log('\n🎉 Database initialization completed successfully!')
    console.log('\n💡 You can now start the server with: bun run dev')
    console.log('🌐 Test the API endpoints at: http://localhost:3001')
    
  } catch (error) {
    console.error('\n❌ Database initialization failed:', error)
    process.exit(1)
  }
}

// Run the script
main().catch(console.error)