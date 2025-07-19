import { FastifyInstance } from 'fastify';
import { database } from '../lib/database.js';
import { QuestStatusCalculator } from '../lib/questStatusCalculator.js';
import type { QuestData } from '../types/database.js';

export async function dashboardRoutes(fastify: FastifyInstance) {
  // GET /api/dashboard/summary - Get comprehensive dashboard data
  fastify.get<{
    Reply: {
      success: true;
      data: {
        // Platform statistics
        statistics: {
          totalQuests: number;
          totalUsers: number;
          totalRewards: string;
          completedQuests: number;
          successRate: number;
          averageCompletionRate: number;
        };
        
        // Trending quests (top 5, active, sorted by participants and rewards)
        trendingQuests: Array<QuestData & {
          participationProgress: number;
          participationPercentage: number;
          remainingRewards: string;
          timeRemaining: string;
        }>;
        
        // Top earners (top 5 users)
        topEarners: Array<{
          userAddress: string;
          totalRewardsEarned: string;
          totalParticipations: number;
          completionRate: number;
          rank: number;
        }>;
        
        // Recent activity
        recentActivity: Array<{
          type: 'quest_completed' | 'quest_created' | 'reward_claimed';
          questId: string;
          userAddress: string;
          amount?: string;
          timestamp: number;
          questTitle?: string;
        }>;
      };
    } | {
      error: string;
      message: string;
      statusCode: number;
    };
  }>('/api/dashboard/summary', async (request, reply) => {
    try {
      // Get platform statistics
      const questStatistics = await database.getQuestStatistics();
      const participations = await database.getParticipations();
      const quests = await database.getQuests();
      
      // Calculate unique users count
      const uniqueUsers = new Set(participations.map(p => p.userAddress.toLowerCase())).size;
      
      // Calculate average completion rate across all quests
      const activeQuests = quests.filter(q => {
        const updated = QuestStatusCalculator.updateQuestStatus(q);
        return updated.status === 'active';
      });
      
      const averageCompletionRate = activeQuests.length > 0
        ? activeQuests.reduce((sum, quest) => {
            const percentage = QuestStatusCalculator.getParticipationPercentage(quest);
            return sum + percentage;
          }, 0) / activeQuests.length
        : 0;
      
      const statistics = {
        totalQuests: questStatistics.totalQuests,
        totalUsers: uniqueUsers,
        totalRewards: questStatistics.totalRewardsDistributed,
        completedQuests: questStatistics.completedQuests,
        successRate: questStatistics.successRate,
        averageCompletionRate: Math.round(averageCompletionRate * 100) / 100
      };
      
      // Get trending quests (top 5 active quests sorted by participation and total rewards)
      let trendingQuests = await database.getQuests();
      trendingQuests = trendingQuests
        .filter(quest => {
          const updatedQuest = QuestStatusCalculator.updateQuestStatus(quest);
          return updatedQuest.status === 'active';
        })
        .sort((a, b) => {
          // Sort by participation percentage first, then by total rewards
          const aPercentage = QuestStatusCalculator.getParticipationPercentage(a);
          const bPercentage = QuestStatusCalculator.getParticipationPercentage(b);
          if (bPercentage !== aPercentage) {
            return bPercentage - aPercentage;
          }
          return Number(BigInt(b.totalRewards) - BigInt(a.totalRewards));
        })
        .slice(0, 5)
        .map(quest => {
          const stats = QuestStatusCalculator.generateQuestStats(quest);
          const updatedQuest = QuestStatusCalculator.updateQuestStatus(quest);
          
          // Calculate time remaining
          const now = Date.now();
          const timeRemaining = updatedQuest.endTime > now 
            ? formatTimeRemaining(updatedQuest.endTime - now)
            : 'Ended';
          
          return {
            ...updatedQuest,
            participationProgress: quest.participantCount,
            participationPercentage: stats.participationPercentage,
            remainingRewards: stats.remainingRewards,
            timeRemaining
          };
        });
      
      // Get top earners (top 5 users by total rewards earned)
      const allParticipations = await database.getParticipations();
      const userStats = new Map<string, {
        totalRewards: bigint;
        participationCount: number;
      }>();
      
      allParticipations.forEach(participation => {
        const userAddress = participation.userAddress.toLowerCase();
        if (!userStats.has(userAddress)) {
          userStats.set(userAddress, {
            totalRewards: BigInt(0),
            participationCount: 0
          });
        }
        
        const stats = userStats.get(userAddress)!;
        stats.totalRewards += BigInt(participation.claimedAmount);
        stats.participationCount++;
      });
      
      const topEarners = Array.from(userStats.entries())
        .sort((a, b) => {
          const aRewards = a[1].totalRewards;
          const bRewards = b[1].totalRewards;
          return bRewards > aRewards ? 1 : bRewards < aRewards ? -1 : 0;
        })
        .slice(0, 5)
        .map(([address, stats], index) => ({
          userAddress: address,
          totalRewardsEarned: stats.totalRewards.toString(),
          totalParticipations: stats.participationCount,
          completionRate: 100, // All participations in DB are completed
          rank: index + 1
        }));
      
      // Get recent activity (last 10 activities)
      const recentActivity = allParticipations
        .sort((a, b) => b.claimedAt - a.claimedAt)
        .slice(0, 10)
        .map(participation => {
          const quest = quests.find(q => q.id === participation.questId);
          return {
            type: 'reward_claimed' as const,
            questId: participation.questId,
            userAddress: participation.userAddress,
            amount: participation.claimedAmount,
            timestamp: participation.claimedAt,
            questTitle: quest?.title || `Quest #${participation.questId}`
          };
        });
      
      return reply.send({
        success: true,
        data: {
          statistics,
          trendingQuests,
          topEarners,
          recentActivity
        }
      });
    } catch (error) {
      fastify.log.error('Error fetching dashboard summary:', error);
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to fetch dashboard summary',
        statusCode: 500
      });
    }
  });
}

// Helper function to format time remaining
function formatTimeRemaining(milliseconds: number): string {
  const days = Math.floor(milliseconds / (24 * 60 * 60 * 1000));
  const hours = Math.floor((milliseconds % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
  const minutes = Math.floor((milliseconds % (60 * 60 * 1000)) / (60 * 1000));
  
  if (days > 0) {
    return `${days} day${days > 1 ? 's' : ''} left`;
  } else if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''} left`;
  } else if (minutes > 0) {
    return `${minutes} minute${minutes > 1 ? 's' : ''} left`;
  } else {
    return 'Less than 1 minute left';
  }
}