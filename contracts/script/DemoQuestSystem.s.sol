// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {QuestSystem} from "../src/QuestSystem.sol";
import {MockPrimusZKTLS} from "../src/mocks/MockPrimusZKTLS.sol";
import {IPrimusZKTLS, Attestation} from "../lib/zktls-contracts/src/IPrimusZKTLS.sol";

/**
 * @title DemoQuestSystem Script
 * @dev Demonstrates the complete ProofQuest workflow with real scenarios
 * @notice Run after deployment: forge script script/DemoQuestSystem.s.sol --rpc-url <RPC_URL> --broadcast
 */
contract DemoQuestSystemScript is Script {
    QuestSystem public questSystem;
    MockPrimusZKTLS public mockZKTLS;
    
    // Demo accounts
    address public sponsor;
    address public user1;
    address public user2;
    address public user3;
    
    // Demo constants
    uint256 constant QUEST_REWARD = 1 ether;
    uint256 constant REWARD_PER_USER = 0.1 ether;
    string constant TARGET_TWEET_ID = "1942933687978365289";
    string constant QUOTED_TWEET_ID = "1940372466486137302";

    function setUp() public {}

    function run() public {
        // Load contract addresses
        address questSystemAddress = vm.envOr("QUEST_SYSTEM_ADDRESS", address(0));
        address primusZKTLSAddress = vm.envOr("PRIMUS_ZKTLS_ADDRESS", address(0));
        
        // If PRIMUS_ZKTLS_ADDRESS is not set, try MOCK_ZKTLS_ADDRESS
        if (primusZKTLSAddress == address(0)) {
            primusZKTLSAddress = vm.envOr("MOCK_ZKTLS_ADDRESS", address(0));
        }
        
        require(questSystemAddress != address(0), "QUEST_SYSTEM_ADDRESS not set");
        require(primusZKTLSAddress != address(0), "Neither PRIMUS_ZKTLS_ADDRESS nor MOCK_ZKTLS_ADDRESS set");
        
        questSystem = QuestSystem(payable(questSystemAddress));
        mockZKTLS = MockPrimusZKTLS(primusZKTLSAddress);
        
        // Setup demo accounts
        _setupAccounts();
        
        console.log("=== ProofQuest Demo Started ===");
        console.log("QuestSystem:", address(questSystem));
        console.log("MockPrimusZKTLS:", address(mockZKTLS));
        console.log("Sponsor:", sponsor);
        console.log("Users:", user1, user2, user3);
        
        // Run demo scenarios
        _demoBasicQuestFlow();
        _demoVestingQuest();
        _demoQuoteTweetQuest();
        _demoViewFunctions();
        _demoErrorScenarios();
        
        console.log("\n=== Demo Completed Successfully! ===");
    }

    function _setupAccounts() internal {
        // Use deterministic addresses for consistent demo
        sponsor = address(0x1111111111111111111111111111111111111111);
        user1 = address(0x2222222222222222222222222222222222222222);
        user2 = address(0x3333333333333333333333333333333333333333);
        user3 = address(0x4444444444444444444444444444444444444444);
        
        // Fund accounts with ETH for demo
        vm.deal(sponsor, 10 ether);
        vm.deal(user1, 1 ether);
        vm.deal(user2, 1 ether);
        vm.deal(user3, 1 ether);
        
        // Configure MockPrimusZKTLS for realistic simulation
        mockZKTLS.setVerificationMode(MockPrimusZKTLS.VerificationMode.SimulateRealWorld);
    }

    function _demoBasicQuestFlow() internal {
        console.log("\n=== Demo 1: Basic Like & Retweet Quest ===");
        
        // 1. Sponsor creates a quest
        vm.startPrank(sponsor);
        QuestSystem.Quest memory quest = _createLikeRetweetQuest();
        questSystem.createQuest{value: QUEST_REWARD}(quest);
        uint256 questId = 1;
        vm.stopPrank();
        
        console.log("[SUCCESS] Quest created with ID:", questId);
        console.log("   Reward pool:", QUEST_REWARD / 1e18, "ETH");
        console.log("   Reward per user:", REWARD_PER_USER / 1e18, "ETH");
        
        // 2. Users participate in the quest
        uint256 user1BalanceBefore = user1.balance;
        vm.startPrank(user1);
        Attestation memory attestation1 = mockZKTLS.createLikeRetweetAttestation(
            user1, TARGET_TWEET_ID, true, true
        );
        questSystem.claimReward(questId, attestation1);
        vm.stopPrank();
        
        uint256 user1BalanceAfter = user1.balance;
        console.log("[SUCCESS] User1 claimed reward:", (user1BalanceAfter - user1BalanceBefore) / 1e18, "ETH");
        
        // 3. Check quest statistics
        QuestSystem.Quest memory storedQuest = questSystem.getQuest(questId);
        console.log("   Participants:", storedQuest.participantCount);
        console.log("   Remaining slots:", storedQuest.maxParticipants - storedQuest.participantCount);
        
        // 4. Second user participates
        vm.startPrank(user2);
        Attestation memory attestation2 = mockZKTLS.createLikeRetweetAttestation(
            user2, TARGET_TWEET_ID, true, true
        );
        questSystem.claimReward(questId, attestation2);
        vm.stopPrank();
        
        console.log("[SUCCESS] User2 also claimed reward successfully");
        console.log("   Total participants now:", questSystem.getQuest(questId).participantCount);
    }

    function _demoVestingQuest() internal {
        console.log("\n=== Demo 2: Vesting Quest ===");
        
        // Create vesting quest
        vm.startPrank(sponsor);
        QuestSystem.Quest memory vestingQuest = _createLikeRetweetQuest();
        vestingQuest.isVesting = true;
        vestingQuest.vestingDuration = 30 days;
        questSystem.createQuest{value: QUEST_REWARD}(vestingQuest);
        uint256 questId = 2;
        vm.stopPrank();
        
        console.log("[SUCCESS] Vesting quest created with ID:", questId);
        console.log("   Vesting duration:", vestingQuest.vestingDuration / 1 days, "days");
        
        // User participates in vesting quest
        vm.startPrank(user1);
        Attestation memory attestation = mockZKTLS.createLikeRetweetAttestation(
            user1, TARGET_TWEET_ID, true, true
        );
        questSystem.claimReward(questId, attestation);
        vm.stopPrank();
        
        console.log("[SUCCESS] User1 qualified for vesting quest");
        
        // Check initial vesting info
        (uint256 vestedAmount, uint256 claimedAmount, uint256 claimableAmount) = 
            questSystem.getVestingInfo(questId, user1);
        
        console.log("   Initial vested amount:", vestedAmount / 1e18, "ETH");
        console.log("   Claimable amount:", claimableAmount / 1e18, "ETH");
        
        // Simulate time passage and claim vesting rewards
        vm.warp(block.timestamp + 1 days); // Fast forward 1 day
        
        vm.startPrank(user1);
        uint256 balanceBefore = user1.balance;
        questSystem.claimVestingReward(questId);
        uint256 balanceAfter = user1.balance;
        vm.stopPrank();
        
        console.log("[SUCCESS] User1 claimed vesting reward after 1 day:", (balanceAfter - balanceBefore) / 1e18, "ETH");
    }

    function _demoQuoteTweetQuest() internal {
        console.log("\n=== Demo 3: Quote Tweet Quest ===");
        
        // Create quote tweet quest
        vm.startPrank(sponsor);
        QuestSystem.Quest memory quoteQuest = _createQuoteTweetQuest();
        questSystem.createQuest{value: QUEST_REWARD}(quoteQuest);
        uint256 questId = 3;
        vm.stopPrank();
        
        console.log("[SUCCESS] Quote tweet quest created with ID:", questId);
        console.log("   Target tweet to quote:", QUOTED_TWEET_ID);
        
        // User creates quote tweet and claims reward
        vm.startPrank(user1);
        Attestation memory quoteAttestation = mockZKTLS.createQuoteTweetAttestation(
            user1, 
            "1940381550228721818", // User's quote tweet ID
            QUOTED_TWEET_ID,        // Original tweet being quoted
            "898091366260948992"    // User's Twitter ID
        );
        
        uint256 balanceBefore = user1.balance;
        questSystem.claimReward(questId, quoteAttestation);
        uint256 balanceAfter = user1.balance;
        vm.stopPrank();
        
        console.log("[SUCCESS] User1 claimed quote tweet reward:", (balanceAfter - balanceBefore) / 1e18, "ETH");
        
        // Verify quote tweet is marked as used
        bool isUsed = questSystem.isQuoteTweetIdUsed(questId, "1940381550228721818");
        console.log("   Quote tweet marked as used:", isUsed);
    }

    function _demoViewFunctions() internal {
        console.log("\n=== Demo 4: View Functions for Frontend Integration ===");
        
        // 1. Get all quest IDs
        (uint256[] memory questIds, uint256 totalCount) = questSystem.getAllQuestIds(1, 10);
        console.log("[SUCCESS] Total quests created:", totalCount);
        console.log("   Quest IDs:", questIds[0], questIds[1], questIds[2]);
        
        // 2. Get quests by sponsor
        (uint256[] memory sponsorQuests,) = questSystem.getQuestsBySponsor(sponsor, 0, 10);
        console.log("[SUCCESS] Sponsor has", sponsorQuests.length, "quests");
        
        // 3. Get user participation
        (uint256[] memory userQuests,) = questSystem.getQuestsByParticipant(user1, 0, 10);
        console.log("[SUCCESS] User1 participated in", userQuests.length, "quests");
        
        // 4. Get platform statistics
        (
            uint256 totalQuests,
            uint256 activeQuests,
            uint256 completedQuests,
            uint256 totalRewardsDistributed
        ) = questSystem.getQuestStatistics();
        
        console.log("[SUCCESS] Platform Statistics:");
        console.log("   Total quests:", totalQuests);
        console.log("   Active quests:", activeQuests);
        console.log("   Completed quests:", completedQuests);
        console.log("   Total rewards distributed:", totalRewardsDistributed / 1e18, "ETH");
        
        // 5. Get user statistics
        (
            uint256 participatedQuests,
            uint256 totalRewardsEarned,
            uint256 pendingVestingRewards
        ) = questSystem.getUserStatistics(user1);
        
        console.log("[SUCCESS] User1 Statistics:");
        console.log("   Participated quests:", participatedQuests);
        console.log("   Total rewards earned:", totalRewardsEarned / 1e18, "ETH");
        console.log("   Pending vesting rewards:", pendingVestingRewards / 1e18, "ETH");
        
        // 6. Get detailed quest info
        (
            QuestSystem.Quest memory quest,
            QuestSystem.QuestStatus currentStatus,
            uint256 remainingSlots,
            uint256 timeUntilStart,
            uint256 timeUntilEnd,
            uint256 timeUntilClaimEnd
        ) = questSystem.getQuestDetails(1);
        
        console.log("[SUCCESS] Quest 1 Details:");
        console.log("   Status:", uint(currentStatus));
        console.log("   Remaining slots:", remainingSlots);
        console.log("   Time until end:", timeUntilEnd / 1 hours, "hours");
    }

    function _demoErrorScenarios() internal {
        console.log("\n=== Demo 5: Error Handling Scenarios ===");
        
        // 1. Try to claim reward twice
        vm.startPrank(user1);
        Attestation memory attestation = mockZKTLS.createLikeRetweetAttestation(
            user1, TARGET_TWEET_ID, true, true
        );
        
        try questSystem.claimReward(1, attestation) {
            console.log("[ERROR] Unexpected: Double claim should fail");
        } catch Error(string memory errorReason) {
            console.log("[SUCCESS] Double claim correctly rejected:", errorReason);
        }
        vm.stopPrank();
        
        // 2. Check if user can claim reward
        (bool canClaim, string memory reason) = questSystem.canUserClaimReward(1, user3);
        console.log("[SUCCESS] User3 can claim quest 1:", canClaim);
        if (!canClaim) {
            console.log("   Reason:", reason);
        }
        
        // 3. Try to claim with wrong tweet ID
        vm.startPrank(user3);
        Attestation memory wrongAttestation = mockZKTLS.createLikeRetweetAttestation(
            user3, "9999999999999999999", true, true // Wrong tweet ID
        );
        
        try questSystem.claimReward(1, wrongAttestation) {
            console.log("[ERROR] Unexpected: Wrong tweet ID should fail");
        } catch Error(string memory failReason) {
            console.log("[SUCCESS] Wrong tweet ID correctly rejected:", failReason);
        }
        vm.stopPrank();
        
        console.log("[SUCCESS] Error handling working correctly");
    }

    // Helper functions to create quest structs
    function _createLikeRetweetQuest() internal view returns (QuestSystem.Quest memory) {
        QuestSystem.VerificationParams memory params = QuestSystem.VerificationParams({
            apiUrlPattern: "https://x.com/i/api/graphql",
            apiEndpointHash: "",
            proofValidityPeriod: 3600,
            targetLikeRetweetId: TARGET_TWEET_ID,
            favoritedJsonPath: "",
            retweetedJsonPath: "",
            requireFavorite: true,
            requireRetweet: true,
            targetQuotedTweetId: "",
            quotedStatusIdJsonPath: "",
            userIdJsonPath: "",
            quoteTweetIdJsonPath: ""
        });
        
        return QuestSystem.Quest({
            id: 0,
            sponsor: sponsor,
            title: "Like and Retweet Quest",
            description: "Like and retweet the target tweet to earn rewards",
            launch_page: "https://x.com/target_tweet",
            questType: QuestSystem.QuestType.LikeAndRetweet,
            status: QuestSystem.QuestStatus.Pending,
            verificationParams: params,
            totalRewards: QUEST_REWARD,
            rewardPerUser: REWARD_PER_USER,
            maxParticipants: 0,
            participantCount: 0,
            startTime: block.timestamp,
            endTime: block.timestamp + 1 days,
            claimEndTime: block.timestamp + 2 days,
            isVesting: false,
            vestingDuration: 0
        });
    }
    
    function _createQuoteTweetQuest() internal view returns (QuestSystem.Quest memory) {
        QuestSystem.VerificationParams memory params = QuestSystem.VerificationParams({
            apiUrlPattern: "https://x.com/i/api/graphql",
            apiEndpointHash: "",
            proofValidityPeriod: 3600,
            targetLikeRetweetId: "",
            favoritedJsonPath: "",
            retweetedJsonPath: "",
            requireFavorite: false,
            requireRetweet: false,
            targetQuotedTweetId: QUOTED_TWEET_ID,
            quotedStatusIdJsonPath: "",
            userIdJsonPath: "",
            quoteTweetIdJsonPath: ""
        });
        
        return QuestSystem.Quest({
            id: 0,
            sponsor: sponsor,
            title: "Quote Tweet Quest",
            description: "Quote the target tweet to earn rewards",
            launch_page: "https://x.com/target_quote_tweet",
            questType: QuestSystem.QuestType.QuoteTweet,
            status: QuestSystem.QuestStatus.Pending,
            verificationParams: params,
            totalRewards: QUEST_REWARD,
            rewardPerUser: REWARD_PER_USER,
            maxParticipants: 0,
            participantCount: 0,
            startTime: block.timestamp,
            endTime: block.timestamp + 1 days,
            claimEndTime: block.timestamp + 2 days,
            isVesting: false,
            vestingDuration: 0
        });
    }
}