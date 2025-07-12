-- Migration: Create quests table and related enums
-- This migration sets up the complete quest schema based on the CreateQuest.tsx form

-- Create enum types for quest fields
CREATE TYPE quest_type_enum AS ENUM ('twitter-interaction', 'quote-tweet', 'send-tweet');
CREATE TYPE reward_type_enum AS ENUM ('ETH', 'ERC20', 'NFT');
CREATE TYPE distribution_method_enum AS ENUM ('immediate', 'linear');
CREATE TYPE quest_status_enum AS ENUM ('draft', 'active', 'completed', 'cancelled');

-- Create quests table
CREATE TABLE quests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL CHECK (length(title) <= 100),
    description TEXT NOT NULL CHECK (length(description) >= 10),
    quest_type quest_type_enum NOT NULL,
    
    -- Twitter interaction specific fields
    interaction_type TEXT CHECK (interaction_type IN ('like', 'retweet', 'comment', 'follow')),
    target_account TEXT,
    tweet_url TEXT,
    
    -- Quote tweet specific fields
    quote_tweet_url TEXT,
    quote_requirements TEXT,
    
    -- Send tweet specific fields
    content_requirements TEXT,
    
    -- Threshold configuration
    participant_threshold INTEGER CHECK (participant_threshold >= 1),
    
    -- Reward configuration
    reward_type reward_type_enum NOT NULL,
    token_address TEXT,
    token_symbol TEXT,
    total_reward_pool DECIMAL(20, 8) NOT NULL CHECK (total_reward_pool > 0),
    reward_per_participant DECIMAL(20, 8) NOT NULL CHECK (reward_per_participant > 0),
    distribution_method distribution_method_enum NOT NULL DEFAULT 'immediate',
    linear_period INTEGER CHECK (linear_period > 0),
    unlock_time TIMESTAMPTZ,
    
    -- Time configuration
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    reward_claim_deadline TIMESTAMPTZ NOT NULL,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    creator_id UUID,
    status quest_status_enum DEFAULT 'active',
    
    -- Constraints
    CONSTRAINT end_date_after_start_date CHECK (end_date > start_date),
    CONSTRAINT claim_deadline_after_end_date CHECK (reward_claim_deadline > end_date),
    CONSTRAINT unlock_time_validation CHECK (
        (distribution_method = 'linear' AND unlock_time IS NOT NULL) OR 
        (distribution_method = 'immediate' AND unlock_time IS NULL)
    ),
    CONSTRAINT linear_period_validation CHECK (
        (distribution_method = 'linear' AND linear_period IS NOT NULL) OR 
        (distribution_method = 'immediate' AND linear_period IS NULL)
    )
);

-- Create indexes for better query performance
CREATE INDEX idx_quests_quest_type ON quests(quest_type);
CREATE INDEX idx_quests_status ON quests(status);
CREATE INDEX idx_quests_created_at ON quests(created_at DESC);
CREATE INDEX idx_quests_start_date ON quests(start_date);
CREATE INDEX idx_quests_end_date ON quests(end_date);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_quests_updated_at 
    BEFORE UPDATE ON quests 
    FOR EACH ROW 
    EXECUTE PROCEDURE update_updated_at_column();

-- Enable Row Level Security (RLS) for future authentication
ALTER TABLE quests ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows read access to all users for now
-- This can be updated later when authentication is implemented
CREATE POLICY "Allow read access to all users" ON quests
    FOR SELECT USING (true);

-- Create a policy that allows insert for all users for now
-- This can be updated later when authentication is implemented
CREATE POLICY "Allow insert access to all users" ON quests
    FOR INSERT WITH CHECK (true);