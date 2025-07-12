-- ================================
-- 1. CREATE TABLES AND ENUMS
-- ================================

-- Create enum types for quest fields (PostgreSQL compatible syntax)
CREATE TYPE quest_type_enum AS ENUM ('twitter-interaction', 'quote-tweet', 'send-tweet');
CREATE TYPE reward_type_enum AS ENUM ('ETH', 'ERC20', 'NFT');
CREATE TYPE distribution_method_enum AS ENUM ('immediate', 'linear');
CREATE TYPE quest_status_enum AS ENUM ('draft', 'active', 'completed', 'cancelled');

-- Create quests table
CREATE TABLE IF NOT EXISTS quests (
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
    creator_id TEXT,
    status quest_status_enum DEFAULT 'active',
    
    -- Constraints
    CONSTRAINT end_date_after_start_date CHECK (end_date > start_date),
    CONSTRAINT claim_deadline_after_end_date CHECK (reward_claim_deadline > end_date)
    -- CONSTRAINT unlock_time_validation CHECK (
    --     (distribution_method = 'linear' AND unlock_time IS NOT NULL) OR 
    --     (distribution_method = 'immediate' AND unlock_time IS NULL)
    -- )
    -- CONSTRAINT linear_period_validation CHECK (
    --     (distribution_method = 'linear' AND linear_period IS NOT NULL) OR 
    --     (distribution_method = 'immediate' AND linear_period IS NULL)
    -- )
);

-- Create users table with EVM address as primary key
CREATE TABLE IF NOT EXISTS users (
    address TEXT PRIMARY KEY CHECK (
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

-- Create quest participations table
CREATE TABLE IF NOT EXISTS quest_participations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_address TEXT NOT NULL REFERENCES users(address) ON DELETE CASCADE,
    quest_id UUID NOT NULL REFERENCES quests(id) ON DELETE CASCADE,
    
    -- Participation status
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'verified', 'rewarded')),
    
    -- Participation proof
    proof_data TEXT,
    proof_url TEXT,
    
    -- Timestamps
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    verified_at TIMESTAMPTZ,
    rewarded_at TIMESTAMPTZ,
    
    -- Unique constraint to prevent double participation
    CONSTRAINT unique_user_quest_participation UNIQUE (user_address, quest_id)
);

-- Add foreign key constraint for quest creator
ALTER TABLE quests
ADD CONSTRAINT fk_quest_creator
    FOREIGN KEY (creator_id) REFERENCES users(address) ON DELETE SET NULL;

-- ================================
-- 2. CREATE INDEXES
-- ================================

-- Quest indexes
CREATE INDEX IF NOT EXISTS idx_quests_quest_type ON quests(quest_type);
CREATE INDEX IF NOT EXISTS idx_quests_status ON quests(status);
CREATE INDEX IF NOT EXISTS idx_quests_created_at ON quests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_quests_start_date ON quests(start_date);
CREATE INDEX IF NOT EXISTS idx_quests_end_date ON quests(end_date);

-- User indexes
CREATE INDEX IF NOT EXISTS idx_users_nickname ON users(nickname);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at DESC);

-- Participation indexes
CREATE INDEX IF NOT EXISTS idx_quest_participations_user ON quest_participations(user_address);
CREATE INDEX IF NOT EXISTS idx_quest_participations_quest ON quest_participations(quest_id);
CREATE INDEX IF NOT EXISTS idx_quest_participations_status ON quest_participations(status);
CREATE INDEX IF NOT EXISTS idx_quest_participations_joined_at ON quest_participations(joined_at DESC);

-- ================================
-- 3. CREATE TRIGGERS
-- ================================

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to tables
DROP TRIGGER IF EXISTS update_quests_updated_at ON quests;
CREATE TRIGGER update_quests_updated_at 
    BEFORE UPDATE ON quests 
    FOR EACH ROW 
    EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE PROCEDURE update_updated_at_column();

-- ================================
-- 4. ENABLE ROW LEVEL SECURITY
-- ================================

-- Enable RLS
ALTER TABLE quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE quest_participations ENABLE ROW LEVEL SECURITY;

-- Create policies (allow all for now - can be restricted later)
DROP POLICY IF EXISTS "Allow read access to all quests" ON quests;
CREATE POLICY "Allow read access to all quests" ON quests FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow insert access to all quests" ON quests;
CREATE POLICY "Allow insert access to all quests" ON quests FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow update access to all quests" ON quests;
CREATE POLICY "Allow update access to all quests" ON quests FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow read access to all users" ON users;
CREATE POLICY "Allow read access to all users" ON users FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow insert access to all users" ON users;
CREATE POLICY "Allow insert access to all users" ON users FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow update access to all users" ON users;
CREATE POLICY "Allow update access to all users" ON users FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow read access to all participations" ON quest_participations;
CREATE POLICY "Allow read access to all participations" ON quest_participations FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow insert access to all participations" ON quest_participations;
CREATE POLICY "Allow insert access to all participations" ON quest_participations FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow update access to all participations" ON quest_participations;
CREATE POLICY "Allow update access to all participations" ON quest_participations FOR UPDATE USING (true);

-- ================================
-- 5. INSERT MOCK DATA
-- ================================

