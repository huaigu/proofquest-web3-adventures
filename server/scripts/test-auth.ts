#!/usr/bin/env bun
/**
 * Authentication Testing Script
 * 
 * Test the EVM authentication flow with Sign-In with Ethereum (SIWE)
 */

import { ethers } from 'ethers'

const SERVER_URL = 'http://localhost:8080'

// Test wallet (DO NOT use in production)
const TEST_PRIVATE_KEY = '0x0123456789012345678901234567890123456789012345678901234567890123'
const wallet = new ethers.Wallet(TEST_PRIVATE_KEY)
const testAddress = wallet.address.toLowerCase()

console.log('🧪 ProofQuest Authentication Test')
console.log('==================================')
console.log(`🔑 Test Address: ${testAddress}`)
console.log(`🌐 Server URL: ${SERVER_URL}`)

interface NonceResponse {
  nonce: string
  message: string
  domain: string
  expiresAt: string
}

interface AuthResponse {
  success: boolean
  token?: string
  user?: {
    address: string
    nickname?: string
    avatarUrl?: string
    bio?: string
  }
  expiresAt?: string
  message?: string
}

async function testHealthCheck(): Promise<boolean> {
  console.log('\n🏥 Testing health check...')
  
  try {
    const response = await fetch(`${SERVER_URL}/health`)
    const data = await response.json()
    
    if (response.ok) {
      console.log('✅ Health check passed:', data)
      return true
    } else {
      console.log('❌ Health check failed:', data)
      return false
    }
  } catch (error) {
    console.log('❌ Health check failed:', error)
    return false
  }
}

async function requestNonce(): Promise<NonceResponse | null> {
  console.log('\n🎲 Requesting nonce...')
  
  try {
    const response = await fetch(`${SERVER_URL}/api/auth/nonce`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        address: testAddress,
        domain: 'localhost:8080',
        chainId: 1
      })
    })
    
    const data = await response.json()
    
    if (response.ok) {
      console.log('✅ Nonce received:', data)
      return data as NonceResponse
    } else {
      console.log('❌ Nonce request failed:', data)
      return null
    }
  } catch (error) {
    console.log('❌ Nonce request failed:', error)
    return null
  }
}

async function signMessage(message: string): Promise<string> {
  console.log('\n✍️  Signing message...')
  console.log('Message:', message)
  
  try {
    const signature = await wallet.signMessage(message)
    console.log('✅ Message signed:', signature)
    return signature
  } catch (error) {
    console.log('❌ Message signing failed:', error)
    throw error
  }
}

async function signIn(message: string, signature: string): Promise<AuthResponse | null> {
  console.log('\n🔐 Signing in...')
  
  try {
    const response = await fetch(`${SERVER_URL}/api/auth/signin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message,
        signature
      })
    })
    
    const data = await response.json()
    
    if (response.ok) {
      console.log('✅ Sign-in successful:', data)
      return data as AuthResponse
    } else {
      console.log('❌ Sign-in failed:', data)
      return null
    }
  } catch (error) {
    console.log('❌ Sign-in failed:', error)
    return null
  }
}

async function verifyToken(token: string): Promise<boolean> {
  console.log('\n🔍 Verifying token...')
  
  try {
    const response = await fetch(`${SERVER_URL}/api/auth/verify`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    const data = await response.json()
    
    if (response.ok) {
      console.log('✅ Token verification successful:', data)
      return true
    } else {
      console.log('❌ Token verification failed:', data)
      return false
    }
  } catch (error) {
    console.log('❌ Token verification failed:', error)
    return false
  }
}

async function testProtectedEndpoint(token: string): Promise<boolean> {
  console.log('\n🛡️  Testing protected endpoint (create quest)...')
  
  const testQuest = {
    title: 'Test Quest - Authentication Check',
    description: 'This quest is created to test the authentication system.',
    questType: 'twitter-interaction',
    interactionType: 'follow',
    targetAccount: '@TestAccount',
    rewardType: 'ETH',
    totalRewardPool: 0.1,
    rewardPerParticipant: 0.01,
    distributionMethod: 'immediate',
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    rewardClaimDeadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    agreeToTerms: true
  }
  
  try {
    const response = await fetch(`${SERVER_URL}/api/quests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(testQuest)
    })
    
    const data = await response.json()
    
    if (response.ok) {
      console.log('✅ Protected endpoint access successful:', data)
      return true
    } else {
      console.log('❌ Protected endpoint access failed:', data)
      return false
    }
  } catch (error) {
    console.log('❌ Protected endpoint access failed:', error)
    return false
  }
}

async function testWithoutToken(): Promise<boolean> {
  console.log('\n🚫 Testing protected endpoint without token...')
  
  try {
    const response = await fetch(`${SERVER_URL}/api/quests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: 'Unauthorized Quest',
        description: 'This should fail'
      })
    })
    
    const data = await response.json()
    
    if (response.status === 401) {
      console.log('✅ Correctly rejected unauthorized request:', data)
      return true
    } else {
      console.log('❌ Should have rejected unauthorized request:', data)
      return false
    }
  } catch (error) {
    console.log('❌ Unexpected error:', error)
    return false
  }
}

async function main() {
  let allTestsPassed = true
  
  // Test 1: Health check
  const healthOk = await testHealthCheck()
  if (!healthOk) {
    console.log('\n❌ Server is not running. Please start the server with: bun run dev')
    process.exit(1)
  }
  
  // Test 2: Request nonce
  const nonceData = await requestNonce()
  if (!nonceData) {
    allTestsPassed = false
  } else {
    // Test 3: Sign message
    try {
      const signature = await signMessage(nonceData.message)
      
      // Test 4: Sign in
      const authData = await signIn(nonceData.message, signature)
      if (!authData || !authData.token) {
        allTestsPassed = false
      } else {
        // Test 5: Verify token
        const tokenValid = await verifyToken(authData.token)
        if (!tokenValid) {
          allTestsPassed = false
        }
        
        // Test 6: Test protected endpoint with token
        const protectedOk = await testProtectedEndpoint(authData.token)
        if (!protectedOk) {
          allTestsPassed = false
        }
      }
    } catch (error) {
      allTestsPassed = false
    }
  }
  
  // Test 7: Test protected endpoint without token
  const unauthorizedOk = await testWithoutToken()
  if (!unauthorizedOk) {
    allTestsPassed = false
  }
  
  // Summary
  console.log('\n📊 Test Summary')
  console.log('================')
  if (allTestsPassed) {
    console.log('🎉 All authentication tests passed!')
    console.log('\n💡 Authentication system is working correctly:')
    console.log('   • Nonce generation ✅')
    console.log('   • SIWE signature verification ✅')
    console.log('   • JWT token generation ✅')
    console.log('   • Token verification ✅')
    console.log('   • Protected endpoint access ✅')
    console.log('   • Unauthorized request rejection ✅')
  } else {
    console.log('❌ Some authentication tests failed!')
    console.log('💡 Please check the server logs and fix the issues.')
    process.exit(1)
  }
}

main().catch(console.error)