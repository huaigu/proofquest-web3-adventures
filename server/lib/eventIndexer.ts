import { ethers } from 'ethers';
import { database } from './database.js';
import { QuestStatusCalculator } from './questStatusCalculator.js';
import type {
  QuestData,
  ParticipationData,
  QuestCreatedEventData,
  RewardClaimedEventData,
  QuestCanceledEventData,
  VestingRewardClaimedEventData,
  RemainingRewardsWithdrawnEventData
} from '../types/database.js';

// Quest contract ABI - only event signatures needed
const QUEST_CONTRACT_ABI = [
  // QuestCreated event
  "event QuestCreated(uint256 indexed questId, address indexed sponsor, string title, string description, uint256 totalRewards, uint256 rewardPerUser, uint256 startTime, uint256 endTime, string metadata)",
  
  // RewardClaimed event
  "event RewardClaimed(uint256 indexed questId, address indexed recipient, uint256 amount)",
  
  // QuestCanceled event
  "event QuestCanceled(uint256 indexed questId)",
  
  // VestingRewardClaimed event (if vesting is supported)
  "event VestingRewardClaimed(uint256 indexed questId, address indexed recipient, uint256 amount)",
  
  // RemainingRewardsWithdrawn event
  "event RemainingRewardsWithdrawn(uint256 indexed questId, address indexed sponsor, uint256 amount)"
];

export class EventIndexer {
  private provider: ethers.JsonRpcProvider;
  private contract: ethers.Contract;
  private contractAddress: string;
  private deploymentBlock: number;
  private isRunning: boolean = false;
  
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
   * Start indexing from the last processed block
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
   * Index events in a specific block range
   */
  private async indexBlockRange(fromBlock: number, toBlock: number): Promise<void> {
    const BATCH_SIZE = 1000; // Process in batches to avoid RPC limits
    
    for (let start = fromBlock; start <= toBlock; start += BATCH_SIZE) {
      const end = Math.min(start + BATCH_SIZE - 1, toBlock);
      
      console.log(`Processing blocks ${start} to ${end}`);
      
      try {
        await this.processBlockBatch(start, end);
        await database.updateLastProcessedBlock(end);
      } catch (error) {
        console.error(`Error processing blocks ${start} to ${end}:`, error);
        throw error;
      }
    }
  }
  
  /**
   * Process a batch of blocks for events
   */
  private async processBlockBatch(fromBlock: number, toBlock: number): Promise<void> {
    // Get all events in this block range
    const filter = {
      address: this.contractAddress,
      fromBlock,
      toBlock
    };
    
    const logs = await this.provider.getLogs(filter);
    
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
   * Process a single event log
   */
  private async processEvent(log: ethers.Log): Promise<void> {
    try {
      const parsedLog = this.contract.interface.parseLog({
        topics: log.topics,
        data: log.data
      });
      
      if (!parsedLog) {
        console.warn('Could not parse log:', log);
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
    const eventData: QuestCreatedEventData = {
      questId: args.questId.toString(),
      sponsor: args.sponsor,
      title: args.title,
      description: args.description,
      totalRewards: args.totalRewards.toString(),
      rewardPerUser: args.rewardPerUser.toString(),
      startTime: Number(args.startTime) * 1000, // Convert to milliseconds
      endTime: Number(args.endTime) * 1000,
      metadata: args.metadata,
      transactionHash: log.transactionHash!,
      blockNumber: log.blockNumber!
    };
    
    // Parse metadata if it's JSON
    let parsedMetadata: any = {};
    try {
      if (eventData.metadata) {
        parsedMetadata = JSON.parse(eventData.metadata);
      }
    } catch (error) {
      console.warn('Failed to parse metadata:', eventData.metadata);
    }
    
    // Calculate max participants and claim end time
    const maxParticipants = Math.floor(
      Number(eventData.totalRewards) / Number(eventData.rewardPerUser)
    );
    
    // Default claim end time to 7 days after quest end
    const claimEndTime = eventData.endTime + (7 * 24 * 60 * 60 * 1000);
    
    const questData: QuestData = {
      id: eventData.questId,
      sponsor: eventData.sponsor,
      title: eventData.title,
      description: eventData.description,
      questType: parsedMetadata.questType || 'unknown',
      totalRewards: eventData.totalRewards,
      rewardPerUser: eventData.rewardPerUser,
      maxParticipants,
      participantCount: 0,
      startTime: eventData.startTime,
      endTime: eventData.endTime,
      claimEndTime,
      status: 'pending', // Will be updated by status calculator
      isVesting: parsedMetadata.isVesting || false,
      vestingDuration: parsedMetadata.vestingDuration || 0,
      metadata: eventData.metadata,
      transactionHash: eventData.transactionHash,
      blockNumber: eventData.blockNumber,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    
    // Update status based on current time
    const updatedQuest = QuestStatusCalculator.updateQuestStatus(questData);
    
    await database.addQuest(updatedQuest);
    
    console.log(`Quest created: ${questData.id} - ${questData.title}`);
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
    lastProcessedBlock: number;
    currentBlock: number;
    contractAddress: string;
    deploymentBlock: number;
  }> {
    const currentBlock = await this.provider.getBlockNumber();
    const lastProcessedBlock = await database.getLastProcessedBlock();
    
    return {
      isRunning: this.isRunning,
      lastProcessedBlock,
      currentBlock,
      contractAddress: this.contractAddress,
      deploymentBlock: this.deploymentBlock
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
   * Stop the indexer
   */
  stop(): void {
    this.isRunning = false;
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
  updateQuestStatuses: () => getEventIndexer().updateQuestStatuses(),
  getStatus: () => getEventIndexer().getStatus(),
  stop: () => getEventIndexer().stop()
};