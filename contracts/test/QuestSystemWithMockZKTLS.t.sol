// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "forge-std/Test.sol";
import "forge-std/console.sol";
import "../src/mocks/SimpleQuestSystem.sol";
import "../src/mocks/MockPrimusZKTLS.sol";
import {IPrimusZKTLS, Attestation} from "../lib/zktls-contracts/src/IPrimusZKTLS.sol";

/**
 * @title QuestSystemWithMockZKTLS
 * @notice Comprehensive integration tests for QuestSystem using MockPrimusZKTLS
 * @dev This test suite demonstrates how to use MockPrimusZKTLS to test various quest scenarios
 */
contract QuestSystemWithMockZKTLSTest is Test {
    SimpleQuestSystem public questSystem;
    MockPrimusZKTLS public mockZKTLS;
    
    address public owner;
    address public sponsor;
    address public user1;
    address public user2;
    address public verifier;

    // Sample quest parameters
    SimpleQuestSystem.Quest public sampleLikeRetweetQuest;
    SimpleQuestSystem.Quest public sampleQuoteTweetQuest;

    function setUp() public {
        owner = makeAddr("owner");
        sponsor = makeAddr("sponsor");
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");
        verifier = makeAddr("verifier");

        // Deploy MockPrimusZKTLS
        mockZKTLS = new MockPrimusZKTLS(verifier);

        // Deploy SimpleQuestSystem
        questSystem = new SimpleQuestSystem(IPrimusZKTLS(address(mockZKTLS)), owner);

        // Setup sample quests
        _setupSampleQuests();

        // Give sponsor some ETH
        vm.deal(sponsor, 10 ether);
        vm.deal(user1, 1 ether);
        vm.deal(user2, 1 ether);
    }

    function _setupSampleQuests() internal {
        // Like & Retweet Quest
        sampleLikeRetweetQuest = SimpleQuestSystem.Quest({
            id: 0,
            sponsor: sponsor,
            questType: SimpleQuestSystem.QuestType.LikeAndRetweet,
            status: SimpleQuestSystem.QuestStatus.Pending,
            verificationParams: SimpleQuestSystem.VerificationParams({
                apiUrlPattern: "https://x.com/i/api/graphql/",
                apiEndpointHash: "FJGOFKfjA67MmT4I9p1qZg",
                proofValidityPeriod: 3600, // 1 hour
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

        // Quote Tweet Quest
        sampleQuoteTweetQuest = SimpleQuestSystem.Quest({
            id: 0,
            sponsor: sponsor,
            questType: SimpleQuestSystem.QuestType.QuoteTweet,
            status: SimpleQuestSystem.QuestStatus.Pending,
            verificationParams: SimpleQuestSystem.VerificationParams({
                apiUrlPattern: "https://x.com/i/api/graphql/",
                apiEndpointHash: "FJGOFKfjA67MmT4I9p1qZg",
                proofValidityPeriod: 3600, // 1 hour
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

    // --- Test: Successful Like & Retweet Quest ---

    function test_SuccessfulLikeRetweetQuest() public {
        // Configure mock to always pass verification
        mockZKTLS.setVerificationMode(MockPrimusZKTLS.VerificationMode.AlwaysPass);

        // Create quest
        vm.prank(sponsor);
        questSystem.createQuest{value: 1 ether}(sampleLikeRetweetQuest);

        // Create valid attestation for user1
        Attestation memory attestation = mockZKTLS.createLikeRetweetAttestation(
            user1,
            "1942933687978365289",
            true,  // favorited
            true   // retweeted
        );

        // User1 claims reward
        uint256 balanceBefore = user1.balance;
        vm.prank(user1);
        questSystem.claimReward(1, attestation);

        // Check reward was transferred
        assertEq(user1.balance, balanceBefore + 0.1 ether);
        assertTrue(questSystem.hasUserQualified(1, user1));

        // Check quest state
        SimpleQuestSystem.Quest memory quest = questSystem.getQuest(1);
        assertEq(quest.participantCount, 1);
    }

    function test_FailedLikeRetweetQuest_MissingLike() public {
        // Configure mock to use real-world verification
        mockZKTLS.setVerificationMode(MockPrimusZKTLS.VerificationMode.SimulateRealWorld);

        // Create quest
        vm.prank(sponsor);
        questSystem.createQuest{value: 1 ether}(sampleLikeRetweetQuest);

        // Create attestation without like (favorited = false)
        Attestation memory attestation = mockZKTLS.createLikeRetweetAttestation(
            user1,
            "1942933687978365289",
            false, // NOT favorited
            true   // retweeted
        );

        // User1 tries to claim reward but should fail
        vm.prank(user1);
        vm.expectRevert(SimpleQuestSystem.QuestSystem__ContentVerificationFailed.selector);
        questSystem.claimReward(1, attestation);
    }

    function test_FailedLikeRetweetQuest_WrongTweetId() public {
        mockZKTLS.setVerificationMode(MockPrimusZKTLS.VerificationMode.SimulateRealWorld);

        vm.prank(sponsor);
        questSystem.createQuest{value: 1 ether}(sampleLikeRetweetQuest);

        // Create attestation with wrong tweet ID
        Attestation memory attestation = mockZKTLS.createLikeRetweetAttestation(
            user1,
            "9999999999999999999", // Wrong tweet ID
            true,
            true
        );

        vm.prank(user1);
        vm.expectRevert(SimpleQuestSystem.QuestSystem__ContentVerificationFailed.selector);
        questSystem.claimReward(1, attestation);
    }

    // --- Test: Successful Quote Tweet Quest ---

    function test_SuccessfulQuoteTweetQuest() public {
        mockZKTLS.setVerificationMode(MockPrimusZKTLS.VerificationMode.SimulateRealWorld);

        vm.prank(sponsor);
        questSystem.createQuest{value: 2 ether}(sampleQuoteTweetQuest);

        // Create valid quote tweet attestation
        Attestation memory attestation = mockZKTLS.createQuoteTweetAttestation(
            user1,
            "1940381550228721818", // User's quote tweet ID
            "1940372466486137302", // Original tweet being quoted (matches quest target)
            "898091366260948992"   // User's Twitter ID
        );

        uint256 balanceBefore = user1.balance;
        vm.prank(user1);
        questSystem.claimReward(1, attestation);

        assertEq(user1.balance, balanceBefore + 0.2 ether);
        assertTrue(questSystem.hasUserQualified(1, user1));
        assertTrue(questSystem.isQuoteTweetIdUsed(1, "1940381550228721818"));
    }

    function test_FailedQuoteTweetQuest_WrongOriginalTweet() public {
        mockZKTLS.setVerificationMode(MockPrimusZKTLS.VerificationMode.SimulateRealWorld);

        vm.prank(sponsor);
        questSystem.createQuest{value: 2 ether}(sampleQuoteTweetQuest);

        // Create attestation quoting wrong original tweet
        Attestation memory attestation = mockZKTLS.createQuoteTweetAttestation(
            user1,
            "1940381550228721818",
            "9999999999999999999", // Wrong original tweet ID
            "898091366260948992"
        );

        vm.prank(user1);
        vm.expectRevert(SimpleQuestSystem.QuestSystem__ContentVerificationFailed.selector);
        questSystem.claimReward(1, attestation);
    }

    function test_FailedQuoteTweetQuest_ReuseQuoteTweet() public {
        mockZKTLS.setVerificationMode(MockPrimusZKTLS.VerificationMode.SimulateRealWorld);

        vm.prank(sponsor);
        questSystem.createQuest{value: 2 ether}(sampleQuoteTweetQuest);

        Attestation memory attestation = mockZKTLS.createQuoteTweetAttestation(
            user1,
            "1940381550228721818",
            "1940372466486137302",
            "898091366260948992"
        );

        // User1 claims successfully
        vm.prank(user1);
        questSystem.claimReward(1, attestation);

        // User2 tries to use the same quote tweet ID (should fail)
        Attestation memory sameAttestation = mockZKTLS.createQuoteTweetAttestation(
            user2,
            "1940381550228721818", // Same quote tweet ID
            "1940372466486137302",
            "123456789" // Different user ID
        );

        vm.prank(user2);
        vm.expectRevert(SimpleQuestSystem.QuestSystem__ContentVerificationFailed.selector);
        questSystem.claimReward(1, sameAttestation);
    }

    // --- Test: ZKTLS Verification Failure ---

    function test_ZKTLSVerificationFailure() public {
        // Configure mock to always fail ZKTLS verification
        mockZKTLS.setVerificationMode(MockPrimusZKTLS.VerificationMode.AlwaysFail);

        vm.prank(sponsor);
        questSystem.createQuest{value: 1 ether}(sampleLikeRetweetQuest);

        Attestation memory attestation = mockZKTLS.createLikeRetweetAttestation(
            user1,
            "1942933687978365289",
            true,
            true
        );

        vm.prank(user1);
        vm.expectRevert(SimpleQuestSystem.QuestSystem__AttestationVerificationFailed.selector);
        questSystem.claimReward(1, attestation);
    }

    // --- Test: Configurable Verification Results ---

    function test_ConfigurableVerificationResults() public {
        mockZKTLS.setVerificationMode(MockPrimusZKTLS.VerificationMode.Configurable);

        vm.prank(sponsor);
        questSystem.createQuest{value: 1 ether}(sampleLikeRetweetQuest);

        Attestation memory attestation = mockZKTLS.createLikeRetweetAttestation(
            user1,
            "1942933687978365289",
            true,
            true
        );

        bytes32 attestationId = mockZKTLS.getAttestationId(attestation);

        // Initially should fail (default false)
        vm.prank(user1);
        vm.expectRevert(SimpleQuestSystem.QuestSystem__AttestationVerificationFailed.selector);
        questSystem.claimReward(1, attestation);

        // Configure to pass
        mockZKTLS.setAttestationResult(attestationId, true);

        // Now should succeed
        uint256 balanceBefore = user1.balance;
        vm.prank(user1);
        questSystem.claimReward(1, attestation);
        assertEq(user1.balance, balanceBefore + 0.1 ether);
    }

    // --- Test: Real Data Integration ---

    function test_RealDataIntegration() public {
        // Load real test data
        string memory realFavRetweetData = '{"recipient":"0xB12a1f7035FdCBB4cC5Fa102C01346BD45439Adf","request":{"url":"https://x.com/i/api/graphql/FJGOFKfjA67MmT4I9p1qZg/TweetDetail?variables=%7B%22focalTweetId%22%3A%221942933687978365289%22%2C%22with_rux_injections%22%3Afalse%7D","header":"","method":"GET","body":""},"data":"{\\"favorited\\":\\"true\\",\\"retweeted\\":\\"true\\"}","timestamp":1752473912632,"additionParams":"{\\"algorithmType\\":\\"proxytls\\"}","signatures":["0x2c54ef20a94e5f892341bd47db97e9792eff8a273bdc732e914efd00e9e1356a5d06db1bf11daa8ea1ca0c7ac6917eafdd58db6f8490941236096500fd2a5b471b"],"extendedData":"{\\"favorited\\":\\"true\\",\\"retweeted\\":\\"true\\"}"}';
        
        mockZKTLS.loadTestData("ProofFavAndRetweet", realFavRetweetData);
        
        // Verify data was loaded
        string memory retrievedData = mockZKTLS.getTestData("ProofFavAndRetweet");
        assertEq(retrievedData, realFavRetweetData);

        // Test with real data structure
        mockZKTLS.setVerificationMode(MockPrimusZKTLS.VerificationMode.SimulateRealWorld);

        vm.prank(sponsor);
        questSystem.createQuest{value: 1 ether}(sampleLikeRetweetQuest);

        // Create attestation matching real data structure
        Attestation memory attestation = mockZKTLS.createLikeRetweetAttestation(
            user1,
            "1942933687978365289",
            true,
            true
        );

        uint256 balanceBefore = user1.balance;
        vm.prank(user1);
        questSystem.claimReward(1, attestation);
        
        assertEq(user1.balance, balanceBefore + 0.1 ether);
    }

    // --- Test: Multiple Users Same Quest ---

    function test_MultipleUsersLikeRetweetQuest() public {
        mockZKTLS.setVerificationMode(MockPrimusZKTLS.VerificationMode.SimulateRealWorld);

        vm.prank(sponsor);
        questSystem.createQuest{value: 1 ether}(sampleLikeRetweetQuest);

        // User1 claims
        Attestation memory attestation1 = mockZKTLS.createLikeRetweetAttestation(
            user1,
            "1942933687978365289",
            true,
            true
        );

        vm.prank(user1);
        questSystem.claimReward(1, attestation1);

        // User2 claims (different attestation)
        Attestation memory attestation2 = mockZKTLS.createLikeRetweetAttestation(
            user2,
            "1942933687978365289",
            true,
            true
        );

        vm.prank(user2);
        questSystem.claimReward(1, attestation2);

        // Both should have received rewards
        assertTrue(questSystem.hasUserQualified(1, user1));
        assertTrue(questSystem.hasUserQualified(1, user2));

        SimpleQuestSystem.Quest memory quest = questSystem.getQuest(1);
        assertEq(quest.participantCount, 2);
    }

    // --- Test: Vesting Quest ---

    function test_VestingQuest() public {
        mockZKTLS.setVerificationMode(MockPrimusZKTLS.VerificationMode.SimulateRealWorld);

        // Create vesting quest
        SimpleQuestSystem.Quest memory vestingQuest = sampleLikeRetweetQuest;
        vestingQuest.isVesting = true;
        vestingQuest.vestingDuration = 1 days;

        vm.prank(sponsor);
        questSystem.createQuest{value: 1 ether}(vestingQuest);

        // User qualifies
        Attestation memory attestation = mockZKTLS.createLikeRetweetAttestation(
            user1,
            "1942933687978365289",
            true,
            true
        );

        uint256 balanceBefore = user1.balance;
        vm.prank(user1);
        questSystem.claimReward(1, attestation);

        // Balance should not change immediately (vesting)
        assertEq(user1.balance, balanceBefore);
        assertTrue(questSystem.hasUserQualified(1, user1));

        // Fast forward time and claim vesting reward
        vm.warp(block.timestamp + 12 hours); // 50% vested

        vm.prank(user1);
        questSystem.claimVestingReward(1);

        // Should receive ~50% of reward
        uint256 expectedAmount = 0.05 ether; // Approximately 50% of 0.1 ETH
        assertApproxEqAbs(user1.balance, balanceBefore + expectedAmount, 0.01 ether);
    }

    // --- Edge Cases ---

    function test_ExpiredProof() public {
        mockZKTLS.setVerificationMode(MockPrimusZKTLS.VerificationMode.SimulateRealWorld);

        // Create quest with short proof validity
        SimpleQuestSystem.Quest memory shortValidityQuest = sampleLikeRetweetQuest;
        shortValidityQuest.verificationParams.proofValidityPeriod = 1; // 1 second

        vm.prank(sponsor);
        questSystem.createQuest{value: 1 ether}(shortValidityQuest);

        Attestation memory attestation = mockZKTLS.createLikeRetweetAttestation(
            user1,
            "1942933687978365289",
            true,
            true
        );

        // Fast forward past proof validity
        vm.warp(block.timestamp + 2);

        vm.prank(user1);
        vm.expectRevert(SimpleQuestSystem.QuestSystem__ContentVerificationFailed.selector);
        questSystem.claimReward(1, attestation);
    }
}