#!/usr/bin/env bun
/**
 * Print all quests from the database
 */

import { database } from '../lib/database.js'

async function printQuests() {
  try {
    console.log('🎯 Loading quests from database...\n')
    
    // Initialize database
    await database.init()
    
    // Get all quests
    const quests = await database.getQuests()
    
    if (quests.length === 0) {
      console.log('📭 No quests found in database.')
      return
    }
    
    console.log(`📊 Found ${quests.length} quest(s):\n`)
    
    quests.forEach((quest, index) => {
      console.log(`${index + 1}. 🎮 Quest: ${quest.title}`)
      console.log(`   📝 Description: ${quest.description}`)
      console.log(`   🏷️  Type: ${quest.questType}`)
      console.log(`   📍 Status: ${quest.status}`)
      console.log(`   💰 Total Rewards: ${quest.totalRewards} wei`)
      console.log(`   👥 Participants: ${quest.participantCount}/${quest.maxParticipants}`)
      console.log(`   🕐 Start: ${new Date(quest.startTime).toLocaleString()}`)
      console.log(`   🕕 End: ${new Date(quest.endTime).toLocaleString()}`)
      console.log(`   🆔 ID: ${quest.id}`)
      console.log(`   📤 Sponsor: ${quest.sponsor}`)
      console.log(`   ⏰ Created: ${new Date(quest.createdAt).toLocaleString()}`)
      if (index < quests.length - 1) {
        console.log('')
      }
    })
    
    // Get quest statistics
    const stats = await database.getQuestStatistics()
    console.log('\n📈 Quest Statistics:')
    console.log(`   📊 Total Quests: ${stats.totalQuests}`)
    console.log(`   🟢 Active Quests: ${stats.activeQuests}`)
    console.log(`   ✅ Completed Quests: ${stats.completedQuests}`)
    console.log(`   👥 Total Participants: ${stats.totalParticipants}`)
    console.log(`   💎 Total Rewards Distributed: ${stats.totalRewardsDistributed} wei`)
    console.log(`   📊 Success Rate: ${(stats.successRate * 100).toFixed(2)}%`)
    
  } catch (error) {
    console.error('❌ Error loading quests:', error)
    process.exit(1)
  }
}

printQuests()