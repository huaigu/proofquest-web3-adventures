// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/QuestSystem.sol";
import "../src/mocks/MockPrimusZKTLS.sol";

/**
 * @title QuestStatusTest
 * @notice Test suite specifically for quest status logic improvements
 * @dev Tests the new time-based status determination instead of manual status setting
 */
contract QuestStatusTest is Test {
    QuestSystem public questSystem;
    MockPrimusZKTLS public mockZKTLS;
    
    address public owner;
    address public sponsor;
    address public user1;
    
    uint256 constant REWARD_PER_USER = 0.1 ether;
    uint256 constant TOTAL_REWARDS = 1 ether;
    string constant TARGET_TWEET_ID = "1942933687978365289";
    
    function setUp() public {
        owner = makeAddr("owner");
        sponsor = makeAddr("sponsor");
        user1 = makeAddr("user1");
        
        vm.deal(sponsor, 10 ether);
        vm.deal(user1, 10 ether);
        
        mockZKTLS = new MockPrimusZKTLS(makeAddr("verifier"));
        
        // Deploy QuestSystem directly
        questSystem = new QuestSystem(address(mockZKTLS));
    }
    
    function test_QuestStatusIsTimeBasedNotStored() public {
        // Create a quest with specific timing
        uint256 startTime = block.timestamp + 100;
        uint256 endTime = startTime + 200;
        uint256 claimEndTime = endTime + 300;
        
        QuestSystem.Quest memory quest = _createQuest(startTime, endTime, claimEndTime);
        
        vm.prank(sponsor);
        questSystem.createQuest{value: TOTAL_REWARDS}(quest);
        uint256 questId = 1;
        
        // Test 1: Before startTime - should be Pending
        vm.warp(startTime - 1);
        QuestSystem.Quest memory storedQuest = questSystem.getQuest(questId);
        assertEq(uint(storedQuest.status), uint(QuestSystem.QuestStatus.Pending), "Should be Pending before startTime");
        
        // Test 2: At startTime - should be Active
        vm.warp(startTime);
        storedQuest = questSystem.getQuest(questId);
        assertEq(uint(storedQuest.status), uint(QuestSystem.QuestStatus.Active), "Should be Active at startTime");
        
        // Test 3: Between startTime and endTime - should be Active
        vm.warp(startTime + 50);
        storedQuest = questSystem.getQuest(questId);
        assertEq(uint(storedQuest.status), uint(QuestSystem.QuestStatus.Active), "Should be Active between start and end");
        
        // Test 4: After endTime but before claimEndTime - should be Ended
        vm.warp(endTime + 1);
        storedQuest = questSystem.getQuest(questId);
        assertEq(uint(storedQuest.status), uint(QuestSystem.QuestStatus.Ended), "Should be Ended after endTime");
        
        // Test 5: After claimEndTime - should be Closed
        vm.warp(claimEndTime + 1);
        storedQuest = questSystem.getQuest(questId);
        assertEq(uint(storedQuest.status), uint(QuestSystem.QuestStatus.Closed), "Should be Closed after claimEndTime");
    }
    
    function test_CanceledStatusOverridesTimeBasedStatus() public {
        uint256 startTime = block.timestamp + 100;
        uint256 endTime = startTime + 200;
        uint256 claimEndTime = endTime + 300;
        
        QuestSystem.Quest memory quest = _createQuest(startTime, endTime, claimEndTime);
        
        vm.prank(sponsor);
        questSystem.createQuest{value: TOTAL_REWARDS}(quest);
        uint256 questId = 1;
        
        // Cancel the quest while it's still pending
        vm.prank(sponsor);
        questSystem.cancelQuest(questId);
        
        // Test that even after we pass various time thresholds, status remains Canceled
        vm.warp(startTime);
        QuestSystem.Quest memory storedQuest = questSystem.getQuest(questId);
        assertEq(uint(storedQuest.status), uint(QuestSystem.QuestStatus.Canceled), "Should remain Canceled at startTime");
        
        vm.warp(endTime + 1);
        storedQuest = questSystem.getQuest(questId);
        assertEq(uint(storedQuest.status), uint(QuestSystem.QuestStatus.Canceled), "Should remain Canceled after endTime");
        
        vm.warp(claimEndTime + 1);
        storedQuest = questSystem.getQuest(questId);
        assertEq(uint(storedQuest.status), uint(QuestSystem.QuestStatus.Canceled), "Should remain Canceled after claimEndTime");
    }
    
    function test_QuestStatusInViewFunctions() public {
        uint256 startTime = block.timestamp + 100;
        uint256 endTime = startTime + 200;
        uint256 claimEndTime = endTime + 300;
        
        QuestSystem.Quest memory quest = _createQuest(startTime, endTime, claimEndTime);
        
        vm.prank(sponsor);
        questSystem.createQuest{value: TOTAL_REWARDS}(quest);
        uint256 questId = 1;
        
        // Test getQuestDetails returns correct status
        vm.warp(startTime);
        (
            QuestSystem.Quest memory questDetails,
            QuestSystem.QuestStatus currentStatus,
            ,,,
        ) = questSystem.getQuestDetails(questId);
        
        assertEq(uint(currentStatus), uint(QuestSystem.QuestStatus.Active), "getQuestDetails should return Active status");
        assertEq(uint(questDetails.status), uint(QuestSystem.QuestStatus.Active), "Quest details should have Active status");
        
        // Test getMultipleQuests returns correct status
        uint256[] memory questIds = new uint256[](1);
        questIds[0] = questId;
        
        QuestSystem.Quest[] memory quests = questSystem.getMultipleQuests(questIds);
        assertEq(uint(quests[0].status), uint(QuestSystem.QuestStatus.Active), "getMultipleQuests should return Active status");
    }
    
    function test_QuestStatusInFilteringFunctions() public {
        uint256 startTime = block.timestamp + 100;
        uint256 endTime = startTime + 200;
        uint256 claimEndTime = endTime + 300;
        
        QuestSystem.Quest memory quest = _createQuest(startTime, endTime, claimEndTime);
        
        vm.prank(sponsor);
        questSystem.createQuest{value: TOTAL_REWARDS}(quest);
        
        // Test getQuestsByStatus filters correctly based on time
        vm.warp(startTime - 1);
        (uint256[] memory pendingQuests,) = questSystem.getQuestsByStatus(QuestSystem.QuestStatus.Pending, 0, 10);
        assertEq(pendingQuests.length, 1, "Should find 1 pending quest");
        
        vm.warp(startTime);
        (uint256[] memory activeQuests,) = questSystem.getQuestsByStatus(QuestSystem.QuestStatus.Active, 0, 10);
        assertEq(activeQuests.length, 1, "Should find 1 active quest");
        
        (pendingQuests,) = questSystem.getQuestsByStatus(QuestSystem.QuestStatus.Pending, 0, 10);
        assertEq(pendingQuests.length, 0, "Should find 0 pending quests");
        
        vm.warp(endTime + 1);
        (uint256[] memory endedQuests,) = questSystem.getQuestsByStatus(QuestSystem.QuestStatus.Ended, 0, 10);
        assertEq(endedQuests.length, 1, "Should find 1 ended quest");
        
        (activeQuests,) = questSystem.getQuestsByStatus(QuestSystem.QuestStatus.Active, 0, 10);
        assertEq(activeQuests.length, 0, "Should find 0 active quests");
    }
    
    function _createQuest(uint256 _startTime, uint256 _endTime, uint256 _claimEndTime) internal pure returns (QuestSystem.Quest memory) {
        QuestSystem.VerificationParams memory params = QuestSystem.VerificationParams({
            apiUrlPattern: "https://x.com/i/api/graphql/",
            apiEndpointHash: "FJGOFKfjA67MmT4I9p1qZg",
            proofValidityPeriod: 24 hours,
            targetLikeRetweetId: TARGET_TWEET_ID,
            favoritedJsonPath: "favorited",
            retweetedJsonPath: "retweeted",
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
            title: "Test Quest",
            description: "Test Description",
            launch_page: "https://test.com",
            questType: QuestSystem.QuestType.LikeAndRetweet,
            status: QuestSystem.QuestStatus.Pending, // Will be determined by time
            verificationParams: params,
            totalRewards: TOTAL_REWARDS,
            rewardPerUser: REWARD_PER_USER,
            maxParticipants: 0,
            participantCount: 0,
            startTime: _startTime,
            endTime: _endTime,
            claimEndTime: _claimEndTime,
            isVesting: false,
            vestingDuration: 0
        });
    }
}