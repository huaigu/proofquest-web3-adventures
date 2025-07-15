# Quest System Test Guide

## Overview
This guide explains how to test the QuestSystem smart contract integration using the `/test` page.

## Contract Information
- **QuestSystem Address**: `0x3EA01F942B527fCaB13B6Ff21E91c8fdd0086BB1`
- **PrimusZKTLS Address**: `0x3760aB354507a29a9F5c65A66C74353fd86393FA`
- **Network**: Sepolia Testnet
- **Target Tweet ID**: `1942933687978365289`

## Prerequisites
1. **Wallet Setup**: 
   - MetaMask or compatible wallet
   - Sepolia ETH for gas fees
   - Get Sepolia ETH from https://faucets.chain.link/

2. **Environment Variables**:
   - Ensure `.env` file contains the correct contract addresses
   - Set `VITE_WALLETCONNECT_PROJECT_ID` if using WalletConnect

## Test Flow

### 1. Access Test Page
- Navigate to `/test` in the application
- This will open the Quest System Test interface

### 2. Network Setup
- The page will detect your current network
- If not on Sepolia, click "Switch to Sepolia" button
- Ensure you have enough Sepolia ETH for transactions

### 3. Create LikeAndRetweet Quest

#### Form Fields:
- **Total Rewards**: Amount in ETH (e.g., 0.1 ETH)
- **Reward Per User**: Amount per participant (e.g., 0.01 ETH)
- **Require Like/Favorite**: Checkbox to require like action
- **Require Retweet**: Checkbox to require retweet action

#### Quest Parameters:
- **Quest Type**: Automatically set to `LikeAndRetweet` (type 0)
- **Start Time**: Set to current time for immediate testing
- **End Time**: Set to 7 days from creation
- **Claim End Time**: Set to 14 days from creation

#### Verification Parameters (Auto-populated):
```javascript
{
  apiUrlPattern: "https://x.com/i/api/graphql/",
  apiEndpointHash: "FJGOFKfjA67MmT4I9p1qZg",
  proofValidityPeriod: 3600, // 1 hour
  targetLikeRetweetId: "1942933687978365289",
  favoritedJsonPath: "$.data.threaded_conversation_with_injections_v2.instructions[0].entries[0].content.itemContent.tweet_results.result.legacy.favorited",
  retweetedJsonPath: "$.data.threaded_conversation_with_injections_v2.instructions[0].entries[0].content.itemContent.tweet_results.result.legacy.retweeted"
}
```

### 4. Quest Creation Process
1. Click "Create Quest" button
2. Confirm the transaction in your wallet
3. Wait for transaction confirmation
4. The quest ID will be automatically retrieved
5. Quest details will be displayed in the right panel

### 5. Claim Reward

#### Mock Attestation Data:
The system uses mock attestation data from `ProofFavAndRetweet.json`:
```json
{
  "recipient": "0xB12a1f7035FdCBB4cC5Fa102C01346BD45439Adf",
  "data": "{\"favorited\":\"true\",\"retweeted\":\"true\"}",
  "timestamp": 1752473912632
}
```

#### Claiming Process:
1. After quest creation, click "Claim Reward" button
2. The system will use the mock attestation with your wallet address
3. Confirm the transaction in your wallet
4. Wait for transaction confirmation
5. Quest participant count will increase
6. Reward will be transferred to your address

### 6. Verification

#### Check Quest Status:
- View quest details in the right panel
- Monitor participant count changes
- Check reward distribution status

#### Check Wallet Balance:
- Confirm ETH balance increase after claiming
- Verify transaction on Sepolia Etherscan

## Mock Data Details

### Tweet Information
- **Tweet ID**: `1942933687978365289`
- **API URL**: Contains GraphQL endpoint for TweetDetail
- **Actions**: Both favorite and retweet are set to `true`

### Attestation Structure
The mock attestation simulates real zkTLS proof data:
- **Recipient**: Updated to claimer's address
- **Request**: Original Twitter API request
- **Data**: JSON containing favorited and retweeted status
- **Attestors**: Mock attestor address
- **Signatures**: Mock signature data

## Common Issues

### 1. Transaction Failures
- **Insufficient Gas**: Ensure you have enough Sepolia ETH
- **Network Issues**: Verify connection to Sepolia
- **Contract Errors**: Check if quest is active and not full

### 2. Quest Creation Issues
- **Invalid Parameters**: Ensure reward amounts are positive
- **Time Validation**: Check that start < end < claim end times
- **Wallet Connection**: Verify wallet is connected and on Sepolia

### 3. Claim Failures
- **Already Claimed**: Each address can only claim once per quest
- **Quest Inactive**: Quest must be in Active status
- **Reward Pool Empty**: Check if quest has available rewards

## Next Steps

After successful testing:
1. **zkTLS Integration**: Replace mock attestation with real zkTLS proofs
2. **Backend Integration**: Add quest metadata storage
3. **UI Enhancement**: Integrate with existing quest creation flow
4. **Production Deployment**: Deploy to mainnet with proper configurations

## Contract Functions Used

### createQuest
```solidity
function createQuest(Quest calldata _quest) external payable
```

### claimReward
```solidity
function claimReward(uint256 _questId, Attestation calldata _attestation) external
```

### getQuest
```solidity
function getQuest(uint256 _questId) external view returns (Quest memory)
```

### getNextQuestId
```solidity
function getNextQuestId() external view returns (uint256)
```

## Testing Checklist

- [ ] Wallet connected to Sepolia
- [ ] Sufficient Sepolia ETH balance
- [ ] Quest creation successful
- [ ] Quest details displayed correctly
- [ ] Reward claim successful
- [ ] Participant count increased
- [ ] ETH balance increased
- [ ] Transaction confirmations received

## Support

For issues or questions:
1. Check browser console for error messages
2. Verify network connection and wallet status
3. Review transaction details on Sepolia Etherscan
4. Ensure contract addresses are correct in environment variables