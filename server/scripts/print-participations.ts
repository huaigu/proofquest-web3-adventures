#!/usr/bin/env bun
/**
 * Print all participations from the database
 */

import { database } from '../lib/database.js'

async function printParticipations() {
  try {
    console.log('🤝 Loading participations from database...\n')
    
    // Initialize database
    await database.init()
    
    // Get all participations
    const participations = await database.getParticipations()
    
    if (participations.length === 0) {
      console.log('📭 No participations found in database.')
      return
    }
    
    console.log(`📊 Found ${participations.length} participation(s):\n`)
    
    participations.forEach((participation, index) => {
      console.log(`${index + 1}. 🎯 Participation ID: ${participation.id}`)
      console.log(`   🎮 Quest ID: ${participation.questId}`)
      console.log(`   👤 User Address: ${participation.userAddress}`)
      console.log(`   💰 Claimed Amount: ${participation.claimedAmount} wei`)
      console.log(`   ⏰ Claimed At: ${new Date(participation.claimedAt).toLocaleString()}`)
      console.log(`   📅 Created At: ${new Date(participation.createdAt).toLocaleString()}`)
      console.log(`   🔗 Transaction Hash: ${participation.transactionHash}`)
      console.log(`   🧱 Block Number: ${participation.blockNumber}`)
      if (index < participations.length - 1) {
        console.log('')
      }
    })
    
    // Show participation summary
    const uniqueUsers = new Set(participations.map(p => p.userAddress.toLowerCase())).size
    const uniqueQuests = new Set(participations.map(p => p.questId)).size
    const totalRewards = participations.reduce((sum, p) => sum + BigInt(p.claimedAmount), BigInt(0))
    
    console.log('\n📈 Participation Summary:')
    console.log(`   👥 Unique Users: ${uniqueUsers}`)
    console.log(`   🎯 Unique Quests: ${uniqueQuests}`)
    console.log(`   💎 Total Rewards Claimed: ${totalRewards.toString()} wei`)
    console.log(`   📊 Average Reward per Participation: ${participations.length > 0 ? (totalRewards / BigInt(participations.length)).toString() : '0'} wei`)
    
  } catch (error) {
    console.error('❌ Error loading participations:', error)
    process.exit(1)
  }
}

printParticipations()