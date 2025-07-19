import { ethers } from 'ethers';
import { database } from './database.js';
import { QuestStatusCalculator } from './questStatusCalculator.js';
import type {
  QuestData,
  QuestStatus,
  ParticipationData,
  RewardClaimedEventData,
  QuestCanceledEventData,
  VestingRewardClaimedEventData,
  RemainingRewardsWithdrawnEventData
} from '../types/database.js';

// Quest contract ABI - events and view functions needed
const QUEST_CONTRACT_ABI = [
  // QuestCreated event
  "event QuestCreated(uint256 indexed questId, address indexed sponsor, uint256 totalRewards, string title, string description)",

  // RewardClaimed event
  "event RewardClaimed(uint256 indexed questId, address indexed recipient, uint256 amount)",

  // QuestCanceled event
  "event QuestCanceled(uint256 indexed questId)",

  // VestingRewardClaimed event (if vesting is supported)
  "event VestingRewardClaimed(uint256 indexed questId, address indexed recipient, uint256 amount)",

  // RemainingRewardsWithdrawn event
  "event RemainingRewardsWithdrawn(uint256 indexed questId, address indexed sponsor, uint256 amount)",

  // View functions for fetching quest data
  "function getQuest(uint256 _questId) external view returns (tuple(uint256 id, address sponsor, string title, string description, string launch_page, uint8 questType, uint8 status, tuple(string apiUrlPattern, string apiEndpointHash, uint256 proofValidityPeriod, string targetLikeRetweetId, string favoritedJsonPath, string retweetedJsonPath, bool requireFavorite, bool requireRetweet, string targetQuotedTweetId, string quotedStatusIdJsonPath, string userIdJsonPath, string quoteTweetIdJsonPath) verificationParams, uint256 totalRewards, uint256 rewardPerUser, uint256 maxParticipants, uint256 participantCount, uint256 startTime, uint256 endTime, uint256 claimEndTime, bool isVesting, uint256 vestingDuration) quest)"
];

export class EventIndexer {
  private provider: ethers.JsonRpcProvider;
  private contract: ethers.Contract;
  private contractAddress: string;
  private deploymentBlock: number;
  private isRunning: boolean = false;
  private isPolling: boolean = false;
  private pollingInterval: NodeJS.Timeout | null = null;
  private readonly POLLING_INTERVAL_MS = 5000; // 5 seconds
  private readonly MAX_RETRIES = 5;
  private readonly RETRY_BASE_DELAY = 1000; // 1 second base delay
  private readonly RETRY_MAX_DELAY = 30000; // 30 seconds max delay

  constructor(
    rpcUrl: string,
    contractAddress: string,
    deploymentBlock: number = 0
  ) {
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    this.contractAddress = contractAddress;
    this.deploymentBlock = deploymentBlock;
    this.contract = new ethers.Contract(contractAddress, QUEST_CONTRACT_ABI, this.provider);
  }

  /**
   * Initialize the indexer with contract information
   */
  async initialize(): Promise<void> {
    try {
      // Initialize database
      await database.init();

      // Update indexer state with contract info
      await database.updateIndexerState({
        contractAddress: this.contractAddress,
        contractDeployBlock: this.deploymentBlock
      });

      console.log(`Event indexer initialized for contract: ${this.contractAddress}`);
    } catch (error) {
      console.error('Failed to initialize event indexer:', error);
      throw error;
    }
  }

