-- Migration: Create users table and quest participation tracking
-- This migration creates user management and links users to quests

-- Create users table with EVM address as primary key
CREATE TABLE users (
    address TEXT PRIMARY KEY CHECK (
        -- Validate EVM address format (0x followed by 40 hex characters)
        address ~* '^0x[a-f0-9]{40}$'
    ),
    nickname TEXT CHECK (length(nickname) <= 50),
    avatar_url TEXT,
    bio TEXT CHECK (length(bio) <= 500),
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_login_at TIMESTAMPTZ
);

-- Create quest participations table to track user participation in quests
CREATE TABLE quest_participations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_address TEXT NOT NULL REFERENCES users(address) ON DELETE CASCADE,
    quest_id UUID NOT NULL REFERENCES quests(id) ON DELETE CASCADE,
    
    -- Participation status
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'verified', 'rewarded')),
    
    -- Participation proof (e.g., Twitter interaction proof)
    proof_data JSONB,
    proof_url TEXT, -- URL to the actual Twitter post/interaction
    
    -- Timestamps
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    verified_at TIMESTAMPTZ,
    rewarded_at TIMESTAMPTZ,
    
    -- Unique constraint to prevent double participation
    CONSTRAINT unique_user_quest_participation UNIQUE (user_address, quest_id)
);

-- Update quests table to link with users (creator)
ALTER TABLE quests 
ALTER COLUMN creator_id TYPE TEXT,
ADD CONSTRAINT fk_quest_creator 
    FOREIGN KEY (creator_id) REFERENCES users(address) ON DELETE SET NULL;

-- Create indexes for better query performance
CREATE INDEX idx_users_nickname ON users(nickname);
CREATE INDEX idx_users_created_at ON users(created_at DESC);

CREATE INDEX idx_quest_participations_user ON quest_participations(user_address);
CREATE INDEX idx_quest_participations_quest ON quest_participations(quest_id);
CREATE INDEX idx_quest_participations_status ON quest_participations(status);
CREATE INDEX idx_quest_participations_joined_at ON quest_participations(joined_at DESC);

-- Create updated_at trigger for users table
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE PROCEDURE update_updated_at_column();

-- Enable Row Level Security (RLS) for users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
-- Allow read access to all users
CREATE POLICY "Allow read access to all users" ON users
    FOR SELECT USING (true);

-- Allow users to insert their own profile
CREATE POLICY "Allow users to insert their own profile" ON users
    FOR INSERT WITH CHECK (true);

-- Allow users to update their own profile
CREATE POLICY "Allow users to update their own profile" ON users
    FOR UPDATE USING (true);

-- Enable Row Level Security for quest_participations
ALTER TABLE quest_participations ENABLE ROW LEVEL SECURITY;

-- Create policies for quest_participations table
CREATE POLICY "Allow read access to all participations" ON quest_participations
    FOR SELECT USING (true);

CREATE POLICY "Allow users to insert their own participations" ON quest_participations
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow users to update their own participations" ON quest_participations
    FOR UPDATE USING (true);