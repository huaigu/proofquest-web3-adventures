/**
 * Quest Types
 * 
 * Shared types for quest management between frontend and backend
 */

// Quest Types
export type QuestType = 'twitter-interaction' | 'quote-tweet' | 'send-tweet'
export type InteractionType = 'like' | 'retweet' | 'comment' | 'follow'
export type RewardType = 'ETH' | 'ERC20' | 'NFT'
export type DistributionMethod = 'immediate' | 'manual' | 'scheduled' | 'linear'
export type QuestStatus = 'draft' | 'active' | 'paused' | 'completed' | 'cancelled'
export type ParticipationStatus = 'pending' | 'completed' | 'verified' | 'rewarded' | 'rejected'

// Quest Creation Form Data (Frontend)
export interface QuestFormData {
  title: string
  description: string
  launch_page: string // Complete URL link to the tweet
  questType: QuestType
  
  // Twitter interaction specific
  interactionType?: InteractionType
  targetAccount?: string
  tweetUrl?: string
  
  // Quote tweet specific
  quoteTweetUrl?: string
  quoteRequirements?: string
  
  // Send tweet specific
  tweetContent?: string
  requiredHashtags?: string[]
  
  // Smart contract integration
  requiredActions?: string[]
  
  // Reward settings
  rewardType: RewardType
  totalRewardPool: number
  rewardPerParticipant: number
  distributionMethod: DistributionMethod
  
  // Linear vesting specific
  linearPeriod?: number
  unlockTime?: Date
  
  // Timing
  startDate: Date
  endDate: Date
  rewardClaimDeadline: Date
  
  // Settings
  maxParticipants?: number
  requireWhitelist: boolean
  autoApproveSubmissions: boolean
  agreeToTerms: boolean
}

// Quest API Request (Backend format)
export interface QuestCreateRequest {
  title: string
  description: string
  launch_page: string // Complete URL link to the tweet
  quest_type: QuestType
  
  // Twitter interaction specific
  interaction_type?: InteractionType
  target_account?: string
  tweet_url?: string
  
  // Quote tweet specific
  quote_tweet_url?: string
  
  // Send tweet specific
  tweet_content?: string
  required_hashtags?: string[]
  
  // Required actions for smart contract
  required_actions?: string[]
  
  // Reward settings
  reward_type: RewardType
  total_reward_pool: number
  reward_per_participant: number
  distribution_method: DistributionMethod
  
  // Linear vesting specific
  linear_period?: number
  
  // Timing (ISO strings)
  start_date: string
  end_date: string
  reward_claim_deadline: string
  
  // Settings
  max_participants?: number
  require_whitelist: boolean
  auto_approve_submissions: boolean
  agree_to_terms: boolean
}

// Quest Response (API format)
export interface QuestResponse {
  id: string
  title: string
  description: string
  launch_page: string // Complete URL link to the tweet
  questType: QuestType
  
  // Creator info
  creator: {
    address: string
    nickname?: string
    avatarUrl?: string
  }
  
  // Twitter interaction specific
  interactionType?: InteractionType
  targetAccount?: string
  tweetUrl?: string
  
  // Quote tweet specific
  quoteTweetUrl?: string
  
  // Send tweet specific
  tweetContent?: string
  requiredHashtags?: string[]
  
  // Reward settings
  rewardType: RewardType
  totalRewardPool: number
  rewardPerParticipant: number
  distributionMethod: DistributionMethod
  
  // Timing
  startDate: string // ISO string
  endDate: string   // ISO string
  rewardClaimDeadline: string // ISO string
  
  // Settings
  maxParticipants?: number
  requireWhitelist: boolean
  autoApproveSubmissions: boolean
  
  // Status
  status: QuestStatus
  
  // Participation
  participants: {
    current: number
    max?: number
  }
  
  // Metadata
  createdAt: string
  updatedAt: string
}

// Quest List Item (simplified for list views)
export interface QuestListItem {
  id: string
  title: string
  creator: {
    name: string
    avatar: string
    handle: string
  }
  reward: {
    amount: number
    type: RewardType
  }
  status: QuestStatus
  participants: {
    current: number
    max?: number
  }
  timeRemaining: string
  questType: QuestType
  category: string
  createdAt: Date
  endDate: Date
}

// Quest Detail (full quest information)
export interface QuestDetail extends QuestResponse {
  participantsList?: QuestParticipant[]
  userParticipation?: QuestParticipation
}

// Quest Participation
export interface QuestParticipation {
  id: string
  questId: string
  userAddress: string
  status: ParticipationStatus
  submissionData?: any
  proofUrl?: string
  rewardAmount?: number
  createdAt: string
  updatedAt: string
}

export interface QuestParticipant {
  address: string
  nickname?: string
  avatarUrl?: string
  status: ParticipationStatus
  submissionData?: any
  joinedAt: string
  completedAt?: string
}

// Quest Filters (for list view)
export interface QuestFilters {
  status?: QuestStatus[]
  questType?: QuestType[]
  rewardType?: RewardType[]
  category?: string[]
  rewardRange?: [number, number]
  search?: string
  creator?: string
}

// Quest Creation Draft (for auto-save)
export interface QuestDraft {
  id: string
  formData: Partial<QuestFormData>
  step: number
  createdAt: Date
  updatedAt: Date
}