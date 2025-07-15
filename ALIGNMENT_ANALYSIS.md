# ProofQuest System Alignment Analysis

## Overview
This document analyzes the alignment between the deployed QuestSystem smart contract (0x3EA01F942B527fCaB13B6Ff21E91c8fdd0086BB1) and the frontend/backend system components.

## Contract Address
- **QuestSystem Proxy**: `0x3EA01F942B527fCaB13B6Ff21E91c8fdd0086BB1`
- **PrimusZKTLS**: `0x3760aB354507a29a9F5c65A66C74353fd86393FA`
- **Network**: Sepolia Testnet

## 1. Quest Type Alignment

### Smart Contract
- Supports only 2 quest types: `LikeAndRetweet` and `QuoteTweet`
- Enum: `QuestType { LikeAndRetweet, QuoteTweet }`
- `LikeAndRetweet` uses `requireFavorite` and `requireRetweet` booleans to specify which actions are required

### Frontend/Backend
- Supports 3 quest types: `twitter-interaction`, `quote-tweet`, `send-tweet`
- `send-tweet` is marked as "Coming Soon" in UI (disabled)

**🟢 ALIGNMENT**: 
- Frontend `twitter-interaction` maps to contract `LikeAndRetweet`
- Contract `requireFavorite`/`requireRetweet` flags allow flexible requirement configuration
- Frontend `quote-tweet` maps to contract `QuoteTweet`
- `send-tweet` is disabled in frontend, matching contract limitations

## 2. Quest Configuration Fields

### Smart Contract Quest Struct
```solidity
struct Quest {
    uint256 id;
    address sponsor;
    QuestType questType;
    QuestStatus status;
    VerificationParams verificationParams;
    uint256 totalRewards;
    uint256 rewardPerUser;
    uint256 maxParticipants;
    uint256 participantCount;
    uint256 startTime;
    uint256 endTime;
    uint256 claimEndTime;
    bool isVesting;
    uint256 vestingDuration;
}
```

### Frontend Form Fields (QuestFormData)
```typescript
interface QuestFormData {
    title: string                    // ❌ Not in contract
    description: string              // ❌ Not in contract
    questType: string
    interactionType?: string         // ❌ Not directly in contract
    targetAccount?: string           // ❌ Not in contract
    tweetUrl?: string               // ❌ Not in contract
    quoteTweetUrl?: string          // ❌ Not in contract
    quoteRequirements?: string      // ❌ Not in contract
    totalRewardPool: number         // ✅ Maps to totalRewards
    rewardPerParticipant: number    // ✅ Maps to rewardPerUser
    distributionMethod: string      // ✅ Maps to isVesting
    startDate: Date                 // ✅ Maps to startTime
    endDate: Date                   // ✅ Maps to endTime
    rewardClaimDeadline: Date       // ✅ Maps to claimEndTime
    // ... other fields
}
```

**🟡 PLANNED ALIGNMENT**: 
- Contract doesn't store `title` or `description` - these will be stored in backend/Supabase
- Contract doesn't store `targetAccount`, `tweetUrl`, `quoteTweetUrl` directly
- These values are embedded in `VerificationParams` structure and will be processed during contract interaction

## 3. Verification Parameters Structure

### Smart Contract VerificationParams
```solidity
struct VerificationParams {
    string apiUrlPattern;
    string apiEndpointHash;
    uint256 proofValidityPeriod;
    
    // LikeAndRetweet specific
    string targetLikeRetweetId;
    string favoritedJsonPath;
    string retweetedJsonPath;
    bool requireFavorite;
    bool requireRetweet;
    
    // QuoteTweet specific
    string targetQuotedTweetId;
    string quotedStatusIdJsonPath;
    string userIdJsonPath;
    string quoteTweetIdJsonPath;
}
```

**🟡 TODO - FRONTEND INTEGRATION**:
- Contract stores verification parameters but frontend doesn't collect all fields yet
- Frontend `tweetUrl` will be parsed to extract `targetLikeRetweetId` during contract interaction
- Frontend `quoteTweetUrl` will be parsed to extract `targetQuotedTweetId` during contract interaction
- Missing fields (JSON paths, API endpoints) will be added during zkTLS integration

## 4. Reward System Alignment

### Smart Contract
- **Supports**: Only ETH payments (`payable` functions)
- **Vesting**: Boolean flag `isVesting` + `vestingDuration`
- **Distribution**: Direct transfer or vesting-based claiming

### Frontend/Backend
- **Supports**: ETH, ERC20, NFT (but ERC20/NFT marked as "Coming Soon")
- **Distribution**: `immediate`, `linear` (maps to vesting)
- **Vesting Period**: `linearPeriod` in days

**🟢 GOOD ALIGNMENT**:
- Contract only supports ETH (aligned with current frontend restrictions)
- Frontend `distributionMethod: 'linear'` maps to `isVesting: true`
- Frontend `linearPeriod` maps to `vestingDuration` (frontend will convert days to seconds/timestamp)

## 5. View Functions Coverage

