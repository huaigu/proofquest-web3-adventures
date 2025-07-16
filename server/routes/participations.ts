import { FastifyInstance } from 'fastify';
import { database } from '../lib/database.js';
import { QuestStatusCalculator } from '../lib/questStatusCalculator.js';
import type { ParticipationData } from '../types/database.js';

export async function participationRoutes(fastify: FastifyInstance) {
  // GET /api/participations/user/:address - Get user's participations
  fastify.get<{
    Params: { address: string };
    Querystring: {
      questId?: string;
      limit?: string;
      offset?: string;
    };
    Reply: {
      success: true;
      data: {
        participations: ParticipationData[];
        total: number;
        statistics: {
          totalParticipations: number;
          totalRewardsEarned: string;
          completionRate: number;
          averageRewardPerParticipation: string;
        };
        pagination: {
          offset: number;
          limit: number;
          hasMore: boolean;
        };
      };
    } | {
      error: string;
      message: string;
      statusCode: number;
    };
  }>('/api/participations/user/:address', async (request, reply) => {
    try {
      const { address } = request.params;
      const { questId, limit = '20', offset = '0' } = request.query;
      const limitNum = Math.min(parseInt(limit) || 20, 100);
      const offsetNum = parseInt(offset) || 0;

      // Validate EVM address format
      const evmAddressRegex = /^0x[a-fA-F0-9]{40}$/;
      if (!evmAddressRegex.test(address)) {
        return reply.status(400).send({
          error: 'Invalid Address',
          message: 'Address must be a valid EVM address',
          statusCode: 400
        });
      }

      // Get user participations
      let participations = await database.getParticipationsByUser(address);

      // Filter by quest ID if provided
      if (questId) {
        participations = participations.filter(p => p.questId === questId);
      }

      // Sort by claim date (newest first)
      participations.sort((a, b) => b.claimedAt - a.claimedAt);

      // Apply pagination
      const total = participations.length;
      const paginatedParticipations = participations.slice(offsetNum, offsetNum + limitNum);

      // Get user statistics
      const userStats = await database.getUserStatistics(address);

      return reply.send({
        success: true,
        data: {
          participations: paginatedParticipations,
          total,
          statistics: userStats,
          pagination: {
            offset: offsetNum,
            limit: limitNum,
            hasMore: offsetNum + limitNum < total
          }
        }
      });
    } catch (error) {
      fastify.log.error('Error fetching user participations:', error);
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to fetch user participations',
        statusCode: 500
      });
    }
  });

  // GET /api/participations/quest/:questId - Get quest's participants
  fastify.get<{
    Params: { questId: string };
    Querystring: {
      limit?: string;
      offset?: string;
    };
    Reply: {
      success: true;
      data: {
        participations: ParticipationData[];
        total: number;
        questInfo: {
          questId: string;
          participantCount: number;
          maxParticipants: number;
          participationPercentage: number;
          totalRewardsDistributed: string;
          remainingRewards: string;
        };
        pagination: {
          offset: number;
          limit: number;
          hasMore: boolean;
        };
      };
    } | {
      error: string;
      message: string;
      statusCode: number;
    };
  }>('/api/participations/quest/:questId', async (request, reply) => {
    try {
      const { questId } = request.params;
      const { limit = '20', offset = '0' } = request.query;
      const limitNum = Math.min(parseInt(limit) || 20, 100);
      const offsetNum = parseInt(offset) || 0;

      // Get quest to validate it exists
      const quest = await database.getQuestById(questId);
      if (!quest) {
        return reply.status(404).send({
          error: 'Quest Not Found',
          message: 'Quest does not exist',
          statusCode: 404
        });
      }

      // Get quest participations
      let participations = await database.getParticipationsByQuest(questId);

      // Sort by claim date (newest first)
      participations.sort((a, b) => b.claimedAt - a.claimedAt);

      // Apply pagination
      const total = participations.length;
      const paginatedParticipations = participations.slice(offsetNum, offsetNum + limitNum);

      // Calculate total rewards distributed
      const totalRewardsDistributed = participations.reduce((sum, p) => {
        return sum + BigInt(p.claimedAmount);
      }, BigInt(0));

      // Get quest statistics
      const questStats = QuestStatusCalculator.generateQuestStats(quest);

      return reply.send({
        success: true,
        data: {
          participations: paginatedParticipations,
          total,
          questInfo: {
            questId,
            participantCount: quest.participantCount,
            maxParticipants: quest.maxParticipants,
            participationPercentage: questStats.participationPercentage,
            totalRewardsDistributed: totalRewardsDistributed.toString(),
            remainingRewards: questStats.remainingRewards
          },
          pagination: {
            offset: offsetNum,
            limit: limitNum,
            hasMore: offsetNum + limitNum < total
          }
        }
      });
    } catch (error) {
      fastify.log.error('Error fetching quest participations:', error);
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to fetch quest participations',
        statusCode: 500
      });
    }
  });

  // GET /api/participations/check/:questId/:address - Check if user has participated
  fastify.get<{
    Params: { questId: string; address: string };
    Reply: {
      success: true;
      data: {
        hasParticipated: boolean;
        participation?: ParticipationData;
      };
    } | {
      error: string;
      message: string;
      statusCode: number;
    };
  }>('/api/participations/check/:questId/:address', async (request, reply) => {
    try {
      const { questId, address } = request.params;

      // Validate EVM address format
      const evmAddressRegex = /^0x[a-fA-F0-9]{40}$/;
      if (!evmAddressRegex.test(address)) {
        return reply.status(400).send({
          error: 'Invalid Address',
          message: 'Address must be a valid EVM address',
          statusCode: 400
        });
      }

      // Check if user has participated
      const hasParticipated = await database.hasUserParticipated(questId, address);

      let participation: ParticipationData | undefined;
      if (hasParticipated) {
        const userParticipations = await database.getParticipationsByUser(address);
        participation = userParticipations.find(p => p.questId === questId);
      }

      return reply.send({
        success: true,
        data: {
          hasParticipated,
          participation
        }
      });
    } catch (error) {
      fastify.log.error('Error checking user participation:', error);
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to check user participation',
        statusCode: 500
      });
    }
  });

  // GET /api/participations/leaderboard - Get user leaderboard
  fastify.get<{
    Querystring: {
      limit?: string;
      timeframe?: string; // 'all', 'month', 'week'
    };
    Reply: {
      success: true;
      data: {
        leaderboard: Array<{
          userAddress: string;
          totalParticipations: number;
          totalRewardsEarned: string;
          completionRate: number;
          averageRewardPerParticipation: string;
          rank: number;
        }>;
        total: number;
      };
    } | {
      error: string;
      message: string;
      statusCode: number;
    };
  }>('/api/participations/leaderboard', async (request, reply) => {
    try {
      const { limit = '50', timeframe = 'all' } = request.query;
      const limitNum = Math.min(parseInt(limit) || 50, 100);

      // Get all participations
      let participations = await database.getParticipations();

      // Apply timeframe filter
      if (timeframe !== 'all') {
        const now = Date.now();
        let cutoffTime: number;

        switch (timeframe) {
          case 'week':
            cutoffTime = now - (7 * 24 * 60 * 60 * 1000);
            break;
          case 'month':
            cutoffTime = now - (30 * 24 * 60 * 60 * 1000);
            break;
          default:
            cutoffTime = 0;
        }

        participations = participations.filter(p => p.claimedAt >= cutoffTime);
      }

      // Group by user address
      const userStats = new Map<string, {
        participations: ParticipationData[];
        totalRewards: bigint;
      }>();

      participations.forEach(participation => {
        const userAddress = participation.userAddress.toLowerCase();
        if (!userStats.has(userAddress)) {
          userStats.set(userAddress, {
            participations: [],
            totalRewards: BigInt(0)
          });
        }
        
        const stats = userStats.get(userAddress)!;
        stats.participations.push(participation);
        stats.totalRewards += BigInt(participation.claimedAmount);
      });

      // Create leaderboard entries
      const leaderboard = Array.from(userStats.entries()).map(([address, stats]) => ({
        userAddress: address,
        totalParticipations: stats.participations.length,
        totalRewardsEarned: stats.totalRewards.toString(),
        completionRate: 1.0, // All participations in DB are completed
        averageRewardPerParticipation: stats.participations.length > 0 
          ? (stats.totalRewards / BigInt(stats.participations.length)).toString()
          : '0'
      }));

      // Sort by total rewards earned (descending)
      leaderboard.sort((a, b) => {
        const aRewards = BigInt(a.totalRewardsEarned);
        const bRewards = BigInt(b.totalRewardsEarned);
        return bRewards > aRewards ? 1 : bRewards < aRewards ? -1 : 0;
      });

      // Add rank and apply limit
      const rankedLeaderboard = leaderboard.slice(0, limitNum).map((entry, index) => ({
        ...entry,
        rank: index + 1
      }));

      return reply.send({
        success: true,
        data: {
          leaderboard: rankedLeaderboard,
          total: leaderboard.length
        }
      });
    } catch (error) {
      fastify.log.error('Error fetching leaderboard:', error);
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to fetch leaderboard',
        statusCode: 500
      });
    }
  });

  // GET /api/participations/statistics - Get participation statistics
  fastify.get<{
    Reply: {
      success: true;
      data: {
        totalParticipations: number;
        totalRewardsDistributed: string;
        averageRewardPerParticipation: string;
        uniqueParticipants: number;
        topQuests: Array<{
          questId: string;
          participantCount: number;
          totalRewardsDistributed: string;
        }>;
        recentActivity: Array<{
          questId: string;
          userAddress: string;
          claimedAmount: string;
          claimedAt: number;
        }>;
      };
    } | {
      error: string;
      message: string;
      statusCode: number;
    };
  }>('/api/participations/statistics', async (request, reply) => {
    try {
      const participations = await database.getParticipations();
      
      // Calculate basic statistics
      const totalParticipations = participations.length;
      const totalRewardsDistributed = participations.reduce((sum, p) => {
        return sum + BigInt(p.claimedAmount);
      }, BigInt(0));
      
      const averageRewardPerParticipation = totalParticipations > 0
        ? (totalRewardsDistributed / BigInt(totalParticipations)).toString()
        : '0';
      
      const uniqueParticipants = new Set(participations.map(p => p.userAddress.toLowerCase())).size;
      
      // Top quests by participation count
      const questParticipationCounts = new Map<string, { count: number; totalRewards: bigint }>();
      participations.forEach(p => {
        if (!questParticipationCounts.has(p.questId)) {
          questParticipationCounts.set(p.questId, { count: 0, totalRewards: BigInt(0) });
        }
        const stats = questParticipationCounts.get(p.questId)!;
        stats.count++;
        stats.totalRewards += BigInt(p.claimedAmount);
      });
      
      const topQuests = Array.from(questParticipationCounts.entries())
        .sort((a, b) => b[1].count - a[1].count)
        .slice(0, 10)
        .map(([questId, stats]) => ({
          questId,
          participantCount: stats.count,
          totalRewardsDistributed: stats.totalRewards.toString()
        }));
      
      // Recent activity (last 10 participations)
      const recentActivity = participations
        .sort((a, b) => b.claimedAt - a.claimedAt)
        .slice(0, 10)
        .map(p => ({
          questId: p.questId,
          userAddress: p.userAddress,
          claimedAmount: p.claimedAmount,
          claimedAt: p.claimedAt
        }));
      
      return reply.send({
        success: true,
        data: {
          totalParticipations,
          totalRewardsDistributed: totalRewardsDistributed.toString(),
          averageRewardPerParticipation,
          uniqueParticipants,
          topQuests,
          recentActivity
        }
      });
    } catch (error) {
      fastify.log.error('Error fetching participation statistics:', error);
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to fetch participation statistics',
        statusCode: 500
      });
    }
  });

  // GET /api/participations/count - Get participation count
  fastify.get<{
    Querystring: {
      questId?: string;
      userAddress?: string;
      timeframe?: string;
    };
    Reply: {
      success: true;
      data: {
        total: number;
        byQuest?: Record<string, number>;
        byUser?: Record<string, number>;
        byTimeframe?: Record<string, number>;
      };
    } | {
      error: string;
      message: string;
      statusCode: number;
    };
  }>('/api/participations/count', async (request, reply) => {
    try {
      const { questId, userAddress, timeframe } = request.query;
      
      let participations = await database.getParticipations();
      
      // Apply filters
      if (questId) {
        participations = participations.filter(p => p.questId === questId);
      }
      
      if (userAddress) {
        participations = participations.filter(p => p.userAddress.toLowerCase() === userAddress.toLowerCase());
      }
      
      if (timeframe) {
        const now = Date.now();
        let cutoffTime: number;
        
        switch (timeframe) {
          case 'day':
            cutoffTime = now - (24 * 60 * 60 * 1000);
            break;
          case 'week':
            cutoffTime = now - (7 * 24 * 60 * 60 * 1000);
            break;
          case 'month':
            cutoffTime = now - (30 * 24 * 60 * 60 * 1000);
            break;
          default:
            cutoffTime = 0;
        }
        
        participations = participations.filter(p => p.claimedAt >= cutoffTime);
      }
      
      const total = participations.length;
      const result: any = { total };
      
      // Group by quest if not filtered by quest
      if (!questId) {
        const byQuest: Record<string, number> = {};
        participations.forEach(p => {
          byQuest[p.questId] = (byQuest[p.questId] || 0) + 1;
        });
        result.byQuest = byQuest;
      }
      
      // Group by user if not filtered by user
      if (!userAddress) {
        const byUser: Record<string, number> = {};
        participations.forEach(p => {
          const user = p.userAddress.toLowerCase();
          byUser[user] = (byUser[user] || 0) + 1;
        });
        result.byUser = byUser;
      }
      
      return reply.send({
        success: true,
        data: result
      });
    } catch (error) {
      fastify.log.error('Error fetching participation count:', error);
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to fetch participation count',
        statusCode: 500
      });
    }
  });
}