import { z } from 'zod'

// Quest validation schema - matches the frontend CreateQuest.tsx schema
export const questSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title too long"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  questType: z.enum(["twitter-interaction", "quote-tweet", "send-tweet"]),
  
  // Twitter interaction specific
  interactionType: z.enum(["like", "retweet", "comment", "follow"]).optional(),
  targetAccount: z.string().optional(),
  tweetUrl: z.string().optional(),
  
  // Quote tweet specific
  quoteTweetUrl: z.string().optional(),
  quoteRequirements: z.string().optional(),
  
  // Send tweet specific
  contentRequirements: z.string().optional(),
  
  // Threshold configuration
  participantThreshold: z.number().min(1, "Participant threshold must be at least 1").optional(),
  
  // Reward configuration
  rewardType: z.enum(["ETH", "ERC20", "NFT"]),
  tokenAddress: z.string().optional(),
  tokenSymbol: z.string().optional(),
  totalRewardPool: z.number().min(0.001, "Reward pool must be greater than 0"),
  rewardPerParticipant: z.number().min(0.001, "Reward per participant must be greater than 0"),
  distributionMethod: z.enum(["immediate", "linear"]),
  linearPeriod: z.number().optional(),
  unlockTime: z.date().optional(),
  
  // Time configuration
  startDate: z.date(),
  endDate: z.date(),
  rewardClaimDeadline: z.date(),
  
  // Terms agreement
  agreeToTerms: z.boolean().refine(val => val === true, "You must agree to terms")
}).refine(
  (data) => data.endDate > data.startDate,
  {
    message: "End date must be after start date",
    path: ["endDate"]
  }
).refine(
  (data) => data.rewardClaimDeadline > data.endDate,
  {
    message: "Reward claim deadline must be after end date",
    path: ["rewardClaimDeadline"]
  }
).refine(
  (data) => {
    // If distribution method is linear, unlock time and linear period must be provided
    if (data.distributionMethod === "linear") {
      return data.unlockTime !== undefined && data.linearPeriod !== undefined
    }
    return true
  },
  {
    message: "Linear distribution requires unlock time and period",
    path: ["distributionMethod"]
  }
).refine(
  (data) => {
    // Validate quest type specific requirements
    if (data.questType === "twitter-interaction") {
      if (data.interactionType === "follow") {
        return data.targetAccount !== undefined
      } else {
        return data.tweetUrl !== undefined
      }
    }
    if (data.questType === "quote-tweet") {
      return data.quoteTweetUrl !== undefined
    }
    return true
  },
  {
    message: "Missing required fields for quest type",
    path: ["questType"]
  }
)

export type QuestFormData = z.infer<typeof questSchema>

// Validation function with detailed error handling
export function validateQuestData(data: unknown) {
  const result = questSchema.safeParse(data)
  
  if (!result.success) {
    const errors = result.error.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message,
      code: err.code
    }))
    
    return {
      success: false,
      errors,
      data: null
    }
  }
  
  return {
    success: true,
    errors: [],
    data: result.data
  }
}

// Transform camelCase frontend data to snake_case database format
export function transformToDbFormat(formData: QuestFormData) {
  return {
    title: formData.title,
    description: formData.description,
    quest_type: formData.questType,
    
    // Twitter interaction specific
    interaction_type: formData.interactionType || null,
    target_account: formData.targetAccount || null,
    tweet_url: formData.tweetUrl || null,
    
    // Quote tweet specific
    quote_tweet_url: formData.quoteTweetUrl || null,
    quote_requirements: formData.quoteRequirements || null,
    
    // Send tweet specific
    content_requirements: formData.contentRequirements || null,
    
    // Threshold configuration
    participant_threshold: formData.participantThreshold || null,
    
    // Reward configuration
    reward_type: formData.rewardType,
    token_address: formData.tokenAddress || null,
    token_symbol: formData.tokenSymbol || null,
    total_reward_pool: formData.totalRewardPool,
    reward_per_participant: formData.rewardPerParticipant,
    distribution_method: formData.distributionMethod,
    linear_period: formData.linearPeriod || null,
    unlock_time: formData.unlockTime?.toISOString() || null,
    
    // Time configuration
    start_date: formData.startDate.toISOString(),
    end_date: formData.endDate.toISOString(),
    reward_claim_deadline: formData.rewardClaimDeadline.toISOString(),
    
    // Default status
    status: 'active' as const
  }
}

// Transform database format to frontend API response format
export function transformToApiFormat(dbQuest: any) {
  return {
    id: dbQuest.id,
    title: dbQuest.title,
    description: dbQuest.description,
    questType: dbQuest.quest_type,
    status: dbQuest.status,
    
    // Twitter interaction specific
    interactionType: dbQuest.interaction_type,
    targetAccount: dbQuest.target_account,
    tweetUrl: dbQuest.tweet_url,
    
    // Quote tweet specific
    quoteTweetUrl: dbQuest.quote_tweet_url,
    quoteRequirements: dbQuest.quote_requirements,
    
    // Send tweet specific
    contentRequirements: dbQuest.content_requirements,
    
    // Threshold configuration
    participantThreshold: dbQuest.participant_threshold,
    
    // Reward configuration
    rewardType: dbQuest.reward_type,
    tokenAddress: dbQuest.token_address,
    tokenSymbol: dbQuest.token_symbol,
    totalRewardPool: parseFloat(dbQuest.total_reward_pool),
    rewardPerParticipant: parseFloat(dbQuest.reward_per_participant),
    distributionMethod: dbQuest.distribution_method,
    linearPeriod: dbQuest.linear_period,
    unlockTime: dbQuest.unlock_time,
    
    // Time configuration
    startDate: dbQuest.start_date,
    endDate: dbQuest.end_date,
    rewardClaimDeadline: dbQuest.reward_claim_deadline,
    
    // Metadata
    createdAt: dbQuest.created_at,
    updatedAt: dbQuest.updated_at
  }
}