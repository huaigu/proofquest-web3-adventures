# MockPrimusZKTLS - Comprehensive Testing Framework

## Overview

MockPrimusZKTLS is a feature-complete mock implementation of the IPrimusZKTLS interface designed for comprehensive testing of the QuestSystem contract. It provides configurable verification behavior, real zkTLS data format compatibility, and extensive helper functions for creating test scenarios.

## Features

### 🎯 Verification Modes

- **AlwaysPass**: Always returns true for `verifyAttestation`
- **AlwaysFail**: Always returns false for `verifyAttestation` 
- **Configurable**: Use per-attestation configuration via `setAttestationResult`
- **SimulateRealWorld**: Implements realistic verification logic with proper checks

### 📊 Real Data Format Compatibility

- Supports actual zkTLS data structures from ProofFavAndRetweet.json and ProofQuoteTweet.json
- Creates attestations that match production data formats
- Validates signatures, timestamps, URLs, and data structures

### 🛠️ Helper Functions

- `createLikeRetweetAttestation`: Generate Like & Retweet attestations
- `createQuoteTweetAttestation`: Generate Quote Tweet attestations
- `loadTestData`: Store real JSON test data for reference
- `debugVerification`: Step-by-step verification debugging

### ⚙️ Configuration Options

- Configurable verification results per attestation ID
- Signature verification result mapping
- Attestation usage tracking
- Batch configuration operations

## Usage Examples

### Basic Setup

```solidity
// Deploy mock
MockPrimusZKTLS mockZKTLS = new MockPrimusZKTLS(verifierAddress);

// Deploy quest system with mock
SimpleQuestSystem questSystem = new SimpleQuestSystem(
    IPrimusZKTLS(address(mockZKTLS)), 
    owner
);
```

### Testing Successful Quest Completion

```solidity
// Set to always pass verification
mockZKTLS.setVerificationMode(MockPrimusZKTLS.VerificationMode.AlwaysPass);

// Create valid attestation
Attestation memory attestation = mockZKTLS.createLikeRetweetAttestation(
    user,
    "1942933687978365289",
    true,  // favorited
    true   // retweeted
);

// User claims reward
questSystem.claimReward(questId, attestation);
```

### Testing Verification Failures

```solidity
// Test ZKTLS verification failure
mockZKTLS.setVerificationMode(MockPrimusZKTLS.VerificationMode.AlwaysFail);
vm.expectRevert(QuestSystem__AttestationVerificationFailed.selector);
questSystem.claimReward(questId, attestation);

// Test content verification failure (wrong tweet ID)
mockZKTLS.setVerificationMode(MockPrimusZKTLS.VerificationMode.SimulateRealWorld);
Attestation memory badAttestation = mockZKTLS.createLikeRetweetAttestation(
    user,
    "9999999999999999999", // Wrong tweet ID
    true,
    true
);
vm.expectRevert(QuestSystem__ContentVerificationFailed.selector);
questSystem.claimReward(questId, badAttestation);
```

### Configurable Per-Attestation Results

```solidity
mockZKTLS.setVerificationMode(MockPrimusZKTLS.VerificationMode.Configurable);

Attestation memory attestation = mockZKTLS.createLikeRetweetAttestation(/*...*/);
bytes32 attestationId = mockZKTLS.getAttestationId(attestation);

// Configure specific result
mockZKTLS.setAttestationResult(attestationId, true);
// Now this attestation will pass verification

mockZKTLS.setAttestationResult(attestationId, false);
// Now it will fail
```

### Real Data Integration

```solidity
// Load real zkTLS data
string memory realData = '{"recipient":"0x...","request":{...},"data":"{...}"}';
mockZKTLS.loadTestData("ProofFavAndRetweet", realData);

// Use real data in tests
string memory retrievedData = mockZKTLS.getTestData("ProofFavAndRetweet");
// Process and create attestations based on real data
```

### Quote Tweet Testing

```solidity
// Create quote tweet attestation
Attestation memory attestation = mockZKTLS.createQuoteTweetAttestation(
    user,
    "1940381550228721818", // User's quote tweet ID
    "1940372466486137302", // Original tweet being quoted
    "898091366260948992"   // User's Twitter ID
);

// Test quote tweet reuse prevention
vm.prank(user1);
questSystem.claimReward(questId, attestation);

// This should fail - same quote tweet ID
vm.prank(user2);
vm.expectRevert(QuestSystem__ContentVerificationFailed.selector);
questSystem.claimReward(questId, attestation);
```

### Batch Configuration

```solidity
bytes32[] memory attestationIds = new bytes32[](2);
bool[] memory results = new bool[](2);

attestationIds[0] = mockZKTLS.getAttestationId(attestation1);
attestationIds[1] = mockZKTLS.getAttestationId(attestation2);
results[0] = true;
results[1] = false;

mockZKTLS.batchSetAttestationResults(attestationIds, results);
```

### Debugging Failed Verifications

```solidity
Attestation memory attestation = /* create attestation */;
bool[] memory steps = mockZKTLS.debugVerification(attestation);

console.log("Step 0 (recipient):", steps[0]);
console.log("Step 1 (timestamp valid):", steps[1]);
console.log("Step 2 (timestamp not old):", steps[2]);
console.log("Step 3 (attestors not empty):", steps[3]);
console.log("Step 4 (signatures match):", steps[4]);
console.log("Step 5 (data not empty):", steps[5]);
```

## Verification Logic

### SimulateRealWorld Mode Checks

1. **Recipient**: Must not be zero address
2. **Timestamp**: Must be non-zero and not in future
3. **Age**: Must be within reasonable timeframe (24 hours in production, lenient in test environment)
4. **Attestors**: Must have at least one attestor
5. **Signatures**: Must match number of attestors and be at least 65 bytes
6. **Data**: Must not be empty
7. **URL**: Must contain "x.com" or "twitter.com"

### Content Verification

- **Like & Retweet**: Checks URL contains target tweet ID, validates favorited/retweeted status
- **Quote Tweet**: Validates quoted tweet ID matches target, prevents reuse of quote tweet IDs

## File Structure

```
contracts/src/mocks/
├── MockPrimusZKTLS.sol      # Main mock implementation
├── SimpleQuestSystem.sol    # Non-upgradeable QuestSystem for testing
└── README.md               # This documentation

contracts/test/
├── MockPrimusZKTLS.t.sol           # Unit tests for mock
└── QuestSystemWithMockZKTLS.t.sol  # Integration tests
```

## Testing Scenarios Covered

- ✅ Successful quest completion (Like & Retweet, Quote Tweet)
- ✅ ZKTLS verification failures
- ✅ Content verification failures (wrong tweet ID, missing actions)
- ✅ Quote tweet reuse prevention
- ✅ Multiple users on same quest
- ✅ Vesting quest mechanics
- ✅ Expired proof handling
- ✅ Configurable verification results
- ✅ Real data format compatibility
- ✅ Edge cases and error conditions

## Benefits for Testing

1. **Comprehensive Coverage**: Test all possible verification outcomes
2. **Deterministic**: Predictable behavior for consistent test results
3. **Fast**: No network calls or cryptographic operations
4. **Flexible**: Easily switch between different verification modes
5. **Realistic**: Maintains compatibility with real zkTLS data formats
6. **Debuggable**: Built-in debugging tools for troubleshooting

## Production vs Testing

This mock is designed specifically for testing. In production:
- Use the real PrimusZKTLS contract
- Actual cryptographic verification occurs
- Network calls to attestation services
- Real signature validation

The mock provides a testing environment that accurately simulates production behavior while maintaining full control over verification outcomes.