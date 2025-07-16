import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import {
  DatabaseSchema,
  defaultDatabase,
  QuestData,
  ParticipationData,
  UserData,
  IndexerState,
  QuestStatistics,
  UserStatistics
} from '../types/database.js';

export class DatabaseService {
  private db: Low<DatabaseSchema>;
  private dbPath: string;

  constructor(dbPath: string = './data') {
    this.dbPath = dbPath;
    
    // Ensure data directory exists
    if (!existsSync(this.dbPath)) {
      mkdirSync(this.dbPath, { recursive: true });
    }

    // Initialize database
    const adapter = new JSONFile<DatabaseSchema>(join(this.dbPath, 'database.json'));
    this.db = new Low(adapter, defaultDatabase);
  }

  async init(): Promise<void> {
    await this.db.read();
    
    // If database is empty, initialize with default data
    if (!this.db.data) {
      this.db.data = defaultDatabase;
      await this.db.write();
    }
  }

  // Quest operations
  async getQuests(): Promise<QuestData[]> {
    await this.db.read();
    return this.db.data.quests || [];
  }

  async getQuestById(id: string): Promise<QuestData | null> {
    await this.db.read();
    return this.db.data.quests.find(quest => quest.id === id) || null;
  }

  async addQuest(quest: QuestData): Promise<void> {
    await this.db.read();
    
    // Check if quest already exists
    const existingIndex = this.db.data.quests.findIndex(q => q.id === quest.id);
    
    if (existingIndex >= 0) {
      // Update existing quest
      this.db.data.quests[existingIndex] = quest;
    } else {
      // Add new quest
      this.db.data.quests.push(quest);
    }
    
    await this.db.write();
  }

  async updateQuest(id: string, updates: Partial<QuestData>): Promise<void> {
    await this.db.read();
    
    const questIndex = this.db.data.quests.findIndex(quest => quest.id === id);
    if (questIndex >= 0) {
      this.db.data.quests[questIndex] = {
        ...this.db.data.quests[questIndex],
        ...updates,
        updatedAt: Date.now()
      };
      await this.db.write();
    }
  }

  async updateQuestStatus(id: string, status: QuestData['status']): Promise<void> {
    await this.updateQuest(id, { status });
  }

  async updateQuestParticipantCount(id: string, count: number): Promise<void> {
    await this.updateQuest(id, { participantCount: count });
  }

  async cancelQuest(id: string): Promise<void> {
    await this.updateQuest(id, { status: 'canceled' });
  }

  // Participation operations
  async getParticipations(): Promise<ParticipationData[]> {
    await this.db.read();
    return this.db.data.participations || [];
  }

  async getParticipationsByQuest(questId: string): Promise<ParticipationData[]> {
    await this.db.read();
    return this.db.data.participations.filter(p => p.questId === questId);
  }

  async getParticipationsByUser(userAddress: string): Promise<ParticipationData[]> {
    await this.db.read();
    return this.db.data.participations.filter(p => p.userAddress.toLowerCase() === userAddress.toLowerCase());
  }

  async addParticipation(participation: ParticipationData): Promise<void> {
    await this.db.read();
    
    // Check if participation already exists
    const existingIndex = this.db.data.participations.findIndex(
      p => p.questId === participation.questId && p.userAddress.toLowerCase() === participation.userAddress.toLowerCase()
    );
    
    if (existingIndex >= 0) {
      // Update existing participation
      this.db.data.participations[existingIndex] = participation;
    } else {
      // Add new participation
      this.db.data.participations.push(participation);
    }
    
    await this.db.write();
  }

  async hasUserParticipated(questId: string, userAddress: string): Promise<boolean> {
    await this.db.read();
    return this.db.data.participations.some(
      p => p.questId === questId && p.userAddress.toLowerCase() === userAddress.toLowerCase()
    );
  }

  // User operations
  async getUsers(): Promise<UserData[]> {
    await this.db.read();
    return this.db.data.users || [];
  }

  async getUserByAddress(address: string): Promise<UserData | null> {
    await this.db.read();
    return this.db.data.users.find(user => user.address.toLowerCase() === address.toLowerCase()) || null;
  }

  async addUser(user: UserData): Promise<void> {
    await this.db.read();
    
    // Check if user already exists
    const existingIndex = this.db.data.users.findIndex(u => u.address.toLowerCase() === user.address.toLowerCase());
    
    if (existingIndex >= 0) {
      // Update existing user
      this.db.data.users[existingIndex] = {
        ...this.db.data.users[existingIndex],
        ...user,
        updatedAt: Date.now()
      };
    } else {
      // Add new user
      this.db.data.users.push(user);
    }
    
    await this.db.write();
  }

