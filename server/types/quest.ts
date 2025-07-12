// Frontend form data types (camelCase) - matching CreateQuest.tsx
export interface QuestFormData {
  title: string
  description: string
  questType: 'twitter-interaction' | 'quote-tweet' | 'send-tweet'
  
  // Twitter interaction specific
  interactionType?: 'like' | 'retweet' | 'comment' | 'follow'
  targetAccount?: string
  tweetUrl?: string
  
  // Quote tweet specific
  quoteTweetUrl?: string
  quoteRequirements?: string
  
  // Send tweet specific
  contentRequirements?: string
  
  // Threshold configuration
  participantThreshold?: number
  
  // Reward configuration
  rewardType: 'ETH' | 'ERC20' | 'NFT'
  tokenAddress?: string
  tokenSymbol?: string
  totalRewardPool: number
  rewardPerParticipant: number
  distributionMethod: 'immediate' | 'linear'
  linearPeriod?: number
  unlockTime?: Date
  
  // Time configuration
  startDate: Date
  endDate: Date
  rewardClaimDeadline: Date
  
  agreeToTerms: boolean
}

// API response types
export interface QuestResponse {
  id: string
  title: string
  description: string
  questType: string
  status: string
  rewardType: string
  totalRewardPool: number
  rewardPerParticipant: number
  startDate: string
  endDate: string
  createdAt: string
  
  // Optional fields based on quest type
  interactionType?: string
  targetAccount?: string
  tweetUrl?: string
  quoteTweetUrl?: string
  quoteRequirements?: string
  contentRequirements?: string
  participantThreshold?: number
  distributionMethod?: string
  linearPeriod?: number
  unlockTime?: string
  rewardClaimDeadline?: string
}

// Error response type
export interface ErrorResponse {
  error: string
  message: string
  statusCode: number
  details?: any
}

// API success response wrapper
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: ErrorResponse
}

// Quest list response
export interface QuestsListResponse {
  quests: QuestResponse[]
  total: number
}