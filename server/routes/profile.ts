import { FastifyInstance } from 'fastify';
import { database } from '../lib/database.js';
import { QuestStatusCalculator } from '../lib/questStatusCalculator.js';
import type { QuestData, ParticipationData } from '../types/database.js';

export async function profileRoutes(fastify: FastifyInstance) {
  // GET /api/profile/:address/summary - Get comprehensive profile data
  fastify.get<{
    Params: { address: string };
    Reply: {
      success: true;
      data: {
        // User basic info
        profile: {
          userAddress: string;
          joinDate: string;
          totalEarned: string;
          questsCompleted: number;
          questsCreated: number;
          successRate: number;
          rank: number;
          totalUsers: number;
        };
        
        // User's quest history by category
        quests: {
          active: Array<QuestData & {
            participationProgress: number;
            participationPercentage: number;
            timeRemaining: string;
            userParticipated: boolean;
          }>;
          completed: Array<QuestData & {
            completedDate: string;
            rewardEarned: string;
            userParticipation: ParticipationData;
          }>;
          created: Array<QuestData & {
            participationProgress: number;
            participationPercentage: number;
            totalRewardsDistributed: string;
            status: string;
          }>;
        };
        
        // Rewards breakdown
        rewards: {
          pending: Array<{
            questId: string;
            questTitle: string;
            amount: string;
            type: string;
            claimable: boolean;
          }>;
          history: Array<{
            questId: string;
            questTitle: string;
            amount: string;
            type: string;
            date: string;
            txHash: string;
          }>;
          vesting: Array<{
            questId: string;
            questTitle: string;
            totalAmount: string;
            vestedAmount: string;
            claimableAmount: string;
            vestingProgress: number;
            timeRemaining: string;
          }>;
        };
        
        // Activity timeline
        activity: Array<{
          type: 'quest_completed' | 'quest_created' | 'reward_claimed';
          description: string;
          timestamp: number;
          questId?: string;
          amount?: string;
        }>;
      };
    } | {
      error: string;
      message: string;
      statusCode: number;
    };
  }>('/api/profile/:address/summary', async (request, reply) => {
    try {
      const { address } = request.params;
      
      // Validate EVM address format
      const evmAddressRegex = /^0x[a-fA-F0-9]{40}$/;
      if (!evmAddressRegex.test(address)) {
        return reply.status(400).send({
          error: 'Invalid Address',
          message: 'Address must be a valid EVM address',
          statusCode: 400
        });
      }
      
      const normalizedAddress = address.toLowerCase();
      
      // Get user's participation history
      const userParticipations = await database.getParticipationsByUser(address);
      const userStats = await database.getUserStatistics(address);
      
      // Get all quests for comparison
      const allQuests = await database.getQuests();
      const allParticipations = await database.getParticipations();
      
      // Calculate user's rank
      const userRewardsByAddress = new Map<string, bigint>();
      allParticipations.forEach(p => {
        const userAddr = p.userAddress.toLowerCase();
        if (!userRewardsByAddress.has(userAddr)) {
          userRewardsByAddress.set(userAddr, BigInt(0));
        }
        userRewardsByAddress.set(userAddr, userRewardsByAddress.get(userAddr)! + BigInt(p.claimedAmount));
      });
      
      const userRewardsSorted = Array.from(userRewardsByAddress.entries())
        .sort((a, b) => b[1] > a[1] ? 1 : b[1] < a[1] ? -1 : 0);
      
      const userRank = userRewardsSorted.findIndex(([addr]) => addr === normalizedAddress) + 1;
      const totalUsers = userRewardsByAddress.size;
      
      // Find earliest participation date as join date
      const joinDate = userParticipations.length > 0
        ? new Date(Math.min(...userParticipations.map(p => p.claimedAt))).toISOString()
        : new Date().toISOString();
      
      // Build profile data
      const profile = {
        userAddress: address,
        joinDate,
        totalEarned: userStats.totalRewardsEarned,
        questsCompleted: userStats.totalParticipations,
        questsCreated: allQuests.filter(q => q.sponsor.toLowerCase() === normalizedAddress).length,
        successRate: userStats.completionRate,
        rank: userRank || totalUsers + 1, // If not found, put at end
        totalUsers
      };
      
      // Get user's active quests (quests they haven't completed yet)
      const userParticipatedQuestIds = new Set(userParticipations.map(p => p.questId));
      const activeQuests = allQuests
        .filter(quest => {
          const updated = QuestStatusCalculator.updateQuestStatus(quest);
          return updated.status === 'active' && !userParticipatedQuestIds.has(quest.id);
        })
        .slice(0, 10) // Limit to 10 active quests
        .map(quest => {
          const stats = QuestStatusCalculator.generateQuestStats(quest);
          const timeRemaining = quest.endTime > Date.now() 
            ? formatTimeRemaining(quest.endTime - Date.now())
            : 'Ended';
          
          return {
            ...quest,
            participationProgress: quest.participantCount,
            participationPercentage: stats.participationPercentage,
            timeRemaining,
            userParticipated: false
          };
        });
      
      // Get user's completed quests
      const completedQuests = userParticipations.map(participation => {
        const quest = allQuests.find(q => q.id === participation.questId);
        if (!quest) return null;
        
        return {
          ...quest,
          completedDate: new Date(participation.claimedAt).toISOString(),
          rewardEarned: participation.claimedAmount,
          userParticipation: participation
        };
      }).filter(q => q !== null).slice(0, 20); // Limit to 20 completed quests
      
      // Get user's created quests
      const createdQuests = allQuests
        .filter(q => q.sponsor.toLowerCase() === normalizedAddress)
        .map(quest => {
          const stats = QuestStatusCalculator.generateQuestStats(quest);
          const updatedQuest = QuestStatusCalculator.updateQuestStatus(quest);
          
          // Calculate total rewards distributed for this quest
          const questParticipations = allParticipations.filter(p => p.questId === quest.id);
          const totalRewardsDistributed = questParticipations.reduce((sum, p) => {
            return sum + BigInt(p.claimedAmount);
          }, BigInt(0));
          
          return {
            ...updatedQuest,
            participationProgress: quest.participantCount,
            participationPercentage: stats.participationPercentage,
            totalRewardsDistributed: totalRewardsDistributed.toString(),
            status: updatedQuest.status
          };
        });
      
      // Build rewards data
      const rewards = {
        pending: [] as any[], // In the current system, all rewards are immediately claimed
        history: userParticipations.map(participation => {
          const quest = allQuests.find(q => q.id === participation.questId);
          return {
            questId: participation.questId,
            questTitle: quest?.title || `Quest #${participation.questId}`,
            amount: participation.claimedAmount,
            type: 'ETH', // Default type, could be enhanced with token info
            date: new Date(participation.claimedAt).toISOString(),
            txHash: participation.transactionHash
          };
        }).slice(0, 20), // Limit to 20 recent rewards
        vesting: [] as any[] // No vesting rewards in current system
      };
      
      // Build activity timeline
      const activity = [
        // Quest completions
        ...userParticipations.map(participation => {
          const quest = allQuests.find(q => q.id === participation.questId);
          return {
            type: 'reward_claimed' as const,
            description: `Completed '${quest?.title || `Quest #${participation.questId}`}' quest`,
            timestamp: participation.claimedAt,
            questId: participation.questId,
            amount: participation.claimedAmount
          };
        }),
        
        // Quest creations
        ...createdQuests.map(quest => ({
          type: 'quest_created' as const,
          description: `Created '${quest.title}' quest`,
          timestamp: quest.createdAt,
          questId: quest.id
        }))
      ].sort((a, b) => b.timestamp - a.timestamp).slice(0, 20); // Most recent 20 activities
      
      return reply.send({
        success: true,
        data: {
          profile,
          quests: {
            active: activeQuests,
            completed: completedQuests,
            created: createdQuests
          },
          rewards,
          activity
        }
      });
    } catch (error) {
      fastify.log.error('Error fetching profile summary:', error);
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to fetch profile summary',
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