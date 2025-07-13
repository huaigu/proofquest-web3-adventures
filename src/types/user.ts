/**
 * User Types
 * 
 * Types for user management and profiles
 */

// User Profile
export interface User {
  address: string
  nickname?: string
  avatarUrl?: string
  bio?: string
  createdAt: string
  updatedAt: string
  lastLoginAt?: string
}

// User Profile Update Request
export interface UserUpdateRequest {
  nickname?: string
  avatarUrl?: string
  bio?: string
}

// User Statistics
export interface UserStats {
  questsCreated: number
  questsCompleted: number
  totalRewardsEarned: number
  totalRewardsDistributed: number
  participationCount: number
  successRate: number
  averageRating: number
}

// User Profile with Stats
export interface UserProfile extends User {
  stats: UserStats
  recentQuests: UserQuestActivity[]
  badges: UserBadge[]
}

// User Quest Activity
export interface UserQuestActivity {
  questId: string
  questTitle: string
  type: 'created' | 'participated' | 'completed'
  status: string
  reward?: {
    amount: number
    type: string
  }
  timestamp: string
}

// User Badge
export interface UserBadge {
  id: string
  name: string
  description: string
  iconUrl: string
  earnedAt: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
}

// Leaderboard Entry
export interface LeaderboardEntry {
  rank: number
  user: {
    address: string
    nickname?: string
    avatarUrl?: string
  }
  totalRewards: number
  questsCompleted: number
  successRate: number
  points: number
}

// User Search
export interface UserSearchParams {
  query?: string
  limit?: number
  offset?: number
}

export interface UserSearchResult {
  users: User[]
  total: number
}