#!/usr/bin/env bun
/**
 * API Test Script
 * 
 * This script tests the ProofQuest API endpoints after database initialization
 * It assumes the database has been set up and mock data has been inserted
 * 
 * Usage: bun run scripts/test-api.ts
 */

// Mock environment for testing
process.env.SUPABASE_URL = process.env.SUPABASE_URL || 'https://test.supabase.co'
process.env.SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'test_key'
process.env.PORT = '3003'
process.env.NODE_ENV = 'development'

const API_BASE_URL = `http://localhost:${process.env.PORT}`

async function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function testEndpoint(method: string, url: string, data?: any): Promise<any> {
  try {
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    }
    
    if (data && (method === 'POST' || method === 'PUT')) {
      options.body = JSON.stringify(data)
    }
    
    console.log(`🔍 ${method} ${url}`)
    const response = await fetch(url, options)
    const result = await response.json()
    
    if (response.ok) {
      console.log(`✅ ${response.status} - Success`)
      if (result.data) {
        if (Array.isArray(result.data.users)) {
          console.log(`   📊 Found ${result.data.users.length} users`)
        } else if (Array.isArray(result.data.quests)) {
          console.log(`   📊 Found ${result.data.quests.length} quests`)
        } else if (Array.isArray(result.data.participations)) {
          console.log(`   📊 Found ${result.data.participations.length} participations`)
        } else if (result.data.id) {
          console.log(`   🆔 ID: ${result.data.id}`)
          console.log(`   📝 Title/Name: ${result.data.title || result.data.nickname || 'N/A'}`)
        }
      }
      return result
    } else {
      console.log(`❌ ${response.status} - ${result.error || 'Failed'}`)
      if (result.message) {
        console.log(`   💬 ${result.message}`)
      }
      return null
    }
  } catch (error) {
    console.log(`💥 Network error: ${error}`)
    return null
  }
}

async function runTests(): Promise<void> {
  console.log('🧪 ProofQuest API Test Suite')
  console.log('============================')
  
  // Test Health Check
  console.log('\n🏥 Health Check')
  await testEndpoint('GET', `${API_BASE_URL}/health`)
  
  // Test User APIs
  console.log('\n👥 User Management Tests')
  
  // List users
  await testEndpoint('GET', `${API_BASE_URL}/api/users`)
  
  // Get specific user
  await testEndpoint('GET', `${API_BASE_URL}/api/users/0x742d35cc6635c0532925a3b8d4ba0f3a6c3c2685`)
  
  // Create new user
  const newUser = {
    address: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
    nickname: 'Test User',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Test',
    bio: 'This is a test user created by the API test script.'
  }
  const createdUser = await testEndpoint('POST', `${API_BASE_URL}/api/users`, newUser)
  
  // Update user
  if (createdUser) {
    await testEndpoint('PUT', `${API_BASE_URL}/api/users/${newUser.address}`, {
      nickname: 'Updated Test User',
      bio: 'Updated bio for testing purposes.'
    })
  }
  
  // Test Quest APIs
  console.log('\n🎯 Quest Management Tests')
  
  // List quests
  const questsResult = await testEndpoint('GET', `${API_BASE_URL}/api/quests`)
  
  // Get specific quest
  if (questsResult?.data?.quests?.length > 0) {
    const questId = questsResult.data.quests[0].id
    await testEndpoint('GET', `${API_BASE_URL}/api/quests/${questId}`)
  }
  
  // Create new quest
  const newQuest = {
    title: 'Test Quest - API Demo',
    description: 'This is a test quest created by the API test script to demonstrate quest creation functionality.',
    questType: 'twitter-interaction',
    interactionType: 'like',
    tweetUrl: 'https://twitter.com/test/status/123456789',
    rewardType: 'ETH',
    totalRewardPool: 0.1,
    rewardPerParticipant: 0.01,
    distributionMethod: 'immediate',
    startDate: new Date(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    rewardClaimDeadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    agreeToTerms: true,
    creatorAddress: '0x742d35cc6635c0532925a3b8d4ba0f3a6c3c2685'
  }
  const createdQuest = await testEndpoint('POST', `${API_BASE_URL}/api/quests`, newQuest)
  
  // Test Participation APIs
  console.log('\n🤝 Participation Management Tests')
  
  // Get user participations
  await testEndpoint('GET', `${API_BASE_URL}/api/participations/user/0x742d35cc6635c0532925a3b8d4ba0f3a6c3c2685`)
  
  // Get quest participants
  if (questsResult?.data?.quests?.length > 0) {
    const questId = questsResult.data.quests[0].id
    await testEndpoint('GET', `${API_BASE_URL}/api/participations/quest/${questId}`)
  }
  
  // Join a quest
  if (createdQuest?.data?.id && createdUser?.data?.address) {
    const participation = await testEndpoint('POST', `${API_BASE_URL}/api/participations`, {
      userAddress: createdUser.data.address,
      questId: createdQuest.data.id,
      proofUrl: 'https://twitter.com/testuser/status/987654321'
    })
    
    // Update participation status
    if (participation?.data?.id) {
      await testEndpoint('PUT', `${API_BASE_URL}/api/participations/${participation.data.id}`, {
        status: 'completed',
        proofData: { test: true, timestamp: new Date().toISOString() }
      })
    }
  }
  
  // Test Error Cases
  console.log('\n❌ Error Handling Tests')
  
  // Invalid user address
  await testEndpoint('GET', `${API_BASE_URL}/api/users/invalid-address`)
  
  // Invalid quest ID
  await testEndpoint('GET', `${API_BASE_URL}/api/quests/invalid-uuid`)
  
  // Invalid participation data
  await testEndpoint('POST', `${API_BASE_URL}/api/participations`, {
    userAddress: 'invalid-address',
    questId: 'invalid-uuid'
  })
  
  console.log('\n🎉 API Tests Completed!')
  console.log('\n💡 Tips:')
  console.log('   • Check server logs for detailed request/response information')
  console.log('   • Use tools like Postman or curl for more detailed API testing')
  console.log('   • Monitor your Supabase dashboard for database changes')
}

async function main(): Promise<void> {
  console.log('⏳ Starting ProofQuest server for testing...')
  
  try {
    // Import and start the server
    const serverModule = await import('../index.js')
    
    // Wait for server to start
    await delay(2000)
    
    // Run tests
    await runTests()
    
    console.log('\n✅ All tests completed successfully!')
    
  } catch (error) {
    console.error('\n❌ Test execution failed:', error)
  }
  
  // Exit process
  setTimeout(() => {
    console.log('\n👋 Shutting down test environment...')
    process.exit(0)
  }, 1000)
}

// Run the tests
main().catch(console.error)