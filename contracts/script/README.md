# ProofQuest Deployment & Demo Scripts

This directory contains deployment scripts and demonstrations for the ProofQuest smart contract system.

## 📋 Available Scripts

### 🚀 Deployment Scripts

#### 1. **DeployQuestSystem.s.sol** - Main Deployment
Complete deployment script for the QuestSystem with UUPS proxy pattern.

**Features:**
- Deploys MockPrimusZKTLS for testing or uses existing PrimusZKTLS
- Deploys QuestSystem implementation with UUPS proxy
- Configurable via environment variables
- Automatic ownership transfer
- Comprehensive logging and verification commands

**Usage:**
```bash
# Deploy to testnet/mainnet
forge script script/DeployQuestSystem.s.sol --rpc-url <RPC_URL> --broadcast --verify

# Deploy to Anvil (local)
forge script script/DeployQuestSystem.s.sol:DeployAnvilScript --rpc-url http://localhost:8545 --broadcast
```

#### 2. **UpgradeQuestSystem.s.sol** - UUPS Upgrades
Demonstrates UUPS upgrade functionality with state preservation.

**Features:**
- Upgrade existing QuestSystem to new implementation
- State preservation verification
- Example QuestSystemV2 with new features
- Upgrade safety checks

**Usage:**
```bash
forge script script/UpgradeQuestSystem.s.sol --rpc-url <RPC_URL> --broadcast
```

### 🎭 Demo Scripts

#### 3. **DemoQuestSystem.s.sol** - Complete Workflow Demo
Comprehensive demonstration of all ProofQuest features.

**Demo Scenarios:**
1. **Basic Like & Retweet Quest** - Create quest, users participate, claim rewards
2. **Vesting Quest** - Linear reward vesting over time
3. **Quote Tweet Quest** - Quote tweet verification and unique tweet tracking
4. **View Functions** - Frontend integration data queries
5. **Error Scenarios** - Proper error handling demonstration

**Usage:**
```bash
forge script script/DemoQuestSystem.s.sol --rpc-url <RPC_URL> --broadcast
```

## 🔧 Environment Configuration

Create a `.env` file with the following variables:

```bash
# Required
PRIVATE_KEY=0x... # Your private key
RPC_URL=https://... # Your RPC endpoint

# Deployment Configuration
USE_MOCK_ZKTLS=true # Use MockPrimusZKTLS (true) or existing contract (false)
PRIMUS_ZKTLS_ADDRESS=0x... # Required if USE_MOCK_ZKTLS=false
VERIFIER_ADDRESS=0x... # Verifier address for MockPrimusZKTLS
QUEST_SYSTEM_OWNER=0x... # Optional: Custom owner address

# Contract Addresses (set after deployment)
QUEST_SYSTEM_ADDRESS=0x... # Main QuestSystem proxy address
```

## 📚 Step-by-Step Deployment Guide

### 1. Local Development (Anvil)

```bash
# Start Anvil
anvil

# Deploy to Anvil (separate terminal)
forge script script/DeployQuestSystem.s.sol:DeployAnvilScript --rpc-url http://localhost:8545 --broadcast

# Run demo
forge script script/DemoQuestSystem.s.sol --rpc-url http://localhost:8545 --broadcast
```

### 2. Testnet Deployment

```bash
# Set environment variables
export PRIVATE_KEY=0x...
export RPC_URL=https://testnet-rpc-url...

# Deploy contracts
forge script script/DeployQuestSystem.s.sol --rpc-url $RPC_URL --broadcast --verify

# Save contract addresses to .env
echo "QUEST_SYSTEM_ADDRESS=<proxy_address>" >> .env

# Run demo
forge script script/DemoQuestSystem.s.sol --rpc-url $RPC_URL --broadcast
```

### 3. Mainnet Deployment

