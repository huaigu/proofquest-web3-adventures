/**
 * Data Transformers
 * 
 * Utilities to convert between frontend and backend data formats
 */

import type {
  QuestFormData,
  QuestCreateRequest,
  QuestResponse,
  QuestListItem,
  User
} from '@/types'

/**
 * Transform camelCase to snake_case
 */
function toSnakeCase(str: string): string {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)
}

/**
 * Transform snake_case to camelCase
 */
function toCamelCase(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
}

/**
 * Transform object keys from camelCase to snake_case
 */
function transformKeysToSnakeCase(obj: any): any {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }

  if (Array.isArray(obj)) {
    return obj.map(transformKeysToSnakeCase)
  }

  const result: any = {}
  for (const [key, value] of Object.entries(obj)) {
    const snakeKey = toSnakeCase(key)
    result[snakeKey] = transformKeysToSnakeCase(value)
  }

  return result
}

/**
 * Transform object keys from snake_case to camelCase
 */
function transformKeysToCamelCase(obj: any): any {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }

  if (Array.isArray(obj)) {
    return obj.map(transformKeysToCamelCase)
  }

  const result: any = {}
  for (const [key, value] of Object.entries(obj)) {
    const camelKey = toCamelCase(key)
    result[camelKey] = transformKeysToCamelCase(value)
  }

  return result
}

/**
 * Transform QuestFormData to QuestCreateRequest (Frontend -> Backend)
 */
export function transformQuestToApiRequest(formData: QuestFormData): QuestCreateRequest {
  const baseData = {
    title: formData.title,
    description: formData.description,
    quest_type: formData.questType,
    
    // Optional interaction fields
    interaction_type: formData.interactionType,
    target_account: formData.targetAccount,
    tweet_url: formData.tweetUrl,
    quote_tweet_url: formData.quoteTweetUrl,
    tweet_content: formData.tweetContent,
    required_hashtags: formData.requiredHashtags,
    
    // Reward settings
    reward_type: formData.rewardType,
    total_reward_pool: formData.totalRewardPool,
    reward_per_participant: formData.rewardPerParticipant,
    distribution_method: formData.distributionMethod,
    
    // Timing (convert Date to ISO string)
    start_date: formData.startDate.toISOString(),
    end_date: formData.endDate.toISOString(),
    reward_claim_deadline: formData.rewardClaimDeadline.toISOString(),
    
    // Settings
    max_participants: formData.maxParticipants,
    require_whitelist: formData.requireWhitelist,
    auto_approve_submissions: formData.autoApproveSubmissions,
    agree_to_terms: formData.agreeToTerms
  }

  // Remove undefined values
  return Object.fromEntries(
    Object.entries(baseData).filter(([_, value]) => value !== undefined)
  ) as QuestCreateRequest
}

/**
 * Transform QuestResponse to QuestFormData (Backend -> Frontend)
 */
export function transformApiResponseToQuest(apiResponse: QuestResponse): QuestFormData {
  return {
    title: apiResponse.title,
    description: apiResponse.description,
    questType: apiResponse.questType,
    
    // Optional interaction fields
    interactionType: apiResponse.interactionType,
    targetAccount: apiResponse.targetAccount,
    tweetUrl: apiResponse.tweetUrl,
    quoteTweetUrl: apiResponse.quoteTweetUrl,
    tweetContent: apiResponse.tweetContent,
    requiredHashtags: apiResponse.requiredHashtags,
    
    // Reward settings
    rewardType: apiResponse.rewardType,
    totalRewardPool: apiResponse.totalRewardPool,
    rewardPerParticipant: apiResponse.rewardPerParticipant,
    distributionMethod: apiResponse.distributionMethod,
    
    // Timing (convert ISO string to Date)
    startDate: new Date(apiResponse.startDate),
    endDate: new Date(apiResponse.endDate),
    rewardClaimDeadline: new Date(apiResponse.rewardClaimDeadline),
    
    // Settings
    maxParticipants: apiResponse.maxParticipants,
    requireWhitelist: apiResponse.requireWhitelist,
    autoApproveSubmissions: apiResponse.autoApproveSubmissions,
    agreeToTerms: true // Assume true for existing quests
  }
}

/**
 * Transform QuestResponse to QuestListItem (Backend -> Frontend List View)
 */
export function transformApiResponseToListItem(apiResponse: QuestResponse): QuestListItem {
  // Calculate time remaining
  const now = new Date()
  const endDate = new Date(apiResponse.endDate)
  const timeRemaining = calculateTimeRemaining(now, endDate)
  
  // Determine category based on quest type
  const categoryMap: Record<string, string> = {
    'twitter-interaction': 'Social',
    'quote-tweet': 'Content',
    'send-tweet': 'Content'
  }
  
  return {
    id: apiResponse.id,
    title: apiResponse.title,
    creator: {
      name: apiResponse.creator.nickname || `${apiResponse.creator.address.slice(0, 6)}...${apiResponse.creator.address.slice(-4)}`,
      avatar: apiResponse.creator.avatarUrl || '',
      handle: apiResponse.creator.address
    },
    reward: {
      amount: apiResponse.rewardPerParticipant,
      type: apiResponse.rewardType
    },
    status: apiResponse.status,
    participants: apiResponse.participants,
    timeRemaining,
    questType: apiResponse.questType,
    category: categoryMap[apiResponse.questType] || 'Other',
    createdAt: new Date(apiResponse.createdAt),
    endDate: new Date(apiResponse.endDate)
  }
}

/**
 * Calculate human-readable time remaining
 */
function calculateTimeRemaining(now: Date, endDate: Date): string {
  const diffMs = endDate.getTime() - now.getTime()
  
  if (diffMs <= 0) {
    return 'Ended'
  }
  
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
  
  if (days > 0) {
    return `${days}d ${hours}h`
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`
  } else {
    return `${minutes}m`
  }
}

/**
 * Merge backend quest data with mock data
 */
export function mergeQuestData(backendQuests: QuestResponse[], mockQuests: QuestListItem[]): QuestListItem[] {
  // Transform backend quests to list items
  const transformedBackendQuests = backendQuests.map(transformApiResponseToListItem)
  
  // Add source identifier to distinguish data sources
  const markedBackendQuests = transformedBackendQuests.map(quest => ({
    ...quest,
    _source: 'backend' as const
  }))
  
  const markedMockQuests = mockQuests.map(quest => ({
    ...quest,
    _source: 'mock' as const
  }))
  
  // Combine and sort by creation date (newest first)
  const combinedQuests = [...markedBackendQuests, ...markedMockQuests]
  
  return combinedQuests.sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
}

/**
 * Generic transformer for any object
 */
export const transformers = {
  toSnakeCase: transformKeysToSnakeCase,
  toCamelCase: transformKeysToCamelCase,
  dateToISOString: (obj: any) => {
    if (obj instanceof Date) {
      return obj.toISOString()
    }
    if (typeof obj === 'object' && obj !== null) {
      const result: any = {}
      for (const [key, value] of Object.entries(obj)) {
        result[key] = transformers.dateToISOString(value)
      }
      return result
    }
    return obj
  },
  isoStringToDate: (obj: any) => {
    if (typeof obj === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(obj)) {
      return new Date(obj)
    }
    if (typeof obj === 'object' && obj !== null) {
      const result: any = {}
      for (const [key, value] of Object.entries(obj)) {
        result[key] = transformers.isoStringToDate(value)
      }
      return result
    }
    return obj
  }
}