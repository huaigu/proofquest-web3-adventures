// Database type definitions generated from Supabase schema
// This file defines the TypeScript types for our database tables

export interface Database {
  public: {
    Tables: {
      quests: {
        Row: Quest
        Insert: QuestInsert
        Update: QuestUpdate
      }
      users: {
        Row: User
        Insert: UserInsert
        Update: UserUpdate
      }
      quest_participations: {
        Row: QuestParticipation
        Insert: QuestParticipationInsert
        Update: QuestParticipationUpdate
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      quest_type_enum: 'twitter-interaction' | 'quote-tweet' | 'send-tweet'
      reward_type_enum: 'ETH' | 'ERC20' | 'NFT'
      distribution_method_enum: 'immediate' | 'linear'
      quest_status_enum: 'draft' | 'active' | 'completed' | 'cancelled'
    }
  }
}

// Quest table types
export interface Quest {
  id: string
  title: string
  description: string
  quest_type: Database['public']['Enums']['quest_type_enum']
  
  // Twitter interaction specific fields
  interaction_type?: string | null
  target_account?: string | null
  tweet_url?: string | null
  
  // Quote tweet specific fields
  quote_tweet_url?: string | null
  quote_requirements?: string | null
  
  // Send tweet specific fields
  content_requirements?: string | null
  
  // Threshold configuration
  participant_threshold?: number | null
  
  // Reward configuration
  reward_type: Database['public']['Enums']['reward_type_enum']
  token_address?: string | null
  token_symbol?: string | null
  total_reward_pool: number
  reward_per_participant: number
  distribution_method: Database['public']['Enums']['distribution_method_enum']
  linear_period?: number | null
  unlock_time?: string | null
  
  // Time configuration
  start_date: string
  end_date: string
  reward_claim_deadline: string
  
  // Metadata
  created_at: string
  updated_at: string
  creator_id?: string | null
  status: Database['public']['Enums']['quest_status_enum']
}

// User table types
export interface User {
  address: string // EVM address as primary key
  nickname?: string | null
  avatar_url?: string | null
  bio?: string | null
  created_at: string
  updated_at: string
  last_login_at?: string | null
}

export interface UserInsert {
  address: string
  nickname?: string | null
  avatar_url?: string | null
  bio?: string | null
  created_at?: string
  updated_at?: string
  last_login_at?: string | null
}

export interface UserUpdate {
  address?: string
  nickname?: string | null
  avatar_url?: string | null
  bio?: string | null
  updated_at?: string
  last_login_at?: string | null
}

// Quest participation table types
export interface QuestParticipation {
  id: string
  user_address: string
  quest_id: string
  status: 'pending' | 'completed' | 'verified' | 'rewarded'
  proof_data?: any | null // JSONB
  proof_url?: string | null
  joined_at: string
  completed_at?: string | null
  verified_at?: string | null
  rewarded_at?: string | null
}

export interface QuestParticipationInsert {
  id?: string
  user_address: string
  quest_id: string
  status?: 'pending' | 'completed' | 'verified' | 'rewarded'
  proof_data?: any | null
  proof_url?: string | null
  joined_at?: string
  completed_at?: string | null
  verified_at?: string | null
  rewarded_at?: string | null
}

export interface QuestParticipationUpdate {
  id?: string
  user_address?: string
  quest_id?: string
  status?: 'pending' | 'completed' | 'verified' | 'rewarded'
  proof_data?: any | null
  proof_url?: string | null
  completed_at?: string | null
  verified_at?: string | null
  rewarded_at?: string | null
}

export interface QuestInsert {
  id?: string
  title: string
  description: string
  quest_type: Database['public']['Enums']['quest_type_enum']
  
  // Twitter interaction specific fields
  interaction_type?: string | null
  target_account?: string | null
  tweet_url?: string | null
  
  // Quote tweet specific fields
  quote_tweet_url?: string | null
  quote_requirements?: string | null
  
  // Send tweet specific fields
  content_requirements?: string | null
  
  // Threshold configuration
  participant_threshold?: number | null
  
  // Reward configuration
  reward_type: Database['public']['Enums']['reward_type_enum']
  token_address?: string | null
  token_symbol?: string | null
  total_reward_pool: number
  reward_per_participant: number
  distribution_method?: Database['public']['Enums']['distribution_method_enum']
  linear_period?: number | null
  unlock_time?: string | null
  
  // Time configuration
  start_date: string
  end_date: string
  reward_claim_deadline: string
  
  // Metadata
  created_at?: string
  updated_at?: string
  creator_id?: string | null
  status?: Database['public']['Enums']['quest_status_enum']
}

export interface QuestUpdate {
  id?: string
  title?: string
  description?: string
  quest_type?: Database['public']['Enums']['quest_type_enum']
  
  // Twitter interaction specific fields
  interaction_type?: string | null
  target_account?: string | null
  tweet_url?: string | null
  
  // Quote tweet specific fields
  quote_tweet_url?: string | null
  quote_requirements?: string | null
  
  // Send tweet specific fields
  content_requirements?: string | null
  
  // Threshold configuration
  participant_threshold?: number | null
  
  // Reward configuration
  reward_type?: Database['public']['Enums']['reward_type_enum']
  token_address?: string | null
  token_symbol?: string | null
  total_reward_pool?: number
  reward_per_participant?: number
  distribution_method?: Database['public']['Enums']['distribution_method_enum']
  linear_period?: number | null
  unlock_time?: string | null
  
  // Time configuration
  start_date?: string
  end_date?: string
  reward_claim_deadline?: string
  
  // Metadata
  updated_at?: string
  creator_id?: string | null
  status?: Database['public']['Enums']['quest_status_enum']
}