  async updateUser(address: string, updates: Partial<UserData>): Promise<UserData | null> {
    await this.db.read();
    
    const userIndex = this.db.data.users.findIndex(user => user.address.toLowerCase() === address.toLowerCase());
    if (userIndex >= 0) {
      this.db.data.users[userIndex] = {
        ...this.db.data.users[userIndex],
        ...updates,
        updatedAt: Date.now()
      };
      await this.db.write();
      return this.db.data.users[userIndex];
    }
    return null;
  }

  async deleteUser(address: string): Promise<boolean> {
    await this.db.read();
    
    const userIndex = this.db.data.users.findIndex(user => user.address.toLowerCase() === address.toLowerCase());
    if (userIndex >= 0) {
      this.db.data.users.splice(userIndex, 1);
      await this.db.write();
      return true;
    }
    return false;
  }

  async updateUserLastLogin(address: string): Promise<void> {
    await this.updateUser(address, { lastLoginAt: Date.now() });
  }

  // Indexer state operations
  async getIndexerState(): Promise<IndexerState> {
    await this.db.read();
    return this.db.data.indexerState;
  }

  async updateIndexerState(state: Partial<IndexerState>): Promise<void> {
    await this.db.read();
    this.db.data.indexerState = {
      ...this.db.data.indexerState,
      ...state,
      lastUpdated: Date.now()
    };
    await this.db.write();
  }

  async getLastProcessedBlock(): Promise<number> {
    const state = await this.getIndexerState();
    return state.lastProcessedBlock;
  }

  async updateLastProcessedBlock(blockNumber: number): Promise<void> {
    await this.updateIndexerState({ lastProcessedBlock: blockNumber });
  }

  // Statistics operations
  async getQuestStatistics(): Promise<QuestStatistics> {
    await this.db.read();
    
    const quests = this.db.data.quests;
    const participations = this.db.data.participations;
    
    const totalQuests = quests.length;
    const activeQuests = quests.filter(q => q.status === 'active').length;
    const completedQuests = quests.filter(q => q.status === 'ended' || q.status === 'closed').length;
    const totalParticipants = participations.length;
    
    // Calculate total rewards distributed
    const totalRewardsDistributed = participations.reduce((sum, p) => {
      return sum + BigInt(p.claimedAmount);
    }, BigInt(0));
    
    // Calculate average reward per quest
    const averageRewardPerQuest = totalQuests > 0 
      ? (totalRewardsDistributed / BigInt(totalQuests)).toString()
      : '0';
    
    // Calculate success rate (participations / total possible participations)
    const totalPossibleParticipations = quests.reduce((sum, q) => sum + q.maxParticipants, 0);
    const successRate = totalPossibleParticipations > 0 
      ? totalParticipants / totalPossibleParticipations 
      : 0;
    
    return {
      totalQuests,
      activeQuests,
      completedQuests,
      totalParticipants,
      totalRewardsDistributed: totalRewardsDistributed.toString(),
      averageRewardPerQuest,
      successRate
    };
  }

  async getUserStatistics(address: string): Promise<UserStatistics> {
    await this.db.read();
    
    const userParticipations = this.db.data.participations.filter(
      p => p.userAddress.toLowerCase() === address.toLowerCase()
    );
    
    const totalParticipations = userParticipations.length;
    
    // Calculate total rewards earned
    const totalRewardsEarned = userParticipations.reduce((sum, p) => {
      return sum + BigInt(p.claimedAmount);
    }, BigInt(0));
    
    // Calculate completion rate (assuming all participations in DB are completed)
    const completionRate = totalParticipations > 0 ? 1 : 0;
    
    // Calculate average reward per participation
    const averageRewardPerParticipation = totalParticipations > 0
      ? (totalRewardsEarned / BigInt(totalParticipations)).toString()
      : '0';
    
    return {
      address,
      totalParticipations,
      totalRewardsEarned: totalRewardsEarned.toString(),
      completionRate,
      averageRewardPerParticipation
    };
  }

  // Utility methods
  async backup(): Promise<void> {
    await this.db.read();
    const backupPath = join(this.dbPath, `backup_${Date.now()}.json`);
    const backupAdapter = new JSONFile<DatabaseSchema>(backupPath);
    const backupDb = new Low(backupAdapter, this.db.data);
    await backupDb.write();
  }

  async clearAllData(): Promise<void> {
    this.db.data = defaultDatabase;
    await this.db.write();
  }

  async getQuestCount(): Promise<number> {
    await this.db.read();
    return this.db.data.quests.length;
  }

  async getParticipationCount(): Promise<number> {
    await this.db.read();
    return this.db.data.participations.length;
  }
}

// Export singleton instance
export const database = new DatabaseService();