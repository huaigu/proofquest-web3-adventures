#!/usr/bin/env bun
/**
 * Print all users from the database
 */

import { database } from '../lib/database.js'

async function printUsers() {
  try {
    console.log('👥 Loading users from database...\n')
    
    // Initialize database
    await database.init()
    
    // Get all users
    const users = await database.getUsers()
    
    if (users.length === 0) {
      console.log('📭 No users found in database.')
      return
    }
    
    console.log(`📊 Found ${users.length} user(s):\n`)
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. 👤 User: ${user.address}`)
      if (user.nickname) {
        console.log(`   🏷️  Nickname: ${user.nickname}`)
      }
      if (user.avatarUrl) {
        console.log(`   🖼️  Avatar: ${user.avatarUrl}`)
      }
      if (user.bio) {
        console.log(`   📝 Bio: ${user.bio}`)
      }
      console.log(`   ⏰ Created: ${new Date(user.createdAt).toLocaleString()}`)
      console.log(`   🔄 Updated: ${new Date(user.updatedAt).toLocaleString()}`)
      if (user.lastLoginAt) {
        console.log(`   🔑 Last Login: ${new Date(user.lastLoginAt).toLocaleString()}`)
      }
      if (index < users.length - 1) {
        console.log('')
      }
    })
    
    // Get user statistics for each user
    console.log('\n📈 User Statistics:')
    for (const user of users) {
      try {
        const stats = await database.getUserStatistics(user.address)
        console.log(`\n👤 ${user.address}:`)
        console.log(`   🎯 Total Participations: ${stats.totalParticipations}`)
        console.log(`   💰 Total Rewards Earned: ${stats.totalRewardsEarned} wei`)
        console.log(`   ✅ Completion Rate: ${(stats.completionRate * 100).toFixed(2)}%`)
        if (stats.totalParticipations > 0) {
          console.log(`   📊 Average Reward: ${stats.averageRewardPerParticipation} wei`)
        }
      } catch (error) {
        console.log(`   ⚠️  Unable to load statistics: ${error.message}`)
      }
    }
    
  } catch (error) {
    console.error('❌ Error loading users:', error)
    process.exit(1)
  }
}

printUsers()