```bash
# IMPORTANT: Double-check all addresses and configurations
export PRIVATE_KEY=0x...
export RPC_URL=https://mainnet-rpc-url...
export USE_MOCK_ZKTLS=false # Use real PrimusZKTLS on mainnet
export PRIMUS_ZKTLS_ADDRESS=0x... # Real PrimusZKTLS address

# Deploy contracts
forge script script/DeployQuestSystem.s.sol --rpc-url $RPC_URL --broadcast --verify --slow
```

## 🎯 Demo Output Example

When running the demo script, you'll see output like:

```
=== ProofQuest Demo Started ===
QuestSystem: 0x1234...
MockPrimusZKTLS: 0x5678...

=== Demo 1: Basic Like & Retweet Quest ===
✅ Quest created with ID: 1
   Reward pool: 1.0 ETH
   Reward per user: 0.1 ETH
✅ User1 claimed reward: 0.1 ETH
   Participants: 1
✅ User2 also claimed reward successfully

=== Demo 2: Vesting Quest ===
✅ Vesting quest created with ID: 2
   Vesting duration: 30 days
✅ User1 qualified for vesting quest
✅ User1 claimed vesting reward after 1 day: 0.003 ETH

=== Demo 3: Quote Tweet Quest ===
✅ Quote tweet quest created with ID: 3
✅ User1 claimed quote tweet reward: 0.1 ETH
   Quote tweet marked as used: true

=== Demo 4: View Functions for Frontend Integration ===
✅ Total quests created: 3
✅ Platform Statistics:
   Total quests: 3
   Active quests: 3
   Total rewards distributed: 0.203 ETH

=== Demo 5: Error Handling Scenarios ===
✅ Double claim correctly rejected: User already qualified
✅ Wrong tweet ID correctly rejected: Content verification failed
✅ Error handling working correctly

=== Demo Completed Successfully! ===
```

## 🔍 Contract Verification

After deployment, verify contracts on Etherscan:

```bash
# Implementation contract
forge verify-contract <IMPLEMENTATION_ADDRESS> src/QuestSystem.sol:QuestSystem --chain-id <CHAIN_ID>

# MockPrimusZKTLS (if deployed)
forge verify-contract <MOCK_ZKTLS_ADDRESS> src/mocks/MockPrimusZKTLS.sol:MockPrimusZKTLS --constructor-args $(cast abi-encode "constructor(address)" <VERIFIER_ADDRESS>) --chain-id <CHAIN_ID>

# Proxy contract
forge verify-contract <PROXY_ADDRESS> @openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol:ERC1967Proxy --chain-id <CHAIN_ID>
```

## 🎮 Frontend Integration

After deployment, use the proxy address for frontend integration:

```javascript
const questSystemAddress = "0x..."; // QUEST_SYSTEM_ADDRESS from .env
const questSystem = new ethers.Contract(questSystemAddress, QuestSystemABI, provider);

// Get active quests
const activeQuests = await questSystem.getQuestsByStatus(1, 0, 10); // Status.Active

// Get user statistics
const userStats = await questSystem.getUserStatistics(userAddress);

// Check if user can claim
const [canClaim, reason] = await questSystem.canUserClaimReward(questId, userAddress);
```

## 🔒 Security Notes

- **Private Keys**: Never commit private keys to version control
- **Environment Variables**: Use secure environment variable management
- **Mainnet Deployment**: Always test on testnets first
- **Upgrade Safety**: Test upgrades thoroughly on testnets
- **Contract Verification**: Always verify contracts after deployment

## 🛠 Troubleshooting

### Common Issues

1. **"QUEST_SYSTEM_ADDRESS not set"**
   - Set the environment variable after deployment
   - Copy the proxy address from deployment logs

2. **"insufficient funds for gas"**
   - Ensure deployer account has enough native tokens
   - Consider using `--slow` flag for mainnet

3. **Verification failures**
   - Ensure correct chain ID and contract addresses
   - Use the exact compiler version from foundry.toml

4. **Demo failures**
   - Ensure contracts are deployed first
   - Check environment variables are set correctly

For more help, check the test files for additional usage examples.