-- Insert mock users
INSERT INTO users (address, nickname, avatar_url, bio) VALUES 
(
    '0x742d35cc6635c0532925a3b8d4ba0f3a6c3c2685',
    'Alice Chen',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice',
    'Web3 developer and DeFi enthusiast. Building the future of finance.'
),
(
    '0x10e0271ec47d55511a047516f2a7301801d55eab',
    'Bob Smith', 
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob',
    'Crypto trader and blockchain advocate. Always looking for the next big thing.'
),
(
    '0x1234567890123456789012345678901234567890',
    'Charlie Wilson',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie',
    'NFT artist and community builder. Creating digital art on the blockchain.'
)
ON CONFLICT (address) DO UPDATE SET
    nickname = EXCLUDED.nickname,
    avatar_url = EXCLUDED.avatar_url,
    bio = EXCLUDED.bio,
    updated_at = NOW();

-- Insert mock quests  
INSERT INTO quests (
    title, description, quest_type, interaction_type, target_account,
    reward_type, total_reward_pool, reward_per_participant, distribution_method,
    start_date, end_date, reward_claim_deadline, creator_id, status
) VALUES 
(
    'Follow @ProofQuest on Twitter',
    'Follow our official Twitter account to stay updated with the latest news and announcements. Be part of our growing community!',
    'twitter-interaction',
    'follow',
    '@ProofQuest',
    'ETH',
    1.0,
    0.01,
    'immediate',
    NOW(),
    NOW() + INTERVAL '7 days',
    NOW() + INTERVAL '14 days',
    '0x742d35cc6635c0532925a3b8d4ba0f3a6c3c2685',
    'active'
),
(
    'Like and Retweet Our Launch Post',
    'Help us spread the word about ProofQuest! Like and retweet our launch announcement to earn rewards.',
    'twitter-interaction',
    'retweet',
    NULL,
    'ETH',
    2.0,
    0.02,
    'immediate',
    NOW(),
    NOW() + INTERVAL '10 days',
    NOW() + INTERVAL '17 days',
    '0x10e0271ec47d55511a047516f2a7301801d55eab',
    'active'
),
(
    'Quote Tweet with #Web3Quest',
    'Quote tweet our pinned post with the hashtag #Web3Quest and share why you are excited about the future of Web3!',
    'quote-tweet',
    NULL,
    NULL,
    'ETH',
    0.5,
    0.005,
    'linear',
    NOW(),
    NOW() + INTERVAL '5 days',
    NOW() + INTERVAL '12 days',
    '0x1234567890123456789012345678901234567890',
    'active'
);

-- Update the linear vesting quest with proper fields
UPDATE quests 
SET 
    quote_tweet_url = 'https://twitter.com/ProofQuest/status/9876543210',
    quote_requirements = '#Web3Quest',
    linear_period = 30,
    unlock_time = NOW() + INTERVAL '1 day'
WHERE quest_type = 'quote-tweet';

-- Update the retweet quest with tweet URL
UPDATE quests 
SET tweet_url = 'https://twitter.com/ProofQuest/status/1234567890'
WHERE interaction_type = 'retweet';

-- Insert mock participations
WITH quest_ids AS (
    SELECT id, title FROM quests ORDER BY created_at LIMIT 3
)
INSERT INTO quest_participations (user_address, quest_id, status, proof_url, proof_data, completed_at, verified_at)
SELECT 
    user_addr,
    quest_id,
    part_status,
    proof_url,
    proof_data,
    completed_time,
    verified_time
FROM (
    VALUES 
    (
        '0x10e0271ec47d55511a047516f2a7301801d55eab',
        (SELECT id FROM quest_ids WHERE title LIKE 'Follow%' LIMIT 1),
        'completed',
        'https://twitter.com/BobSmith/status/1111111111',
        '{"action": "follow", "timestamp": "' || NOW()::text || '"}',
        NOW() - INTERVAL '1 hour',
        NULL::timestamptz
    ),
    (
        '0x1234567890123456789012345678901234567890',
        (SELECT id FROM quest_ids WHERE title LIKE 'Follow%' LIMIT 1),
        'pending',
        NULL,
        NULL,
        NULL::timestamptz,
        NULL::timestamptz
    ),
    (
        '0x742d35cc6635c0532925a3b8d4ba0f3a6c3c2685',
        (SELECT id FROM quest_ids WHERE title LIKE 'Like and Retweet%' LIMIT 1),
        'verified',
        'https://twitter.com/AliceChen/status/2222222222',
        '{"action": "retweet", "timestamp": "' || NOW()::text || '"}',
        NOW() - INTERVAL '2 hours',
        NOW() - INTERVAL '30 minutes'
    )
) AS participation_data(user_addr, quest_id, part_status, proof_url, proof_data, completed_time, verified_time);

-- ================================
-- 6. VERIFICATION QUERIES
-- ================================

-- Check table counts
SELECT 'Users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'Quests' as table_name, COUNT(*) as count FROM quests  
UNION ALL
SELECT 'Participations' as table_name, COUNT(*) as count FROM quest_participations;

-- Show sample data
SELECT 
    q.title,
    q.quest_type,
    q.status,
    u.nickname as creator_nickname,
    q.total_reward_pool,
    q.reward_per_participant,
    COUNT(p.id) as participant_count
FROM quests q
LEFT JOIN users u ON q.creator_id = u.address
LEFT JOIN quest_participations p ON q.id = p.quest_id
GROUP BY q.id, q.title, q.quest_type, q.status, u.nickname, q.total_reward_pool, q.reward_per_participant
ORDER BY q.created_at;

-- Database setup completed successfully!
-- You can now start your ProofQuest server and use the API endpoints.