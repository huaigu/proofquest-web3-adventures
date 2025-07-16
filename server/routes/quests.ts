import { FastifyInstance } from 'fastify';
import { database } from '../lib/database.js';
import { QuestStatusCalculator } from '../lib/questStatusCalculator.js';
import type { QuestData } from '../types/database.js';

export async function questRoutes(fastify: FastifyInstance) {
  // GET /api/quests - Get all quests with pagination and filtering
  fastify.get<{
    Querystring: {
      status?: string;
      questType?: string;
      limit?: string;
      offset?: string;
      search?: string;
    };
    Reply: {
      success: true;
      data: {
        quests: QuestData[];
        total: number;
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
  }>('/api/quests', async (request, reply) => {
    try {
      const { status, questType, limit = '20', offset = '0', search } = request.query;
      const limitNum = Math.min(parseInt(limit) || 20, 100);
      const offsetNum = parseInt(offset) || 0;

      // Get all quests from database
      let quests = await database.getQuests();

      // Apply filters
      if (status) {
        quests = quests.filter(quest => quest.status === status);
      }

      if (questType) {
        quests = quests.filter(quest => quest.questType === questType);
      }

      if (search) {
        const searchLower = search.toLowerCase();
        quests = quests.filter(quest => 
          quest.title.toLowerCase().includes(searchLower) ||
          quest.description.toLowerCase().includes(searchLower)
        );
      }

      // Update quest statuses before returning
      const updatedQuests = quests.map(quest => {
        const updatedQuest = QuestStatusCalculator.updateQuestStatus(quest);
        // Update database if status changed
        if (updatedQuest.status !== quest.status) {
          database.updateQuestStatus(quest.id, updatedQuest.status);
        }
        return updatedQuest;
      });

      // Sort by creation date (newest first)
      updatedQuests.sort((a, b) => b.createdAt - a.createdAt);

      // Apply pagination
      const total = updatedQuests.length;
      const paginatedQuests = updatedQuests.slice(offsetNum, offsetNum + limitNum);

      return reply.send({
        success: true,
        data: {
          quests: paginatedQuests,
          total,
          pagination: {
            offset: offsetNum,
            limit: limitNum,
            hasMore: offsetNum + limitNum < total
          }
        }
      });
    } catch (error) {
      fastify.log.error('Error fetching quests:', error);
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to fetch quests',
        statusCode: 500
      });
    }
  });

  // GET /api/quests/:id - Get a specific quest by ID
  fastify.get<{
    Params: { id: string };
    Reply: {
      success: true;
      data: QuestData & {
        stats: {
          status: string;
          canParticipate: boolean;
          canClaimRewards: boolean;
          progressPercentage: number;
          participationPercentage: number;
          timeUntilStart: number;
          timeUntilEnd: number;
          timeUntilClaimDeadline: number;
          remainingSpots: number;
          remainingRewards: string;
          isFull: boolean;
        };
      };
    } | {
      error: string;
      message: string;
      statusCode: number;
    };
  }>('/api/quests/:id', async (request, reply) => {
    try {
      const { id } = request.params;

      const quest = await database.getQuestById(id);

      if (!quest) {
        return reply.status(404).send({
          error: 'Not Found',
          message: 'Quest not found',
          statusCode: 404
        });
      }

      // Update quest status
      const updatedQuest = QuestStatusCalculator.updateQuestStatus(quest);
      if (updatedQuest.status !== quest.status) {
        await database.updateQuestStatus(id, updatedQuest.status);
      }

      // Generate quest statistics
      const stats = QuestStatusCalculator.generateQuestStats(updatedQuest);

      return reply.send({
        success: true,
        data: {
          ...updatedQuest,
          stats
        }
      });
    } catch (error) {
      fastify.log.error('Error fetching quest:', error);
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to fetch quest',
        statusCode: 500
      });
    }
  });

  // GET /api/quests/statistics - Get quest statistics
  fastify.get<{
    Reply: {
      success: true;
      data: {
        totalQuests: number;
        activeQuests: number;
        completedQuests: number;
        totalParticipants: number;
        totalRewardsDistributed: string;
        averageRewardPerQuest: string;
        successRate: number;
      };
    } | {
      error: string;
      message: string;
      statusCode: number;
    };
  }>('/api/quests/statistics', async (request, reply) => {
    try {
      const statistics = await database.getQuestStatistics();

      return reply.send({
        success: true,
        data: statistics
      });
    } catch (error) {
      fastify.log.error('Error fetching quest statistics:', error);
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to fetch quest statistics',
        statusCode: 500
      });
    }
  });

  // GET /api/quests/trending - Get trending quests
  fastify.get<{
    Querystring: {
      limit?: string;
    };
    Reply: {
      success: true;
      data: QuestData[];
    } | {
      error: string;
      message: string;
      statusCode: number;
    };
  }>('/api/quests/trending', async (request, reply) => {
    try {
      const { limit = '10' } = request.query;
      const limitNum = Math.min(parseInt(limit) || 10, 50);

      let quests = await database.getQuests();

      // Filter for active quests
      quests = quests.filter(quest => {
        const updatedQuest = QuestStatusCalculator.updateQuestStatus(quest);
        return updatedQuest.status === 'active';
      });

      // Sort by participation percentage (most popular first)
      quests.sort((a, b) => {
        const aPercentage = QuestStatusCalculator.getParticipationPercentage(a);
        const bPercentage = QuestStatusCalculator.getParticipationPercentage(b);
        return bPercentage - aPercentage;
      });

      // Apply limit
      const trendingQuests = quests.slice(0, limitNum);

      return reply.send({
        success: true,
        data: trendingQuests
      });
    } catch (error) {
      fastify.log.error('Error fetching trending quests:', error);
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to fetch trending quests',
        statusCode: 500
      });
    }
  });

  // GET /api/quests/status/:id - Get quest status and timing information
  fastify.get<{
    Params: { id: string };
    Reply: {
      success: true;
      data: {
        questId: string;
        status: string;
        canParticipate: boolean;
        canClaimRewards: boolean;
        progressPercentage: number;
        participationPercentage: number;
        timeUntilStart: number;
        timeUntilEnd: number;
        timeUntilClaimDeadline: number;
        remainingSpots: number;
        remainingRewards: string;
        isFull: boolean;
        timing: {
          startTime: number;
          endTime: number;
          claimEndTime: number;
          startTimeFormatted: string;
          endTimeFormatted: string;
          claimEndTimeFormatted: string;
        };
      };
    } | {
      error: string;
      message: string;
      statusCode: number;
    };
  }>('/api/quests/status/:id', async (request, reply) => {
    try {
      const { id } = request.params;

      const quest = await database.getQuestById(id);

      if (!quest) {
        return reply.status(404).send({
          error: 'Not Found',
          message: 'Quest not found',
          statusCode: 404
        });
      }

      // Update quest status
      const updatedQuest = QuestStatusCalculator.updateQuestStatus(quest);
      if (updatedQuest.status !== quest.status) {
        await database.updateQuestStatus(id, updatedQuest.status);
      }

      // Generate quest statistics
      const stats = QuestStatusCalculator.generateQuestStats(updatedQuest);

      return reply.send({
        success: true,
        data: {
          questId: id,
          ...stats,
          timing: {
            startTime: updatedQuest.startTime,
            endTime: updatedQuest.endTime,
            claimEndTime: updatedQuest.claimEndTime,
            startTimeFormatted: QuestStatusCalculator.formatTimestamp(updatedQuest.startTime),
            endTimeFormatted: QuestStatusCalculator.formatTimestamp(updatedQuest.endTime),
            claimEndTimeFormatted: QuestStatusCalculator.formatTimestamp(updatedQuest.claimEndTime)
          }
        }
      });
    } catch (error) {
      fastify.log.error('Error fetching quest status:', error);
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to fetch quest status',
        statusCode: 500
      });
    }
  });

  // POST /api/quests/validate-timing - Validate quest timing configuration
  fastify.post<{
    Body: {
      startTime: number;
      endTime: number;
      claimEndTime: number;
    };
    Reply: {
      success: true;
      data: {
        valid: boolean;
        errors: string[];
      };
    } | {
      error: string;
      message: string;
      statusCode: number;
    };
  }>('/api/quests/validate-timing', async (request, reply) => {
    try {
      const { startTime, endTime, claimEndTime } = request.body;

      const validation = QuestStatusCalculator.validateQuestTiming({
        startTime,
        endTime,
        claimEndTime
      });

      return reply.send({
        success: true,
        data: validation
      });
    } catch (error) {
      fastify.log.error('Error validating quest timing:', error);
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to validate quest timing',
        statusCode: 500
      });
    }
  });

  // GET /api/quests/count - Get total quest count
  fastify.get<{
    Reply: {
      success: true;
      data: {
        total: number;
        byStatus: Record<string, number>;
        byType: Record<string, number>;
      };
    } | {
      error: string;
      message: string;
      statusCode: number;
    };
  }>('/api/quests/count', async (request, reply) => {
    try {
      const quests = await database.getQuests();
      const total = quests.length;

      // Count by status
      const byStatus: Record<string, number> = {};
      const byType: Record<string, number> = {};

      quests.forEach(quest => {
        const updatedQuest = QuestStatusCalculator.updateQuestStatus(quest);
        byStatus[updatedQuest.status] = (byStatus[updatedQuest.status] || 0) + 1;
        byType[quest.questType] = (byType[quest.questType] || 0) + 1;
      });

      return reply.send({
        success: true,
        data: {
          total,
          byStatus,
          byType
        }
      });
    } catch (error) {
      fastify.log.error('Error fetching quest count:', error);
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'Failed to fetch quest count',
        statusCode: 500
      });
    }
  });
}