  /**
   * Start indexing from the last processed block (one-time)
   */
  async startIndexing(): Promise<void> {
    if (this.isRunning) {
      console.log('Event indexer is already running');
      return;
    }

    this.isRunning = true;

    try {
      const lastProcessedBlock = await database.getLastProcessedBlock();
      const startBlock = lastProcessedBlock > 0 ? lastProcessedBlock + 1 : this.deploymentBlock;
      const currentBlock = await this.provider.getBlockNumber();

      console.log(`Starting event indexing from block ${startBlock} to ${currentBlock}`);

      if (startBlock <= currentBlock) {
        await this.indexBlockRange(startBlock, currentBlock);
      }

      console.log('Event indexing completed');
    } catch (error) {
      console.error('Error during event indexing:', error);
      throw error;
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Start continuous polling for new events
   */
  startPolling(): void {
    if (this.isPolling) {
      console.log('Event indexer is already polling');
      return;
    }

    this.isPolling = true;
    console.log(`Starting event indexer polling every ${this.POLLING_INTERVAL_MS}ms`);

    // Start the polling loop
    this.pollingInterval = setInterval(async () => {
      try {
        await this.pollForNewEvents();
      } catch (error) {
        console.error('Error during polling:', error);
      }
    }, this.POLLING_INTERVAL_MS);
  }

  /**
   * Stop continuous polling
   */
  stopPolling(): void {
    if (!this.isPolling) {
      console.log('Event indexer is not polling');
      return;
    }

    this.isPolling = false;
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
    console.log('Event indexer polling stopped');
  }

  /**
   * Poll for new events since last processed block
   */
  private async pollForNewEvents(): Promise<void> {
    if (this.isRunning) {
      // Skip this poll if already indexing
      return;
    }

    this.isRunning = true;

    try {
      const lastProcessedBlock = await database.getLastProcessedBlock();
      const currentBlock = await this.provider.getBlockNumber();
      const startBlock = lastProcessedBlock > 0 ? lastProcessedBlock + 1 : this.deploymentBlock;

      if (startBlock <= currentBlock) {
        console.log(`Polling for events from block ${startBlock} to ${currentBlock}`);
        await this.indexBlockRange(startBlock, currentBlock);

        // Update quest statuses after processing new events
        await this.updateQuestStatuses();
      }
    } catch (error) {
      console.error('Error during event polling:', error);
      // Continue polling despite errors
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Index events in a specific block range
   */
  private async indexBlockRange(fromBlock: number, toBlock: number): Promise<void> {
    const BATCH_SIZE = 100; // Process in batches to avoid RPC limits

    for (let start = fromBlock; start <= toBlock; start += BATCH_SIZE) {
      const end = Math.min(start + BATCH_SIZE - 1, toBlock);

      console.log(`Processing blocks ${start} to ${end}`);

      await this.processBlockBatchWithRetry(start, end);
      await database.updateLastProcessedBlock(end);
    }
  }

  /**
   * Process a batch of blocks with retry logic
   */
  private async processBlockBatchWithRetry(fromBlock: number, toBlock: number): Promise<void> {
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= this.MAX_RETRIES; attempt++) {
      try {
        await this.processBlockBatch(fromBlock, toBlock);
        return; // Success, exit retry loop
      } catch (error) {
        lastError = error as Error;
        console.error(`Error processing blocks ${fromBlock} to ${toBlock} (attempt ${attempt}/${this.MAX_RETRIES}):`, error);
        
        if (attempt === this.MAX_RETRIES) {
          console.error(`Failed to process blocks ${fromBlock} to ${toBlock} after ${this.MAX_RETRIES} attempts. Skipping this batch.`);
          // Don't throw, just log and continue with next batch
          return;
        }
        
        // Calculate exponential backoff delay
        const delay = Math.min(
          this.RETRY_BASE_DELAY * Math.pow(2, attempt - 1),
          this.RETRY_MAX_DELAY
        );
        
        console.log(`Retrying in ${delay}ms...`);
        await this.sleep(delay);
      }
    }
  }

  /**
   * Process a batch of blocks for events
   */
  private async processBlockBatch(fromBlock: number, toBlock: number): Promise<void> {
    // Get all events in this block range with retry logic
    const filter = {
      address: this.contractAddress,
      fromBlock,
      toBlock
    };

    const logs = await this.getLogsWithRetry(filter);

    for (const log of logs) {
      try {
        await this.processEvent(log);
      } catch (error) {
        console.error('Error processing event:', error, log);
        // Continue processing other events even if one fails
      }
    }
  }

  /**
   * Get logs with retry logic and exponential backoff
   */
  private async getLogsWithRetry(filter: {
    address: string;
    fromBlock: number;
    toBlock: number;
  }): Promise<ethers.Log[]> {
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= this.MAX_RETRIES; attempt++) {
      try {
        const logs = await this.provider.getLogs(filter);
        return logs;
      } catch (error) {
        lastError = error as Error;
        console.error(`Error getting logs for blocks ${filter.fromBlock} to ${filter.toBlock} (attempt ${attempt}/${this.MAX_RETRIES}):`, error);
        
        if (attempt === this.MAX_RETRIES) {
          throw lastError;
        }
        
        // Calculate exponential backoff delay
        const delay = Math.min(
          this.RETRY_BASE_DELAY * Math.pow(2, attempt - 1),
          this.RETRY_MAX_DELAY
        );
        
        console.log(`Retrying getLogs in ${delay}ms...`);
        await this.sleep(delay);
      }
    }
    
    throw lastError;
  }

  /**
   * Sleep utility for retry delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Process a single event log
   */
  private async processEvent(log: ethers.Log): Promise<void> {
    try {
      const parsedLog = this.contract.interface.parseLog({
        topics: log.topics,
        data: log.data
      });

      if (!parsedLog) {
        console.warn('Could not parse log:', log.transactionHash);
        return;
      }

      const eventName = parsedLog.name;
      const args = parsedLog.args;

      console.log(`Processing ${eventName} event in block ${log.blockNumber}`);

      switch (eventName) {
        case 'QuestCreated':
          await this.handleQuestCreated(args, log);
          break;
        case 'RewardClaimed':
          await this.handleRewardClaimed(args, log);
          break;
        case 'QuestCanceled':
          await this.handleQuestCanceled(args, log);
          break;
        case 'VestingRewardClaimed':
          await this.handleVestingRewardClaimed(args, log);
          break;
        case 'RemainingRewardsWithdrawn':
          await this.handleRemainingRewardsWithdrawn(args, log);
          break;
        default:
          console.log(`Unknown event: ${eventName}`);
      }
    } catch (error) {
      console.error('Error processing event:', error);
      throw error;
    }
  }

  /**
   * Handle QuestCreated event
   */
  private async handleQuestCreated(args: ethers.Result, log: ethers.Log): Promise<void> {
    const questId = args.questId.toString();

    try {
      // Get real quest data from smart contract
      const questData = await this.contract.getQuest(questId);
      console.log(questData)

      // Map quest type enum to string
      const getQuestTypeString = (questType: bigint | number): string => {
        const typeNum = Number(questType);
        switch (typeNum) {
          case 0: return 'likeAndRetweet';
          case 1: return 'quote-tweet';
          default: return 'likeAndRetweet';
        }
      };

      // Map status enum to string
      const getStatusString = (status: number): QuestStatus => {
        switch (status) {
          case 0: return 'pending';
          case 1: return 'active';
          case 2: return 'ended';
          case 3: return 'closed';
          case 4: return 'canceled';
          default: return 'pending';
        }
      };

      // Convert timestamps from seconds to milliseconds
      const startTime = Number(questData.startTime) * 1000;
      const endTime = Number(questData.endTime) * 1000;
      const claimEndTime = Number(questData.claimEndTime) * 1000;

      const questDataForDB: QuestData = {
        id: questId,
        sponsor: questData.sponsor,
        title: questData.title,
        description: questData.description,
        launch_page: questData.launch_page,
        questType: getQuestTypeString(questData.questType),
        totalRewards: questData.totalRewards.toString(),
        rewardPerUser: questData.rewardPerUser.toString(),
        maxParticipants: Number(questData.maxParticipants),
        participantCount: Number(questData.participantCount),
        startTime,
        endTime,
        claimEndTime,
        status: getStatusString(questData.status),
        isVesting: questData.isVesting,
        vestingDuration: Number(questData.vestingDuration),
        metadata: {
          apiUrlPattern: questData.verificationParams.apiUrlPattern,
          apiEndpointHash: questData.verificationParams.apiEndpointHash,
          proofValidityPeriod: Number(questData.verificationParams.proofValidityPeriod),
          targetLikeRetweetId: questData.verificationParams.targetLikeRetweetId,
          favoritedJsonPath: questData.verificationParams.favoritedJsonPath,
          retweetedJsonPath: questData.verificationParams.retweetedJsonPath,
          requireFavorite: questData.verificationParams.requireFavorite,
          requireRetweet: questData.verificationParams.requireRetweet,
          targetQuotedTweetId: questData.verificationParams.targetQuotedTweetId,
          quotedStatusIdJsonPath: questData.verificationParams.quotedStatusIdJsonPath,
          userIdJsonPath: questData.verificationParams.userIdJsonPath,
          quoteTweetIdJsonPath: questData.verificationParams.quoteTweetIdJsonPath,
        }, // Store verification params as metadata
        transactionHash: log.transactionHash!,
        blockNumber: log.blockNumber!,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      // Update status based on current time
      const updatedQuest = QuestStatusCalculator.updateQuestStatus(questDataForDB);

      await database.addQuest(updatedQuest);

      console.log(`Quest created: ${questDataForDB.id} - ${questDataForDB.title} (${questDataForDB.totalRewards} total rewards)`);
      console.log(`Real data: maxParticipants=${questDataForDB.maxParticipants}, rewardPerUser=${questDataForDB.rewardPerUser}, startTime=${new Date(startTime).toISOString()}, endTime=${new Date(endTime).toISOString()}`);

    } catch (error) {
      console.error(`Failed to get quest data from contract for quest ${questId}:`, error);

      // Fallback to event data only if contract call fails
      const fallbackQuestData: QuestData = {
        id: questId,
        sponsor: args.sponsor,
        title: args.title || `Quest #${questId}`,
        description: args.description || 'Quest created on-chain',
        launch_page: '', // Default empty launch_page
        questType: 'likeAndRetweet', // Default quest type
        totalRewards: args.totalRewards.toString(),
        rewardPerUser: '0', // Will need to be calculated or set elsewhere
        maxParticipants: 100, // Default max participants
        participantCount: 0,
        startTime: Date.now(), // Default to current time since not in event
        endTime: Date.now() + (7 * 24 * 60 * 60 * 1000), // Default 7 days from now
        claimEndTime: Date.now() + (14 * 24 * 60 * 60 * 1000), // Default 14 days from now
        status: 'pending',
        isVesting: false,
        vestingDuration: 0,
        metadata: '',
        transactionHash: log.transactionHash!,
        blockNumber: log.blockNumber!,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      const updatedQuest = QuestStatusCalculator.updateQuestStatus(fallbackQuestData);
      await database.addQuest(updatedQuest);

      console.log(`Quest created (fallback): ${fallbackQuestData.id} - ${fallbackQuestData.title} (fallback data used)`);
    }
  }

  /**
   * Handle RewardClaimed event
   */
  private async handleRewardClaimed(args: ethers.Result, log: ethers.Log): Promise<void> {
    const eventData: RewardClaimedEventData = {
      questId: args.questId.toString(),
      recipient: args.recipient,
      amount: args.amount.toString(),
      transactionHash: log.transactionHash!,
      blockNumber: log.blockNumber!
    };

    // Create participation record
    const participationData: ParticipationData = {
      id: `${eventData.questId}-${eventData.recipient}`,
      questId: eventData.questId,
      userAddress: eventData.recipient,
      claimedAmount: eventData.amount,
      claimedAt: Date.now(),
      transactionHash: eventData.transactionHash,
      blockNumber: eventData.blockNumber,
      createdAt: Date.now()
    };

    await database.addParticipation(participationData);

    // Update quest participant count
    const quest = await database.getQuestById(eventData.questId);
    if (quest) {
      const newParticipantCount = quest.participantCount + 1;
      await database.updateQuestParticipantCount(eventData.questId, newParticipantCount);

      // Update quest status if needed
      const updatedQuest = QuestStatusCalculator.updateQuestStatus({
        ...quest,
        participantCount: newParticipantCount
      });

      if (updatedQuest.status !== quest.status) {
        await database.updateQuestStatus(eventData.questId, updatedQuest.status);
      }
    }

    console.log(`Reward claimed: ${eventData.questId} by ${eventData.recipient}`);
  }

  /**
   * Handle QuestCanceled event
   */
  private async handleQuestCanceled(args: ethers.Result, log: ethers.Log): Promise<void> {
    const eventData: QuestCanceledEventData = {
      questId: args.questId.toString(),
      transactionHash: log.transactionHash!,
      blockNumber: log.blockNumber!
    };

    await database.updateQuestStatus(eventData.questId, 'canceled');

    console.log(`Quest canceled: ${eventData.questId}`);
  }

  /**
   * Handle VestingRewardClaimed event
   */
  private async handleVestingRewardClaimed(args: ethers.Result, log: ethers.Log): Promise<void> {
    const eventData: VestingRewardClaimedEventData = {
      questId: args.questId.toString(),
      recipient: args.recipient,
      amount: args.amount.toString(),
      transactionHash: log.transactionHash!,
      blockNumber: log.blockNumber!
    };

    // Update existing participation record or create new one
    const participationData: ParticipationData = {
      id: `${eventData.questId}-${eventData.recipient}`,
      questId: eventData.questId,
      userAddress: eventData.recipient,
      claimedAmount: eventData.amount,
      claimedAt: Date.now(),
      transactionHash: eventData.transactionHash,
      blockNumber: eventData.blockNumber,
      createdAt: Date.now()
    };

    await database.addParticipation(participationData);

    console.log(`Vesting reward claimed: ${eventData.questId} by ${eventData.recipient}`);
  }

  /**
   * Handle RemainingRewardsWithdrawn event
   */
  private async handleRemainingRewardsWithdrawn(args: ethers.Result, log: ethers.Log): Promise<void> {
    const eventData: RemainingRewardsWithdrawnEventData = {
      questId: args.questId.toString(),
      sponsor: args.sponsor,
      amount: args.amount.toString(),
      transactionHash: log.transactionHash!,
      blockNumber: log.blockNumber!
    };

    // Update quest status to closed when remaining rewards are withdrawn
    await database.updateQuestStatus(eventData.questId, 'closed');

    console.log(`Remaining rewards withdrawn: ${eventData.questId} by ${eventData.sponsor}`);
  }

  /**
   * Get current indexer status
   */
  async getStatus(): Promise<{
    isRunning: boolean;
    isPolling: boolean;
    lastProcessedBlock: number;
    currentBlock: number;
    contractAddress: string;
    deploymentBlock: number;
    pollingIntervalMs: number;
  }> {
    const currentBlock = await this.provider.getBlockNumber();
    const lastProcessedBlock = await database.getLastProcessedBlock();

    return {
      isRunning: this.isRunning,
      isPolling: this.isPolling,
      lastProcessedBlock,
      currentBlock,
      contractAddress: this.contractAddress,
      deploymentBlock: this.deploymentBlock,
      pollingIntervalMs: this.POLLING_INTERVAL_MS
    };
  }

  /**
   * Force reindex from a specific block
   */
  async reindexFromBlock(fromBlock: number): Promise<void> {
    if (this.isRunning) {
      throw new Error('Cannot reindex while indexer is running');
    }

    console.log(`Reindexing from block ${fromBlock}`);

    // Update last processed block
    await database.updateLastProcessedBlock(fromBlock - 1);

    // Start indexing
    await this.startIndexing();
  }

  /**
   * Update quest statuses based on current time
   */
  async updateQuestStatuses(): Promise<void> {
    const quests = await database.getQuests();

    for (const quest of quests) {
      const updatedQuest = QuestStatusCalculator.updateQuestStatus(quest);

      if (updatedQuest.status !== quest.status) {
        await database.updateQuestStatus(quest.id, updatedQuest.status);
        console.log(`Updated quest ${quest.id} status: ${quest.status} -> ${updatedQuest.status}`);
      }
    }
  }

  /**
   * Stop the indexer and polling
   */
  stop(): void {
    this.isRunning = false;
    this.stopPolling();
    console.log('Event indexer stopped');
  }
}

// Create singleton instance only if contract address is configured
let _eventIndexer: EventIndexer | null = null;

export function getEventIndexer(): EventIndexer {
  if (!_eventIndexer) {
    const contractAddress = process.env.QUEST_CONTRACT_ADDRESS;
    if (!contractAddress || contractAddress.trim() === '') {
      throw new Error('Event indexer requires QUEST_CONTRACT_ADDRESS environment variable');
    }

    _eventIndexer = new EventIndexer(
      process.env.MONAD_RPC_URL || 'https://testnet1.monad.xyz',
      contractAddress,
      parseInt(process.env.QUEST_CONTRACT_DEPLOY_BLOCK || '0')
    );
  }
  return _eventIndexer;
}

// Export singleton instance for backward compatibility
export const eventIndexer = {
  initialize: () => getEventIndexer().initialize(),
  startIndexing: () => getEventIndexer().startIndexing(),
  startPolling: () => getEventIndexer().startPolling(),
  stopPolling: () => getEventIndexer().stopPolling(),
  updateQuestStatuses: () => getEventIndexer().updateQuestStatuses(),
  getStatus: () => getEventIndexer().getStatus(),
  stop: () => getEventIndexer().stop()
};