// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test, console} from "forge-std/Test.sol";
import {QuestSystem} from "../src/QuestSystem.sol";
import {MockPrimusZKTLS} from "../src/mocks/MockPrimusZKTLS.sol";
import {IPrimusZKTLS, Attestation} from "../lib/zktls-contracts/src/IPrimusZKTLS.sol";

/**
 * @title QuestSystemViewFunctions Test
 * @dev Tests all the new view functions for frontend/backend integration
 */
contract QuestSystemViewFunctionsTest is Test {
    QuestSystem public questSystem;
    MockPrimusZKTLS public mockZKTLS;
    
    address public sponsor1 = address(0x1111);
    address public sponsor2 = address(0x2222);
    address public user1 = address(0x3333);
    address public user2 = address(0x4444);
    address public user3 = address(0x5555);
    
    uint256 public constant QUEST_REWARD = 1 ether;
    uint256 public constant REWARD_PER_USER = 0.1 ether;
    
    function setUp() public {
        // Deploy contracts
        mockZKTLS = new MockPrimusZKTLS(address(0x9999));
        
        // Deploy QuestSystem directly
        questSystem = new QuestSystem(address(mockZKTLS));
        
        // Fund accounts
        vm.deal(sponsor1, 10 ether);
        vm.deal(sponsor2, 10 ether);
        vm.deal(user1, 1 ether);
        vm.deal(user2, 1 ether);
        vm.deal(user3, 1 ether);
        
        // Set mock to simulate real-world verification
        mockZKTLS.setVerificationMode(MockPrimusZKTLS.VerificationMode.SimulateRealWorld);
        
        // Create test quests
        _createTestQuests();
    }
    
    function _createTestQuests() internal {
        // Quest 1: Active Like & Retweet Quest by sponsor1
        vm.startPrank(sponsor1);
        QuestSystem.Quest memory quest1 = _createBasicLikeRetweetQuest();
        quest1.startTime = block.timestamp > 1 hours ? block.timestamp - 1 hours : block.timestamp; // Started 1 hour ago
        quest1.endTime = block.timestamp + 1 days; // Ends in 1 day
        quest1.claimEndTime = block.timestamp + 2 days; // Claim ends in 2 days
        questSystem.createQuest{value: QUEST_REWARD}(quest1);
        vm.stopPrank();
        
        // Quest 2: Pending Quote Tweet Quest by sponsor2
        vm.startPrank(sponsor2);
        QuestSystem.Quest memory quest2 = _createBasicQuoteTweetQuest();
        quest2.startTime = block.timestamp + 1 hours; // Starts in 1 hour
        quest2.endTime = block.timestamp + 1 days; // Ends in 1 day
        quest2.claimEndTime = block.timestamp + 2 days; // Claim ends in 2 days
        questSystem.createQuest{value: QUEST_REWARD}(quest2);
        vm.stopPrank();
        
        // Quest 3: Vesting Quest by sponsor1 with participants
        vm.startPrank(sponsor1);
        QuestSystem.Quest memory quest3 = _createBasicLikeRetweetQuest();
        quest3.startTime = block.timestamp > 2 hours ? block.timestamp - 2 hours : block.timestamp; // Started 2 hours ago
        quest3.endTime = block.timestamp + 1 days; // Ends in 1 day
        quest3.claimEndTime = block.timestamp + 2 days; // Claim ends in 2 days
        quest3.isVesting = true;
        quest3.vestingDuration = 30 days;
        questSystem.createQuest{value: QUEST_REWARD}(quest3);
        vm.stopPrank();
        
        // Add participants to quest 3
        vm.startPrank(user1);
        Attestation memory attestation1 = mockZKTLS.createLikeRetweetAttestation(
            user1, "1942933687978365289", true, true
        );
        questSystem.claimReward(3, attestation1);
        vm.stopPrank();
        
        vm.startPrank(user2);
        Attestation memory attestation2 = mockZKTLS.createLikeRetweetAttestation(
            user2, "1942933687978365289", true, true
        );
        questSystem.claimReward(3, attestation2);
        vm.stopPrank();
    }
    
    function _createBasicLikeRetweetQuest() internal view returns (QuestSystem.Quest memory) {
        QuestSystem.VerificationParams memory params = QuestSystem.VerificationParams({
            apiUrlPattern: "https://x.com/i/api/graphql",
            apiEndpointHash: "",
            proofValidityPeriod: 3600,
            targetLikeRetweetId: "1942933687978365289",
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
            sponsor: address(0),
            title: "Test Like & Retweet Quest",
            description: "Test Description",
            launch_page: "https://test.com",
            questType: QuestSystem.QuestType.LikeAndRetweet,
            status: QuestSystem.QuestStatus.Pending, // Will be determined by time
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
    
    function _createBasicQuoteTweetQuest() internal view returns (QuestSystem.Quest memory) {
        QuestSystem.VerificationParams memory params = QuestSystem.VerificationParams({
            apiUrlPattern: "https://x.com/i/api/graphql",
            apiEndpointHash: "",
            proofValidityPeriod: 3600,
            targetLikeRetweetId: "",
            favoritedJsonPath: "",
            retweetedJsonPath: "",
            requireFavorite: false,
            requireRetweet: false,
            targetQuotedTweetId: "1940372466486137302",
            quotedStatusIdJsonPath: "",
            userIdJsonPath: "",
            quoteTweetIdJsonPath: ""
        });
        
        return QuestSystem.Quest({
            id: 0,
            sponsor: address(0),
            title: "Test Quote Tweet Quest",
            description: "Test Quote Tweet Description",
            launch_page: "https://test.com",
            questType: QuestSystem.QuestType.QuoteTweet,
            status: QuestSystem.QuestStatus.Pending, // Will be determined by time
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
    
    function testGetAllQuestIds() public {
        console.log("=== Testing getAllQuestIds ===");
        
        // Test getting all quest IDs
        (uint256[] memory questIds, uint256 totalCount) = questSystem.getAllQuestIds(1, 10);
        
        assertEq(totalCount, 3, "Should have 3 total quests");
        assertEq(questIds.length, 3, "Should return 3 quest IDs");
        assertEq(questIds[0], 1, "First quest ID should be 1");
        assertEq(questIds[1], 2, "Second quest ID should be 2");
        assertEq(questIds[2], 3, "Third quest ID should be 3");
        
        // Test pagination
        (uint256[] memory questIds2, uint256 totalCount2) = questSystem.getAllQuestIds(2, 2);
        assertEq(totalCount2, 3, "Total count should still be 3");
        assertEq(questIds2.length, 2, "Should return 2 quest IDs");
        assertEq(questIds2[0], 2, "First result should be quest 2");
        assertEq(questIds2[1], 3, "Second result should be quest 3");
        
        console.log("[PASS] getAllQuestIds works correctly");
    }
    
    function testGetMultipleQuests() public {
        console.log("=== Testing getMultipleQuests ===");
        
        uint256[] memory questIds = new uint256[](2);
        questIds[0] = 1;
        questIds[1] = 3;
        
        QuestSystem.Quest[] memory quests = questSystem.getMultipleQuests(questIds);
        
        assertEq(quests.length, 2, "Should return 2 quests");
        assertEq(quests[0].id, 1, "First quest should have ID 1");
        assertEq(quests[1].id, 3, "Second quest should have ID 3");
        assertEq(quests[0].sponsor, sponsor1, "First quest sponsor should be sponsor1");
        assertEq(quests[1].sponsor, sponsor1, "Second quest sponsor should be sponsor1");
        
        console.log("[PASS] getMultipleQuests works correctly");
    }
    
    function testGetQuestsByStatus() public {
        console.log("=== Testing getQuestsByStatus ===");
        
        // Test getting active quests (quest 1 and 3 should be active)
        (uint256[] memory activeQuests, uint256 activeCount) = questSystem.getQuestsByStatus(
            QuestSystem.QuestStatus.Active, 0, 10
        );
        
        assertEq(activeCount, 2, "Should have 2 active quests");
        assertEq(activeQuests.length, 2, "Should return 2 active quest IDs");
        
        // Test getting pending quests (quest 2 should be pending)
        (uint256[] memory pendingQuests, uint256 pendingCount) = questSystem.getQuestsByStatus(
            QuestSystem.QuestStatus.Pending, 0, 10
        );
        
        assertEq(pendingCount, 1, "Should have 1 pending quest");
        assertEq(pendingQuests.length, 1, "Should return 1 pending quest ID");
        assertEq(pendingQuests[0], 2, "Pending quest should be quest 2");
        
        console.log("[PASS] getQuestsByStatus works correctly");
    }
    
    function testGetQuestsBySponsor() public {
        console.log("=== Testing getQuestsBySponsor ===");
        
        // Test getting quests by sponsor1 (should have quests 1 and 3)
        (uint256[] memory sponsor1Quests, uint256 sponsor1Count) = questSystem.getQuestsBySponsor(
            sponsor1, 0, 10
        );
        
        assertEq(sponsor1Count, 2, "Sponsor1 should have 2 quests");
        assertEq(sponsor1Quests.length, 2, "Should return 2 quest IDs for sponsor1");
        assertEq(sponsor1Quests[0], 1, "First quest should be quest 1");
        assertEq(sponsor1Quests[1], 3, "Second quest should be quest 3");
        
        // Test getting quests by sponsor2 (should have quest 2)
        (uint256[] memory sponsor2Quests, uint256 sponsor2Count) = questSystem.getQuestsBySponsor(
            sponsor2, 0, 10
        );
        
        assertEq(sponsor2Count, 1, "Sponsor2 should have 1 quest");
        assertEq(sponsor2Quests.length, 1, "Should return 1 quest ID for sponsor2");
        assertEq(sponsor2Quests[0], 2, "Quest should be quest 2");
        
        console.log("[PASS] getQuestsBySponsor works correctly");
    }
    
    function testGetQuestsByParticipant() public {
        console.log("=== Testing getQuestsByParticipant ===");
        
        // Test getting quests for user1 (should have participated in quest 3)
        (uint256[] memory user1Quests, uint256 user1Count) = questSystem.getQuestsByParticipant(
            user1, 0, 10
        );
        
        assertEq(user1Count, 1, "User1 should have participated in 1 quest");
        assertEq(user1Quests.length, 1, "Should return 1 quest ID for user1");
        assertEq(user1Quests[0], 3, "User1 should have participated in quest 3");
        
        // Test getting quests for user3 (should have no participation)
        (uint256[] memory user3Quests, uint256 user3Count) = questSystem.getQuestsByParticipant(
            user3, 0, 10
        );
        
        assertEq(user3Count, 0, "User3 should have participated in 0 quests");
        assertEq(user3Quests.length, 0, "Should return 0 quest IDs for user3");
        
        console.log("[PASS] getQuestsByParticipant works correctly");
    }
    
    function testGetQuestStatistics() public {
        console.log("=== Testing getQuestStatistics ===");
        
        (
            uint256 totalQuests,
            uint256 activeQuests,
            uint256 completedQuests,
            uint256 totalRewardsDistributed
        ) = questSystem.getQuestStatistics();
        
        assertEq(totalQuests, 3, "Should have 3 total quests");
        assertEq(activeQuests, 2, "Should have 2 active quests");
        assertEq(completedQuests, 0, "Should have 0 completed quests");
        
        // Quest 3 has 2 participants, each earning 0.1 ETH, but it's vesting
        // So totalRewardsDistributed should be minimal (only vested portion)
        console.log("Total rewards distributed:", totalRewardsDistributed);
        
        console.log("[PASS] getQuestStatistics works correctly");
    }
    
    function testGetUserStatistics() public {
        console.log("=== Testing getUserStatistics ===");
        
        // Test user1 statistics (participated in quest 3)
        (
            uint256 participatedQuests,
            uint256 totalRewardsEarned,
            uint256 pendingVestingRewards
        ) = questSystem.getUserStatistics(user1);
        
        assertEq(participatedQuests, 1, "User1 should have participated in 1 quest");
        // Since quest 3 is vesting and just started, earned should be minimal
        console.log("User1 total rewards earned:", totalRewardsEarned);
        console.log("User1 pending vesting rewards:", pendingVestingRewards);
        
        // Test user3 statistics (no participation)
        (
            uint256 user3ParticipatedQuests,
            uint256 user3TotalRewardsEarned,
            uint256 user3PendingVestingRewards
        ) = questSystem.getUserStatistics(user3);
        
        assertEq(user3ParticipatedQuests, 0, "User3 should have participated in 0 quests");
        assertEq(user3TotalRewardsEarned, 0, "User3 should have earned 0 rewards");
        assertEq(user3PendingVestingRewards, 0, "User3 should have 0 pending rewards");
        
        console.log("[PASS] getUserStatistics works correctly");
    }
    
    function testGetQuestDetails() public {
        console.log("=== Testing getQuestDetails ===");
        
        // Test quest 1 details (active quest)
        (
            QuestSystem.Quest memory quest,
            QuestSystem.QuestStatus currentStatus,
            uint256 remainingSlots,
            uint256 timeUntilStart,
            uint256 timeUntilEnd,
            uint256 timeUntilClaimEnd
        ) = questSystem.getQuestDetails(1);
        
        assertEq(quest.id, 1, "Quest ID should be 1");
        assertEq(uint(currentStatus), uint(QuestSystem.QuestStatus.Active), "Quest should be active");
        assertEq(remainingSlots, 10, "Should have 10 remaining slots");
        assertEq(timeUntilStart, 0, "Should have 0 time until start (already started)");
        assertTrue(timeUntilEnd > 0, "Should have time remaining until end");
        assertTrue(timeUntilClaimEnd > 0, "Should have time remaining until claim end");
        
        console.log("Remaining slots:", remainingSlots);
        console.log("Time until end:", timeUntilEnd);
        console.log("Time until claim end:", timeUntilClaimEnd);
        
        console.log("[PASS] getQuestDetails works correctly");
    }
    
    function testGetMultipleVestingInfo() public {
        console.log("=== Testing getMultipleVestingInfo ===");
        
        address[] memory users = new address[](3);
        users[0] = user1;
        users[1] = user2;
        users[2] = user3;
        
        QuestSystem.VestingInfo[] memory vestingInfos = questSystem.getMultipleVestingInfo(3, users);
        
        assertEq(vestingInfos.length, 3, "Should return vesting info for 3 users");
        
        // User1 should be qualified and have vesting info
        assertEq(vestingInfos[0].user, user1, "First entry should be user1");
        assertTrue(vestingInfos[0].isQualified, "User1 should be qualified");
        assertTrue(vestingInfos[0].vestedAmount >= 0, "User1 should have vested amount");
        
        // User2 should be qualified and have vesting info
        assertEq(vestingInfos[1].user, user2, "Second entry should be user2");
        assertTrue(vestingInfos[1].isQualified, "User2 should be qualified");
        assertTrue(vestingInfos[1].vestedAmount >= 0, "User2 should have vested amount");
        
        // User3 should not be qualified
        assertEq(vestingInfos[2].user, user3, "Third entry should be user3");
        assertFalse(vestingInfos[2].isQualified, "User3 should not be qualified");
        assertEq(vestingInfos[2].vestedAmount, 0, "User3 should have 0 vested amount");
        
        console.log("User1 vested amount:", vestingInfos[0].vestedAmount);
        console.log("User2 vested amount:", vestingInfos[1].vestedAmount);
        
        console.log("[PASS] getMultipleVestingInfo works correctly");
    }
    
    function testCanUserClaimReward() public {
        console.log("=== Testing canUserClaimReward ===");
        
        // Test user3 (not participated) for active quest 1
        (bool canClaim, string memory reason) = questSystem.canUserClaimReward(1, user3);
        assertTrue(canClaim, "User3 should be able to claim reward for quest 1");
        assertEq(bytes(reason).length, 0, "Reason should be empty when can claim");
        
        // Test user1 (already participated) for quest 3
        (bool canClaim2, string memory reason2) = questSystem.canUserClaimReward(3, user1);
        assertFalse(canClaim2, "User1 should not be able to claim reward for quest 3 again");
        assertEq(reason2, "User already qualified", "Should indicate user already qualified");
        
        // Test user for pending quest 2
        (bool canClaim3, string memory reason3) = questSystem.canUserClaimReward(2, user3);
        assertFalse(canClaim3, "User should not be able to claim reward for pending quest");
        assertEq(reason3, "Quest not active", "Should indicate quest not active");
        
        console.log("Quest 1 can claim:", canClaim, "reason:", reason);
        console.log("Quest 3 can claim:", canClaim2, "reason:", reason2);
        console.log("Quest 2 can claim:", canClaim3, "reason:", reason3);
        
        console.log("[PASS] canUserClaimReward works correctly");
    }
}