#!/usr/bin/env bun
/**
 * Print all data from the database (quests, users, participations)
 */

import { database } from '../lib/database.js'

async function printAll() {
  try {
    console.log('🗄️  Loading all data from database...\n')
    
    // Initialize database
    await database.init()
    
    // Get all data
    const [quests, users, participations] = await Promise.all([
      database.getQuests(),
      database.getUsers(),
      database.getParticipations()
    ])
    
    console.log('=' .repeat(80))
    console.log('🎯 QUESTS')
    console.log('=' .repeat(80))
    
    if (quests.length === 0) {
      console.log('📭 No quests found.')
    } else {
      console.log(`📊 Found ${quests.length} quest(s):\n`)
      quests.forEach((quest, index) => {
        console.log(`${index + 1}. ${quest.title} (${quest.status})`)
        console.log(`   💰 ${quest.totalRewards} wei | 👥 ${quest.participantCount}/${quest.maxParticipants}`)
        console.log(`   🆔 ${quest.id}`)
      })
    }
    
    console.log('\n' + '=' .repeat(80))
    console.log('👥 USERS')
    console.log('=' .repeat(80))
    
    if (users.length === 0) {
      console.log('📭 No users found.')
    } else {
      console.log(`📊 Found ${users.length} user(s):\n`)
      users.forEach((user, index) => {
        console.log(`${index + 1}. ${user.address}`)
        if (user.nickname) console.log(`   🏷️  ${user.nickname}`)
        console.log(`   ⏰ Created: ${new Date(user.createdAt).toLocaleString()}`)
      })
    }
    
    console.log('\n' + '=' .repeat(80))
    console.log('🤝 PARTICIPATIONS')
    console.log('=' .repeat(80))
    
    if (participations.length === 0) {
      console.log('📭 No participations found.')
    } else {
      console.log(`📊 Found ${participations.length} participation(s):\n`)
      participations.forEach((participation, index) => {
        console.log(`${index + 1}. Quest ${participation.questId} | User ${participation.userAddress}`)
        console.log(`   💰 ${participation.claimedAmount} wei | ⏰ ${new Date(participation.claimedAt).toLocaleString()}`)
      })
    }
    
    // Overall statistics
    console.log('\n' + '=' .repeat(80))
    console.log('📈 OVERALL STATISTICS')
    console.log('=' .repeat(80))
    
    const uniqueParticipantUsers = new Set(participations.map(p => p.userAddress.toLowerCase())).size
    const totalRewards = participations.reduce((sum, p) => sum + BigInt(p.claimedAmount), BigInt(0))
    
    console.log(`🎯 Total Quests: ${quests.length}`)
    console.log(`👥 Total Users: ${users.length}`)
    console.log(`🤝 Total Participations: ${participations.length}`)
    console.log(`👤 Active Participants: ${uniqueParticipantUsers}`)
    console.log(`💎 Total Rewards Distributed: ${totalRewards.toString()} wei`)
    
    // Get indexer state
    const indexerState = await database.getIndexerState()
    console.log('\n📡 Indexer State:')
    console.log(`   🧱 Last Processed Block: ${indexerState.lastProcessedBlock}`)
    console.log(`   🏭 Contract Address: ${indexerState.contractAddress || 'Not configured'}`)
    console.log(`   ⏰ Last Updated: ${new Date(indexerState.lastUpdated).toLocaleString()}`)
    
  } catch (error) {
    console.error('❌ Error loading data:', error)
    process.exit(1)
  }
}

printAll()