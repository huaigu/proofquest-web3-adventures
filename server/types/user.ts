// User-related types for API requests and responses

// Frontend user data types
export interface UserFormData {
  address: string
  nickname?: string
  avatarUrl?: string
  bio?: string
}

// API response types
export interface UserResponse {
  address: string
  nickname?: string
  avatarUrl?: string
  bio?: string
  createdAt: string
  updatedAt: string
  lastLoginAt?: string
}

// Quest participation types
export interface ParticipationResponse {
  id: string
  userAddress: string
  questId: string
  status: 'pending' | 'completed' | 'verified' | 'rewarded'
  proofData?: any
  proofUrl?: string
  joinedAt: string
  completedAt?: string
  verifiedAt?: string
  rewardedAt?: string
}

export interface ParticipationFormData {
  questId: string
  proofUrl?: string
  proofData?: any
}

// Extended quest response with creator info
export interface QuestWithCreator {
  id: string
  title: string
  description: string
  questType: string
  status: string
  creator?: UserResponse
  // ... other quest fields
}

// User statistics
export interface UserStats {
  address: string
  totalQuestsCreated: number
  totalQuestsParticipated: number
  totalQuestsCompleted: number
  totalRewardsEarned: number
  successRate: number // percentage of completed vs participated quests
}

// API response wrappers
export interface UsersListResponse {
  users: UserResponse[]
  total: number
}

export interface UserParticipationsResponse {
  participations: ParticipationResponse[]
  total: number
}