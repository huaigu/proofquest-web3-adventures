import type { QuestData, QuestStatus } from '../types/database.js';

export class QuestStatusCalculator {
  /**
   * Calculate quest status based on current time and quest timestamps
   */
  static calculateStatus(quest: QuestData): QuestStatus {
    const now = Date.now();
    
    // If quest is manually canceled, keep it canceled
    if (quest.status === 'canceled') {
      return 'canceled';
    }
    
    // If quest is manually set to closed, keep it closed
    if (quest.status === 'closed') {
      return 'closed';
    }
    
    // Quest hasn't started yet
    if (now < quest.startTime) {
      return 'pending';
    }
    
    // Quest is currently active
    if (now >= quest.startTime && now < quest.endTime) {
      return 'active';
    }
    
    // Quest has ended
    if (now >= quest.endTime) {
      return 'ended';
    }
    
    // Default to pending
    return 'pending';
  }
  
  /**
   * Check if quest is currently accepting participants
   */
  static canParticipate(quest: QuestData): boolean {
    const status = this.calculateStatus(quest);
    return status === 'active' && quest.participantCount < quest.maxParticipants;
  }
  
  /**
   * Check if quest rewards can be claimed
   */
  static canClaimRewards(quest: QuestData): boolean {
    const now = Date.now();
    const status = this.calculateStatus(quest);
    
    // Can claim if quest is ended and within claim period
    return status === 'ended' && now <= quest.claimEndTime;
  }
  
  /**
   * Calculate time remaining until quest starts (in seconds)
   */
  static getTimeUntilStart(quest: QuestData): number {
    const now = Date.now();
    if (now >= quest.startTime) {
      return 0;
    }
    return Math.floor((quest.startTime - now) / 1000);
  }
  
  /**
   * Calculate time remaining until quest ends (in seconds)
   */
  static getTimeUntilEnd(quest: QuestData): number {
    const now = Date.now();
    if (now >= quest.endTime) {
      return 0;
    }
    return Math.floor((quest.endTime - now) / 1000);
  }
  
  /**
   * Calculate time remaining until claim deadline (in seconds)
   */
  static getTimeUntilClaimDeadline(quest: QuestData): number {
    const now = Date.now();
    if (now >= quest.claimEndTime) {
      return 0;
    }
    return Math.floor((quest.claimEndTime - now) / 1000);
  }
  
  /**
   * Calculate quest progress percentage (0-100)
   */
  static getProgressPercentage(quest: QuestData): number {
    const now = Date.now();
    
    // If quest hasn't started, progress is 0
    if (now < quest.startTime) {
      return 0;
    }
    
    // If quest has ended, progress is 100
    if (now >= quest.endTime) {
      return 100;
    }
    
    // Calculate progress within the quest duration
    const totalDuration = quest.endTime - quest.startTime;
    const elapsed = now - quest.startTime;
    
    return Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
  }
  
  /**
   * Calculate participation percentage (0-100)
   */
  static getParticipationPercentage(quest: QuestData): number {
    if (quest.maxParticipants === 0) {
      return 0;
    }
    return Math.min(100, (quest.participantCount / quest.maxParticipants) * 100);
  }
  
  /**
   * Check if quest is full (reached max participants)
   */
  static isFull(quest: QuestData): boolean {
    return quest.participantCount >= quest.maxParticipants;
  }
  
  /**
   * Calculate remaining spots in quest
   */
  static getRemainingSpots(quest: QuestData): number {
    return Math.max(0, quest.maxParticipants - quest.participantCount);
  }
  
  /**
   * Calculate total rewards remaining to be distributed
   */
  static getRemainingRewards(quest: QuestData): string {
    const remaining = quest.maxParticipants - quest.participantCount;
    const remainingRewards = BigInt(quest.rewardPerUser) * BigInt(remaining);
    return remainingRewards.toString();
  }
  
  /**
   * Generate quest statistics summary
   */
  static generateQuestStats(quest: QuestData): {
    status: QuestStatus;
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
  } {
    return {
      status: this.calculateStatus(quest),
      canParticipate: this.canParticipate(quest),
      canClaimRewards: this.canClaimRewards(quest),
      progressPercentage: this.getProgressPercentage(quest),
      participationPercentage: this.getParticipationPercentage(quest),
      timeUntilStart: this.getTimeUntilStart(quest),
      timeUntilEnd: this.getTimeUntilEnd(quest),
      timeUntilClaimDeadline: this.getTimeUntilClaimDeadline(quest),
      remainingSpots: this.getRemainingSpots(quest),
      remainingRewards: this.getRemainingRewards(quest),
      isFull: this.isFull(quest)
    };
  }
  
  /**
   * Update quest status if needed
   */
  static updateQuestStatus(quest: QuestData): QuestData {
    const newStatus = this.calculateStatus(quest);
    
    if (newStatus !== quest.status) {
      return {
        ...quest,
        status: newStatus,
        updatedAt: Date.now()
      };
    }
    
    return quest;
  }
  
  /**
   * Format timestamp for display
   */
  static formatTimestamp(timestamp: number): string {
    return new Date(timestamp).toISOString();
  }
  
  /**
   * Format duration in seconds to human readable format
   */
  static formatDuration(seconds: number): string {
    if (seconds <= 0) {
      return '0 seconds';
    }
    
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (remainingSeconds > 0) parts.push(`${remainingSeconds}s`);
    
    return parts.join(' ');
  }
  
  /**
   * Validate quest timing configuration
   */
  static validateQuestTiming(quest: Partial<QuestData>): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    
    if (!quest.startTime || !quest.endTime || !quest.claimEndTime) {
      errors.push('Start time, end time, and claim end time are required');
      return { valid: false, errors };
    }
    
    const now = Date.now();
    
    // Check if start time is in the future (for new quests)
    if (quest.startTime <= now) {
      errors.push('Start time must be in the future');
    }
    
    // Check if end time is after start time
    if (quest.endTime <= quest.startTime) {
      errors.push('End time must be after start time');
    }
    
    // Check if claim end time is after end time
    if (quest.claimEndTime <= quest.endTime) {
      errors.push('Claim end time must be after end time');
    }
    
    // Check minimum quest duration (1 hour)
    const minDuration = 60 * 60 * 1000; // 1 hour in milliseconds
    if (quest.endTime - quest.startTime < minDuration) {
      errors.push('Quest duration must be at least 1 hour');
    }
    
    // Check maximum quest duration (30 days)
    const maxDuration = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds
    if (quest.endTime - quest.startTime > maxDuration) {
      errors.push('Quest duration cannot exceed 30 days');
    }
    
    // Check claim period (should be at least 1 day)
    const minClaimPeriod = 24 * 60 * 60 * 1000; // 1 day in milliseconds
    if (quest.claimEndTime - quest.endTime < minClaimPeriod) {
      errors.push('Claim period must be at least 1 day');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
}