#!/usr/bin/env bun
/**
 * Insert Mock Data Script
 * 
 * This script inserts mock data into existing database tables
 * Run after setting up tables with setup-database.sql
 * 
 * Usage: bun insert-mock-data.ts
 */

import { createClient } from '@supabase/supabase-js'

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
  const dashboardMatch = url.match(/project\/([a-z0-9]+)/)
  if (dashboardMatch) {
    const projectRef = dashboardMatch[1]
    return `https://${projectRef}.supabase.co`
  }
  return url
}

const apiUrl = getApiUrl(SUPABASE_URL)
console.log('🚀 ProofQuest Mock Data Insertion')
console.log('==================================')
console.log(`🔗 API URL: ${apiUrl}`)

const supabase = createClient(apiUrl, SUPABASE_ANON_KEY)

async function checkTables(): Promise<boolean> {
  console.log('\n🔍 Checking if tables exist...')
  
  try {
    const { error: usersError } = await supabase.from('users').select('count').limit(1)
    const { error: questsError } = await supabase.from('quests').select('count').limit(1)
    const { error: participationsError } = await supabase.from('quest_participations').select('count').limit(1)
    
    if (usersError || questsError || participationsError) {
      console.log('❌ Some tables are missing')
      console.log('💡 Please run the setup-database.sql script in Supabase SQL Editor first')
      return false
    }
    
    console.log('✅ All tables exist')
    return true
    
  } catch (error) {
    console.error('❌ Failed to check tables:', error)
    return false
  }
}

async function insertUsers(): Promise<string[]> {
  console.log('\n👥 Inserting users...')
  
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

  try {
    const { data, error } = await supabase
      .from('users')
      .upsert(mockUsers, { onConflict: 'address' })
      .select()

    if (error) {
      console.error('❌ Failed to insert users:', error)
      return []
    }

    console.log(`✅ Inserted ${data.length} users`)
    return data.map(user => user.address)
  } catch (error) {
    console.error('❌ Error inserting users:', error)
    return []
  }
}

async function insertQuests(userAddresses: string[]): Promise<string[]> {
  console.log('\n🎯 Inserting quests...')
  
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
      creator_id: userAddresses[0] || null,
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
      creator_id: userAddresses[1] || null,
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
      creator_id: userAddresses[2] || null,
      status: 'active'
    }
  ]

  try {
    const { data, error } = await supabase
      .from('quests')
      .insert(mockQuests)
      .select()

    if (error) {
      console.error('❌ Failed to insert quests:', error)
      return []
    }

    console.log(`✅ Inserted ${data.length} quests`)
    return data.map(quest => quest.id)
  } catch (error) {
    console.error('❌ Error inserting quests:', error)
    return []
  }
}

async function insertParticipations(userAddresses: string[], questIds: string[]): Promise<void> {
  console.log('\n🤝 Inserting participations...')
  
  if (userAddresses.length < 3 || questIds.length < 2) {
    console.log('⚠️  Not enough users or quests to create participations')
    return
  }
  
  const mockParticipations = [
    {
      user_address: userAddresses[1],
      quest_id: questIds[0],
      status: 'completed',
      proof_url: 'https://twitter.com/BobSmith/status/1111111111',
      proof_data: { action: 'follow', timestamp: new Date().toISOString() },
      completed_at: new Date().toISOString()
    },
    {
      user_address: userAddresses[2],
      quest_id: questIds[0],
      status: 'pending'
    },
    {
      user_address: userAddresses[0],
      quest_id: questIds[1],
      status: 'verified',
      proof_url: 'https://twitter.com/AliceChen/status/2222222222',
      proof_data: { action: 'retweet', timestamp: new Date().toISOString() },
      completed_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      verified_at: new Date().toISOString()
    }
  ]

  try {
    const { data, error } = await supabase
      .from('quest_participations')
      .insert(mockParticipations)
      .select()

    if (error) {
      console.error('❌ Failed to insert participations:', error)
      return
    }

    console.log(`✅ Inserted ${data.length} participations`)
  } catch (error) {
    console.error('❌ Error inserting participations:', error)
  }
}

async function showSummary(): Promise<void> {
  console.log('\n📊 Database Summary:')
  
  try {
    // Count records
    const { count: userCount } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
    
    const { count: questCount } = await supabase
      .from('quests')
      .select('*', { count: 'exact', head: true })
    
    const { count: participationCount } = await supabase
      .from('quest_participations')
      .select('*', { count: 'exact', head: true })
    
    console.log(`   👥 Users: ${userCount}`)
    console.log(`   🎯 Quests: ${questCount}`)
    console.log(`   🤝 Participations: ${participationCount}`)
    
    // Show sample data
    const { data: sampleQuests } = await supabase
      .from('quests')
      .select('title, status, creator_id')
      .limit(3)
    
    console.log('\n📋 Sample Quests:')
    sampleQuests?.forEach((quest, index) => {
      const creatorShort = quest.creator_id ? quest.creator_id.slice(0, 8) + '...' : 'None'
      console.log(`   ${index + 1}. ${quest.title} (${quest.status}) - Creator: ${creatorShort}`)
    })
    
  } catch (error) {
    console.error('❌ Failed to get summary:', error)
  }
}

async function main(): Promise<void> {
  try {
    // Check if tables exist
    const tablesExist = await checkTables()
    if (!tablesExist) {
      return
    }
    
    // Insert data
    const userAddresses = await insertUsers()
    const questIds = await insertQuests(userAddresses)
    await insertParticipations(userAddresses, questIds)
    
    // Show summary
    await showSummary()
    
    console.log('\n🎉 Mock data insertion completed!')
    console.log('\n💡 Next steps:')
    console.log('   • Start the server: bun run dev')
    console.log('   • Test API: curl http://localhost:3001/health')
    console.log('   • Get users: curl http://localhost:3001/api/users')
    console.log('   • Get quests: curl http://localhost:3001/api/quests')
    
  } catch (error) {
    console.error('\n❌ Mock data insertion failed:', error)
    process.exit(1)
  }
}

main().catch(console.error)