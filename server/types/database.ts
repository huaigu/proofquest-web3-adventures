// Database schema types for the JSON file-based database

export type QuestStatus = 'pending' | 'active' | 'ended' | 'closed' | 'canceled';

export interface QuestData {
  id: string;                    // Quest ID from contract
  sponsor: string;               // Sponsor address
  title: string;                 // Quest title
  description: string;           // Quest description
  questType: string;             // Quest type (from metadata)
  totalRewards: string;          // Total rewards in wei
  rewardPerUser: string;         // Reward per user in wei
  maxParticipants: number;       // Maximum number of participants
  participantCount: number;      // Current participant count
  startTime: number;             // Quest start time (Unix timestamp)
  endTime: number;               // Quest end time (Unix timestamp)
  claimEndTime: number;          // Claim end time (Unix timestamp)
  status: QuestStatus;           // Current quest status
  isVesting: boolean;            // Whether this quest uses vesting
  vestingDuration: number;       // Vesting duration in seconds
  metadata: string;              // JSON metadata from contract
  transactionHash: string;       // Transaction hash of creation
  blockNumber: number;           // Block number of creation
  createdAt: number;             // Creation timestamp
  updatedAt: number;             // Last update timestamp
}

export interface ParticipationData {
  id: string;                    // Unique participation ID
  questId: string;               // Quest ID
  userAddress: string;           // User address
  claimedAmount: string;         // Amount claimed in wei
  claimedAt: number;             // Claim timestamp
  transactionHash: string;       // Transaction hash of claim
  blockNumber: number;           // Block number of claim
  createdAt: number;             // Record creation timestamp
}

export interface IndexerState {
  lastProcessedBlock: number;    // Last processed block number
  lastUpdated: number;           // Last update timestamp
  contractAddress: string;       // Contract address being indexed
  contractDeployBlock: number;   // Contract deployment block
}

export interface QuestStatistics {
  totalQuests: number;           // Total number of quests
  activeQuests: number;          // Number of active quests
  completedQuests: number;       // Number of completed quests
  totalParticipants: number;     // Total number of participants
  totalRewardsDistributed: string; // Total rewards distributed in wei
  averageRewardPerQuest: string; // Average reward per quest in wei
  successRate: number;           // Success rate (0-1)
}

export interface UserData {
  address: string;               // User address (primary key)
  nickname?: string;             // User nickname
  avatarUrl?: string;            // Avatar URL
  bio?: string;                  // User bio
  createdAt: number;             // Creation timestamp
  updatedAt: number;             // Last update timestamp
  lastLoginAt?: number;          // Last login timestamp
}

export interface UserStatistics {
  address: string;               // User address
  totalParticipations: number;   // Total participations
  totalRewardsEarned: string;    // Total rewards earned in wei
  completionRate: number;        // Completion rate (0-1)
  averageRewardPerParticipation: string; // Average reward per participation
}

export interface DatabaseSchema {
  quests: QuestData[];
  participations: ParticipationData[];
  users: UserData[];
  indexerState: IndexerState;
}

// Default database structure
export const defaultDatabase: DatabaseSchema = {
  quests: [],
  participations: [],
  users: [],
  indexerState: {
    lastProcessedBlock: 0,
    lastUpdated: 0,
    contractAddress: '',
    contractDeployBlock: 0
  }
};

// Event data interfaces for processing blockchain events
export interface QuestCreatedEventData {
  questId: string;
  sponsor: string;
  title: string;
  description: string;
  totalRewards: string;
  rewardPerUser: string;
  startTime: number;
  endTime: number;
  metadata: string;
  transactionHash: string;
  blockNumber: number;
}

export interface RewardClaimedEventData {
  questId: string;
  recipient: string;
  amount: string;
  transactionHash: string;
  blockNumber: number;
}

export interface QuestCanceledEventData {
  questId: string;
  transactionHash: string;
  blockNumber: number;
}

export interface VestingRewardClaimedEventData {
  questId: string;
  recipient: string;
  amount: string;
  transactionHash: string;
  blockNumber: number;
}

export interface RemainingRewardsWithdrawnEventData {
  questId: string;
  sponsor: string;
  amount: string;
  transactionHash: string;
  blockNumber: number;
}