### Contract View Functions
```solidity
// Basic quest info
function getQuest(uint256 _questId) external view returns (Quest memory)
function getQuestDetails(uint256 _questId) external view returns (...)
function getMultipleQuests(uint256[] calldata _questIds) external view returns (Quest[] memory)

// Filtering and pagination
function getAllQuestIds(uint256 _offset, uint256 _limit) external view returns (uint256[] memory, uint256)
function getQuestsByStatus(QuestStatus _status, uint256 _offset, uint256 _limit) external view returns (...)
function getQuestsBySponsor(address _sponsor, uint256 _offset, uint256 _limit) external view returns (...)
function getQuestsByParticipant(address _user, uint256 _offset, uint256 _limit) external view returns (...)

// Statistics
function getQuestStatistics() external view returns (uint256, uint256, uint256, uint256)
function getUserStatistics(address _user) external view returns (uint256, uint256, uint256)

// User-specific info
function hasUserQualified(uint256 _questId, address _user) external view returns (bool)
function getVestingInfo(uint256 _questId, address _user) external view returns (...)
function canUserClaimReward(uint256 _questId, address _user) external view returns (bool, string memory)
```

**🟢 GOOD ALIGNMENT**:
- Contract provides comprehensive view functions for backend needs
- Supports pagination for quest listing
- Provides user statistics and participation tracking
- Includes vesting information for linear distribution

## 6. Missing Contract Data for Frontend

### Data Stored Only in Backend/Frontend
1. **Quest Metadata** (to be stored in Supabase):
   - `title` - displayed in UI
   - `description` - displayed in UI
   - `targetAccount` - for follow quests
   - `quoteRequirements` - display text for quote requirements

2. **UI Configuration**:
   - `interactionType` - specific interaction type within twitter-interaction
   - `participantThreshold` - minimum participants to activate quest
   - `tokenAddress`, `tokenSymbol` - for future ERC20 support

**🟢 PLANNED SOLUTION**: 
- Backend will store additional metadata in Supabase with contract quest ID mapping
- Frontend will combine contract data with backend metadata for full quest display

## 7. Implementation Status and TODOs

### 🟡 TODO Items (Frontend Integration)

1. **zkTLS Integration**:
   - **Status**: Pending frontend integration
   - **Tasks**: 
     - Add verification parameter collection during contract interaction
     - Implement URL parsing to extract tweet IDs
     - Add JSON path configuration for zkTLS verification

2. **Quest Creation Flow**:
   - **Status**: Frontend form ready, needs contract integration
   - **Tasks**: 
     - Map frontend form data to contract parameters
     - Convert time units (days → seconds/timestamp)
     - Handle requireFavorite/requireRetweet flags based on interaction type

3. **Metadata Storage**:
   - **Status**: Backend needs Supabase integration
   - **Tasks**: 
     - Create quest metadata table in Supabase
     - Store title, description, and UI-specific fields
     - Link metadata to contract quest IDs

### 🟢 Well-Aligned Components

1. **Quest Type Mapping**:
   - Frontend `twitter-interaction` → Contract `LikeAndRetweet`
   - Frontend `quote-tweet` → Contract `QuoteTweet`
   - Flexible requirement configuration with boolean flags

2. **Reward System**:
   - ETH-only support matches contract implementation
   - Vesting system properly mapped
   - View functions provide comprehensive backend support

3. **Data Architecture**:
   - Contract handles core quest logic and verification
   - Backend stores UI metadata and user experience data
   - Clean separation of concerns

## 8. Next Steps Implementation Plan

### Phase 1: Frontend Contract Integration

1. **Create Quest Mapping Layer**:
   ```typescript
   // Add to frontend during contract interaction
   function mapFormDataToContractParams(formData: QuestFormData): ContractQuestParams {
     // Map twitter-interaction to LikeAndRetweet with requireFavorite/requireRetweet flags
     // Parse URLs to extract tweet IDs
     // Convert days to seconds for vesting duration
     // Add default verification parameters during zkTLS integration
   }
   ```

2. **URL Parsing Utility**:
   ```typescript
   // Extract tweet ID from Twitter URL
   function extractTweetId(url: string): string {
     // Parse https://twitter.com/username/status/1234567890 → 1234567890
   }
   ```

3. **Time Conversion**:
   ```typescript
   // Convert form dates to timestamps
   function convertDatesToTimestamps(formData: QuestFormData): ContractTimestamps {
     // Convert Date objects to Unix timestamps
   }
   ```

### Phase 2: Backend Metadata Storage

1. **Supabase Quest Metadata Table**:
   ```sql
   CREATE TABLE quest_metadata (
     contract_quest_id BIGINT PRIMARY KEY,
     title VARCHAR(255) NOT NULL,
     description TEXT,
     target_account VARCHAR(255),
     quote_requirements TEXT,
     interaction_type VARCHAR(50),
     participant_threshold INTEGER,
     created_at TIMESTAMP DEFAULT NOW()
   );
   ```

2. **API Endpoints for Combined Data**:
   ```typescript
   // Combine contract data with metadata
   GET /api/quests/:id -> {contractData, metadata}
   ```

### Phase 3: zkTLS Integration

1. **Add Verification Parameter Collection**:
   - Add during contract interaction phase
   - Include JSON paths, API endpoints
   - Handle different quest types appropriately

## 9. Conclusion

The analysis shows that the system architecture is **well-designed** with good separation of concerns:

- ✅ **Contract**: Handles core quest logic, verification, and rewards
- ✅ **Backend**: Will store UI metadata and user experience data  
- ✅ **Frontend**: Provides user interface with proper quest type mapping

**Key Strengths**:
1. Quest type mapping is logical and flexible
2. Reward system fully supports current ETH-only requirements
3. Contract view functions provide comprehensive backend support
4. Upgradeable contract allows for future enhancements

**Remaining Work**:
1. Frontend zkTLS integration (marked as TODO)
2. Backend Supabase metadata storage
3. URL parsing and parameter mapping utilities

**Overall Assessment**: 🟢 **Good alignment** with clear implementation path forward.