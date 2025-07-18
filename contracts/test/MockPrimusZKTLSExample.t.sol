// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "forge-std/Test.sol";
import "../src/mocks/MockPrimusZKTLS.sol";
import "../src/mocks/SimpleQuestSystem.sol";
import {IPrimusZKTLS, Attestation} from "../lib/zktls-contracts/src/IPrimusZKTLS.sol";

/**
 * @title MockPrimusZKTLSExample
 * @notice Simple example demonstrating how to use MockPrimusZKTLS for testing
 */
contract MockPrimusZKTLSExampleTest is Test {
    MockPrimusZKTLS public mockZKTLS;
    SimpleQuestSystem public questSystem;
    
    address public owner = makeAddr("owner");
    address public sponsor = makeAddr("sponsor");
    address public user = makeAddr("user");

    function setUp() public {
        // 1. Deploy MockPrimusZKTLS
        mockZKTLS = new MockPrimusZKTLS(makeAddr("verifier"));
        
        // 2. Deploy QuestSystem with mock
        questSystem = new SimpleQuestSystem(IPrimusZKTLS(address(mockZKTLS)), owner);
        
        // 3. Give sponsor some ETH
        vm.deal(sponsor, 10 ether);
    }

    /// @notice Example: Test successful Like & Retweet quest
    function test_ExampleSuccessfulLikeRetweetQuest() public {
        // Step 1: Configure mock to always pass verification
        mockZKTLS.setVerificationMode(MockPrimusZKTLS.VerificationMode.AlwaysPass);
        
        // Step 2: Create a Like & Retweet quest
        SimpleQuestSystem.Quest memory quest = _createSampleLikeRetweetQuest();
        
        vm.prank(sponsor);
        questSystem.createQuest{value: 1 ether}(quest);
        
        // Step 3: Create attestation proving user liked and retweeted
        Attestation memory attestation = mockZKTLS.createLikeRetweetAttestation(
            user,                      // Recipient
            "1942933687978365289",     // Target tweet ID
            true,                      // User favorited the tweet
            true                       // User retweeted the tweet
        );
        
        // Step 4: User claims reward
        uint256 balanceBefore = user.balance;
        vm.prank(user);
        questSystem.claimReward(1, attestation);
        
        // Step 5: Verify reward was received
        assertEq(user.balance, balanceBefore + 0.1 ether);
        assertTrue(questSystem.hasUserQualified(1, user));
    }

    /// @notice Example: Test failed quest due to missing like
    function test_ExampleFailedQuestMissingLike() public {
        // Step 1: Use realistic verification (will check content)
        mockZKTLS.setVerificationMode(MockPrimusZKTLS.VerificationMode.SimulateRealWorld);
        
        // Step 2: Create quest requiring both like and retweet
        SimpleQuestSystem.Quest memory quest = _createSampleLikeRetweetQuest();
        
        vm.prank(sponsor);
        questSystem.createQuest{value: 1 ether}(quest);
        
        // Step 3: Create attestation with retweet but NO like
        Attestation memory attestation = mockZKTLS.createLikeRetweetAttestation(
            user,
            "1942933687978365289",
            false,                     // User did NOT favorite (missing requirement)
            true                       // User retweeted
        );
        
        // Step 4: Expect claim to fail due to missing like
        vm.prank(user);
        vm.expectRevert(SimpleQuestSystem.QuestSystem__ContentVerificationFailed.selector);
        questSystem.claimReward(1, attestation);
    }

    /// @notice Example: Test configurable verification per attestation
    function test_ExampleConfigurableVerification() public {
        // Step 1: Use configurable mode
        mockZKTLS.setVerificationMode(MockPrimusZKTLS.VerificationMode.Configurable);
        
        SimpleQuestSystem.Quest memory quest = _createSampleLikeRetweetQuest();
        vm.prank(sponsor);
        questSystem.createQuest{value: 1 ether}(quest);
        
        // Step 2: Create attestation
        Attestation memory attestation = mockZKTLS.createLikeRetweetAttestation(
            user,
            "1942933687978365289",
            true,
            true
        );
        
        bytes32 attestationId = mockZKTLS.getAttestationId(attestation);
        
        // Step 3: Initially should fail (default is false)
        vm.prank(user);
        vm.expectRevert(SimpleQuestSystem.QuestSystem__AttestationVerificationFailed.selector);
        questSystem.claimReward(1, attestation);
        
        // Step 4: Configure this specific attestation to pass
        mockZKTLS.setAttestationResult(attestationId, true);
        
        // Step 5: Now it should succeed
        uint256 balanceBefore = user.balance;
        vm.prank(user);
        questSystem.claimReward(1, attestation);
        assertEq(user.balance, balanceBefore + 0.1 ether);
    }

    /// @notice Example: Test Quote Tweet quest
    function test_ExampleQuoteTweetQuest() public {
        mockZKTLS.setVerificationMode(MockPrimusZKTLS.VerificationMode.SimulateRealWorld);
        
        // Step 1: Create Quote Tweet quest
        SimpleQuestSystem.Quest memory quest = _createSampleQuoteTweetQuest();
        vm.prank(sponsor);
        questSystem.createQuest{value: 2 ether}(quest);
        
        // Step 2: Create attestation proving user quoted the target tweet
        Attestation memory attestation = mockZKTLS.createQuoteTweetAttestation(
            user,
            "1940381550228721818",     // User's quote tweet ID
            "1940372466486137302",     // Original tweet being quoted (matches quest target)
            "898091366260948992"       // User's Twitter ID
        );
        
        // Step 3: User claims reward
        uint256 balanceBefore = user.balance;
        vm.prank(user);
        questSystem.claimReward(1, attestation);
        
        // Step 4: Verify success
        assertEq(user.balance, balanceBefore + 0.2 ether);
        assertTrue(questSystem.hasUserQualified(1, user));
        assertTrue(questSystem.isQuoteTweetIdUsed(1, "1940381550228721818"));
    }

    /// @notice Example: Load and use real zkTLS data
    function test_ExampleRealDataIntegration() public {
        // Step 1: Load real zkTLS data (from actual ProofFavAndRetweet.json)
        string memory realData = '{"recipient":"0xB12a1f7035FdCBB4cC5Fa102C01346BD45439Adf","request":{"url":"https://x.com/i/api/graphql/FJGOFKfjA67MmT4I9p1qZg/TweetDetail?variables=%7B%22focalTweetId%22%3A%221942933687978365289%22%2C%22with_rux_injections%22%3Afalse%7D","header":"","method":"GET","body":""},"data":"{\\"favorited\\":\\"true\\",\\"retweeted\\":\\"true\\"}","timestamp":1752473912632,"additionParams":"{\\"algorithmType\\":\\"proxytls\\"}","signatures":["0x2c54ef20a94e5f892341bd47db97e9792eff8a273bdc732e914efd00e9e1356a5d06db1bf11daa8ea1ca0c7ac6917eafdd58db6f8490941236096500fd2a5b471b"],"extendedData":"{\\"favorited\\":\\"true\\",\\"retweeted\\":\\"true\\"}"}';
        
        mockZKTLS.loadTestData("ProofFavAndRetweet", realData);
        
        // Step 2: Verify data was stored correctly
        string memory retrievedData = mockZKTLS.getTestData("ProofFavAndRetweet");
        assertEq(retrievedData, realData);
        
        // Step 3: Use realistic verification with this data structure
        mockZKTLS.setVerificationMode(MockPrimusZKTLS.VerificationMode.SimulateRealWorld);
        
        SimpleQuestSystem.Quest memory quest = _createSampleLikeRetweetQuest();
        vm.prank(sponsor);
        questSystem.createQuest{value: 1 ether}(quest);
        
        // Step 4: Create attestation compatible with real data format
        Attestation memory attestation = mockZKTLS.createLikeRetweetAttestation(
            user,
            "1942933687978365289",     // Same tweet ID as in real data
            true,
            true
        );
        
        // Step 5: Should work with real data structure
        uint256 balanceBefore = user.balance;
        vm.prank(user);
        questSystem.claimReward(1, attestation);
        assertEq(user.balance, balanceBefore + 0.1 ether);
    }

    /// @notice Example: Debug verification failure
    function test_ExampleDebuggingVerification() public {
        mockZKTLS.setVerificationMode(MockPrimusZKTLS.VerificationMode.SimulateRealWorld);
        
        // Create attestation with potential issues
        Attestation memory attestation = mockZKTLS.createLikeRetweetAttestation(
            user,
            "1942933687978365289",
            true,
            true
        );
        
        // Debug the verification steps
        bool[] memory debugSteps = mockZKTLS.debugVerification(attestation);
        
        // Check each step
        assertTrue(debugSteps[0]); // Recipient should be valid
        assertTrue(debugSteps[1]); // Timestamp should be valid
        assertTrue(debugSteps[2]); // Timestamp should not be too old
        assertTrue(debugSteps[3]); // Should have attestors
        assertTrue(debugSteps[4]); // Signatures should match attestors
        assertTrue(debugSteps[5]); // Data should not be empty
        
        // Overall verification should pass (not revert)
        mockZKTLS.verifyAttestation(attestation);
    }

    // --- Helper Functions ---

    function _createSampleLikeRetweetQuest() internal view returns (SimpleQuestSystem.Quest memory) {
        return SimpleQuestSystem.Quest({
            id: 0,
            sponsor: sponsor,
            questType: SimpleQuestSystem.QuestType.LikeAndRetweet,
            status: SimpleQuestSystem.QuestStatus.Pending,
            verificationParams: SimpleQuestSystem.VerificationParams({
                apiUrlPattern: "https://x.com/i/api/graphql/",
                apiEndpointHash: "FJGOFKfjA67MmT4I9p1qZg",
                proofValidityPeriod: 3600,
                targetLikeRetweetId: "1942933687978365289",
                favoritedJsonPath: "$.data.favorited",
                retweetedJsonPath: "$.data.retweeted",
                requireFavorite: true,
                requireRetweet: true,
                targetQuotedTweetId: "",
                quotedStatusIdJsonPath: "",
                userIdJsonPath: "",
                quoteTweetIdJsonPath: ""
            }),
            totalRewards: 1 ether,
            rewardPerUser: 0.1 ether,
            maxParticipants: 10,
            participantCount: 0,
            startTime: block.timestamp,
            endTime: block.timestamp + 1 days,
            claimEndTime: block.timestamp + 2 days,
            isVesting: false,
            vestingDuration: 0
        });
    }

    function _createSampleQuoteTweetQuest() internal view returns (SimpleQuestSystem.Quest memory) {
        return SimpleQuestSystem.Quest({
            id: 0,
            sponsor: sponsor,
            questType: SimpleQuestSystem.QuestType.QuoteTweet,
            status: SimpleQuestSystem.QuestStatus.Pending,
            verificationParams: SimpleQuestSystem.VerificationParams({
                apiUrlPattern: "https://x.com/i/api/graphql/",
                apiEndpointHash: "FJGOFKfjA67MmT4I9p1qZg",
                proofValidityPeriod: 3600,
                targetLikeRetweetId: "",
                favoritedJsonPath: "",
                retweetedJsonPath: "",
                requireFavorite: false,
                requireRetweet: false,
                targetQuotedTweetId: "1940372466486137302",
                quotedStatusIdJsonPath: "$.data.quoted_status_id_str",
                userIdJsonPath: "$.data.user_id_str",
                quoteTweetIdJsonPath: "$.data.id_str"
            }),
            totalRewards: 2 ether,
            rewardPerUser: 0.2 ether,
            maxParticipants: 10,
            participantCount: 0,
            startTime: block.timestamp,
            endTime: block.timestamp + 1 days,
            claimEndTime: block.timestamp + 2 days,
            isVesting: false,
            vestingDuration: 0
        });
    }
}