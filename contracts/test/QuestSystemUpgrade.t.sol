// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test, console} from "forge-std/Test.sol";
import {QuestSystem} from "../src/QuestSystem.sol";
import {MockPrimusZKTLS} from "../src/mocks/MockPrimusZKTLS.sol";
import {IPrimusZKTLS, Attestation} from "../lib/zktls-contracts/src/IPrimusZKTLS.sol";
import {ERC1967Proxy} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

/**
 * @title QuestSystemUpgrade Test
 * @dev Comprehensive tests for UUPS upgrade functionality
 */
contract QuestSystemUpgradeTest is Test {
    QuestSystem public questSystemProxy;
    QuestSystem public questSystemImpl;
    MockPrimusZKTLS public mockZKTLS;
    
    address public owner;
    address public sponsor;
    address public user1;
    address public user2;
    address public verifier;
    
    // Test constants
    uint256 constant QUEST_REWARD = 1 ether;
    uint256 constant REWARD_PER_USER = 0.1 ether;
    string constant TARGET_TWEET_ID = "1942933687978365289";
    
    event QuestCreated(uint256 indexed questId, address indexed sponsor, uint256 totalRewards);
    event RewardClaimed(uint256 indexed questId, address indexed recipient, uint256 amount);
    event Upgraded(address indexed implementation);

    function setUp() public {
        // Setup test accounts
        owner = address(this);
        sponsor = makeAddr("sponsor");
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");
        verifier = makeAddr("verifier");
        
        // Deploy MockPrimusZKTLS
        mockZKTLS = new MockPrimusZKTLS(verifier);
        mockZKTLS.setVerificationMode(MockPrimusZKTLS.VerificationMode.AlwaysPass);
        
        // Deploy QuestSystem implementation
        questSystemImpl = new QuestSystem();
        
        // Deploy proxy with initialization
        bytes memory initData = abi.encodeWithSelector(
            QuestSystem.initialize.selector,
            address(mockZKTLS)
        );
        
        ERC1967Proxy proxy = new ERC1967Proxy(
            address(questSystemImpl),
            initData
        );
        
        questSystemProxy = QuestSystem(payable(address(proxy)));
        
        // Fund test accounts
        vm.deal(sponsor, 10 ether);
        vm.deal(user1, 1 ether);
        vm.deal(user2, 1 ether);
    }
    
    function test_InitialState() public view {
        // Verify initial state
        assertEq(questSystemProxy.owner(), owner);
        assertEq(address(questSystemProxy.primusZKTLS()), address(mockZKTLS));
        assertEq(questSystemProxy.getNextQuestId(), 1);
    }
    
    function test_BasicUpgrade() public {
        // Create a quest before upgrade to test state preservation
        _createBasicQuest();
        
        // Store state before upgrade
        uint256 nextQuestIdBefore = questSystemProxy.getNextQuestId();
        address ownerBefore = questSystemProxy.owner();
        QuestSystem.Quest memory questBefore = questSystemProxy.getQuest(1);
        
        // Deploy new implementation
        QuestSystem newImpl = new QuestSystem();
        
        // Perform upgrade
        questSystemProxy.upgradeToAndCall(
            address(newImpl),
            "" // No additional initialization
        );
        
        // Verify state preservation
        assertEq(questSystemProxy.getNextQuestId(), nextQuestIdBefore);
        assertEq(questSystemProxy.owner(), ownerBefore);
        
        QuestSystem.Quest memory questAfter = questSystemProxy.getQuest(1);
        assertEq(questAfter.id, questBefore.id);
        assertEq(questAfter.sponsor, questBefore.sponsor);
        assertEq(questAfter.totalRewards, questBefore.totalRewards);
        assertEq(questAfter.participantCount, questBefore.participantCount);
        
        // Verify contract still functions after upgrade
        _verifyContractFunctionality();
    }
    
    function test_UpgradeWithActiveQuest() public {
        // Create and participate in quest
        _createBasicQuest();
        
        // User participates
        vm.prank(user1);
        Attestation memory attestation = mockZKTLS.createLikeRetweetAttestation(
            user1, TARGET_TWEET_ID, true, true
        );
        vm.warp(block.timestamp + 1); // Move to quest start time
        questSystemProxy.claimReward(1, attestation);
        
        // Store participation state
        bool qualified = questSystemProxy.hasUserQualified(1, user1);
        assertTrue(qualified);
        
        // Upgrade
        QuestSystem newImpl = new QuestSystem();
        questSystemProxy.upgradeToAndCall(address(newImpl), "");
        
        // Verify participation state preserved
        assertTrue(questSystemProxy.hasUserQualified(1, user1));
        
        // Verify second user can still participate
        vm.prank(user2);
        Attestation memory attestation2 = mockZKTLS.createLikeRetweetAttestation(
            user2, TARGET_TWEET_ID, true, true
        );
        questSystemProxy.claimReward(1, attestation2);
        
        assertTrue(questSystemProxy.hasUserQualified(1, user2));
    }
    
    function test_UpgradeToV2WithNewFeatures() public {
        // Create quest and participate
        _createBasicQuest();
        
        vm.warp(block.timestamp + 1); // Move to quest start time
        vm.prank(user1);
        Attestation memory attestation = mockZKTLS.createLikeRetweetAttestation(
            user1, TARGET_TWEET_ID, true, true
        );
        questSystemProxy.claimReward(1, attestation);
        
        // Deploy QuestSystemV2
        QuestSystemV2 newImpl = new QuestSystemV2();
        
        // Upgrade to V2
        questSystemProxy.upgradeToAndCall(address(newImpl), "");
        
        // Cast to V2 interface
        QuestSystemV2 questV2 = QuestSystemV2(payable(address(questSystemProxy)));
        
        // Test new V2 functionality
        assertEq(questV2.newFeatureEnabled(), 0);
        assertEq(questV2.userReputationScore(user1), 0);
        
        // Enable new feature
        questV2.enableNewFeature();
        assertGt(questV2.newFeatureEnabled(), 0);
        
        // Test reputation update
        questV2.updateUserReputation(user1, 100);
        assertEq(questV2.userReputationScore(user1), 100);
        
        // Test enhanced claim function
        uint256 balanceBefore = user2.balance;
        vm.prank(user2);
        Attestation memory attestation2 = mockZKTLS.createLikeRetweetAttestation(
            user2, TARGET_TWEET_ID, true, true
        );
        questV2.claimRewardWithReputation(1, attestation2);
        
        // Verify reputation was increased
        assertEq(questV2.userReputationScore(user2), 10);
        assertGt(user2.balance, balanceBefore);
    }
    
    function test_UpgradeWithVestingQuest() public {
        // Create vesting quest
        vm.prank(sponsor);
        QuestSystem.Quest memory quest = _createQuestStruct();
        quest.isVesting = true;
        quest.vestingDuration = 30 days;
        questSystemProxy.createQuest{value: QUEST_REWARD}(quest);
        
        // User participates
        vm.warp(block.timestamp + 1); // Move to quest start time
        vm.prank(user1);
        Attestation memory attestation = mockZKTLS.createLikeRetweetAttestation(
            user1, TARGET_TWEET_ID, true, true
        );
        questSystemProxy.claimReward(1, attestation);
        
        // Fast forward time
        vm.warp(block.timestamp + 1 days);
        
        // Store vesting info before upgrade
        (uint256 vestedBefore, uint256 claimedBefore, uint256 claimableBefore) = 
            questSystemProxy.getVestingInfo(1, user1);
        
        // Upgrade
        QuestSystem newImpl = new QuestSystem();
        questSystemProxy.upgradeToAndCall(address(newImpl), "");
        
        // Verify vesting info preserved
        (uint256 vestedAfter, uint256 claimedAfter, uint256 claimableAfter) = 
            questSystemProxy.getVestingInfo(1, user1);
        
        assertEq(vestedAfter, vestedBefore);
        assertEq(claimedAfter, claimedBefore);
        assertEq(claimableAfter, claimableBefore);
        
        // Verify vesting claim still works
        uint256 balanceBefore = user1.balance;
        vm.prank(user1);
        questSystemProxy.claimVestingReward(1);
        assertGt(user1.balance, balanceBefore);
    }
    
    function test_UnauthorizedUpgrade() public {
        // Try to upgrade from non-owner account
        QuestSystem newImpl = new QuestSystem();
        
        vm.prank(user1);
        vm.expectRevert();
        questSystemProxy.upgradeToAndCall(address(newImpl), "");
    }
    
    function test_UpgradeEvents() public {
        QuestSystem newImpl = new QuestSystem();
        
        // Expect Upgraded event
        vm.expectEmit(true, false, false, false);
        emit Upgraded(address(newImpl));
        
        questSystemProxy.upgradeToAndCall(address(newImpl), "");
    }
    
    function test_MultipleUpgrades() public {
        _createBasicQuest();
        
        // First upgrade
        QuestSystem impl1 = new QuestSystem();
        questSystemProxy.upgradeToAndCall(address(impl1), "");
        
        // Verify functionality
        _verifyContractFunctionality();
        
        // Second upgrade to V2
        QuestSystemV2 impl2 = new QuestSystemV2();
        questSystemProxy.upgradeToAndCall(address(impl2), "");
        
        // Cast and test V2 features
        QuestSystemV2 questV2 = QuestSystemV2(payable(address(questSystemProxy)));
        questV2.enableNewFeature();
        assertGt(questV2.newFeatureEnabled(), 0);
        
        // Third upgrade back to regular version
        QuestSystem impl3 = new QuestSystem();
        questSystemProxy.upgradeToAndCall(address(impl3), "");
        
        // Verify original functionality still works
        _verifyContractFunctionality();
    }
    
    function test_UpgradePreservesViewFunctions() public {
        // Create multiple quests
        _createBasicQuest();
        _createBasicQuest();
        
        // Get data before upgrade
        (uint256[] memory questIds, uint256 totalCount) = questSystemProxy.getAllQuestIds(1, 10);
        (uint256 total, uint256 active, uint256 completed, uint256 distributed) = 
            questSystemProxy.getQuestStatistics();
        
        // Upgrade
        QuestSystem newImpl = new QuestSystem();
        questSystemProxy.upgradeToAndCall(address(newImpl), "");
        
        // Verify view functions return same data
        (uint256[] memory questIdsAfter, uint256 totalCountAfter) = questSystemProxy.getAllQuestIds(1, 10);
        (uint256 totalAfter, uint256 activeAfter, uint256 completedAfter, uint256 distributedAfter) = 
            questSystemProxy.getQuestStatistics();
        
        assertEq(totalCount, totalCountAfter);
        assertEq(questIds.length, questIdsAfter.length);
        assertEq(total, totalAfter);
        assertEq(active, activeAfter);
    }
    
    function test_UpgradeOwnershipTransfer() public {
        address newOwner = makeAddr("newOwner");
        
        // Transfer ownership before upgrade
        questSystemProxy.transferOwnership(newOwner);
        
        // Verify ownership transferred
        assertEq(questSystemProxy.owner(), newOwner);
        
        // Upgrade from new owner
        vm.prank(newOwner);
        QuestSystem newImpl = new QuestSystem();
        questSystemProxy.upgradeToAndCall(address(newImpl), "");
        
        // Verify ownership preserved after upgrade
        assertEq(questSystemProxy.owner(), newOwner);
    }
    
    function test_UpgradeStorageSlotConsistency() public {
        // Set some state
        _createBasicQuest();
        
        // Get storage values using low-level calls
        bytes32 nextQuestIdSlot = vm.load(address(questSystemProxy), bytes32(uint256(0x65))); // Approximate slot
        
        // Upgrade
        QuestSystem newImpl = new QuestSystem();
        questSystemProxy.upgradeToAndCall(address(newImpl), "");
        
        // Verify storage layout hasn't changed (implementation should be compatible)
        uint256 nextQuestId = questSystemProxy.getNextQuestId();
        assertEq(nextQuestId, 2); // Should be 2 after creating one quest
    }
    
    // Helper functions
    function _createBasicQuest() internal {
        vm.prank(sponsor);
        QuestSystem.Quest memory quest = _createQuestStruct();
        questSystemProxy.createQuest{value: QUEST_REWARD}(quest);
    }
    
    function _createQuestStruct() internal view returns (QuestSystem.Quest memory) {
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
    
    function _verifyContractFunctionality() internal {
        // Test that contract still functions correctly after upgrade
        uint256 questCount = questSystemProxy.getNextQuestId() - 1;
        
        // Create another quest
        vm.prank(sponsor);
        QuestSystem.Quest memory quest = _createQuestStruct();
        questSystemProxy.createQuest{value: QUEST_REWARD}(quest);
        
        // Verify quest creation
        assertEq(questSystemProxy.getNextQuestId(), questCount + 2);
        
        // Test quest details
        QuestSystem.Quest memory storedQuest = questSystemProxy.getQuest(questCount + 1);
        assertEq(storedQuest.sponsor, sponsor);
        assertEq(storedQuest.totalRewards, QUEST_REWARD);
    }
}

/**
 * @title QuestSystemV2 Example Implementation
 * @dev Example of an upgraded contract with new features
 */
contract QuestSystemV2 is QuestSystem {
    // New storage variables (must be appended)
    uint256 public newFeatureEnabled;
    mapping(address => uint256) public userReputationScore;
    
    event NewFeatureAdded(string feature);
    event ReputationUpdated(address user, uint256 score);
    
    function enableNewFeature() external onlyOwner {
        newFeatureEnabled = block.timestamp;
        emit NewFeatureAdded("Reputation System");
    }
    
    function updateUserReputation(address user, uint256 score) external onlyOwner {
        userReputationScore[user] = score;
        emit ReputationUpdated(user, score);
    }
    
    function claimRewardWithReputation(uint256 _questId, Attestation calldata _attestation) external {
        // Call the original claimReward function
        this.claimReward(_questId, _attestation);
        
        // Add new logic - increase user reputation
        userReputationScore[msg.sender] += 10;
        emit ReputationUpdated(msg.sender, userReputationScore[msg.sender]);
    }
}