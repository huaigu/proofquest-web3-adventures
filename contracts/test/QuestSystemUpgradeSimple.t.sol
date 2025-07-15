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
 * @title QuestSystemUpgradeSimple Test
 * @dev Simplified tests for UUPS upgrade functionality
 */
contract QuestSystemUpgradeSimpleTest is Test {
    QuestSystem public questSystemProxy;
    QuestSystem public questSystemImpl;
    MockPrimusZKTLS public mockZKTLS;
    
    address public owner;
    address public sponsor;
    address public user1;
    address public verifier;
    
    // Test constants
    uint256 constant QUEST_REWARD = 1 ether;
    uint256 constant REWARD_PER_USER = 0.1 ether;
    
    event Upgraded(address indexed implementation);

    function setUp() public {
        // Setup test accounts
        owner = address(this);
        sponsor = makeAddr("sponsor");
        user1 = makeAddr("user1");
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
    
    function test_UnauthorizedUpgrade() public {
        // Deploy new implementation
        QuestSystem newImpl = new QuestSystem();
        
        // Try to upgrade from non-owner account
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
        QuestSystemV2Simple impl2 = new QuestSystemV2Simple();
        questSystemProxy.upgradeToAndCall(address(impl2), "");
        
        // Cast and test V2 features
        QuestSystemV2Simple questV2 = QuestSystemV2Simple(payable(address(questSystemProxy)));
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
        uint256 nextQuestId = questSystemProxy.getNextQuestId();
        
        // Upgrade
        QuestSystem newImpl = new QuestSystem();
        questSystemProxy.upgradeToAndCall(address(newImpl), "");
        
        // Verify view functions return same data
        (uint256[] memory questIdsAfter, uint256 totalCountAfter) = questSystemProxy.getAllQuestIds(1, 10);
        uint256 nextQuestIdAfter = questSystemProxy.getNextQuestId();
        
        assertEq(totalCount, totalCountAfter);
        assertEq(questIds.length, questIdsAfter.length);
        assertEq(nextQuestId, nextQuestIdAfter);
    }
    
    function test_UpgradeAfterOwnershipTransfer() public {
        address newOwner = makeAddr("newOwner");
        
        // Check current owner before transfer
        assertEq(questSystemProxy.owner(), owner);
        
        // Create a quest before transfer to ensure state preservation
        _createBasicQuest();
        
        // Transfer ownership
        questSystemProxy.transferOwnership(newOwner);
        
        // Verify that current owner cannot upgrade anymore
        QuestSystem newImpl = new QuestSystem();
        vm.expectRevert();
        questSystemProxy.upgradeToAndCall(address(newImpl), "");
        
        // Verify that new owner can upgrade
        vm.prank(newOwner);
        questSystemProxy.upgradeToAndCall(address(newImpl), "");
        
        // Verify quest state preserved after upgrade
        QuestSystem.Quest memory quest = questSystemProxy.getQuest(1);
        assertEq(quest.sponsor, sponsor);
        assertEq(quest.totalRewards, QUEST_REWARD);
        
        // Verify ownership preserved after upgrade
        assertEq(questSystemProxy.owner(), newOwner);
    }
    
    function test_UpgradeStorageSlotConsistency() public {
        // Set some state
        _createBasicQuest();
        
        // Upgrade
        QuestSystem newImpl = new QuestSystem();
        questSystemProxy.upgradeToAndCall(address(newImpl), "");
        
        // Verify storage layout hasn't changed (implementation should be compatible)
        uint256 nextQuestId = questSystemProxy.getNextQuestId();
        assertEq(nextQuestId, 2); // Should be 2 after creating one quest
    }
    
    function test_UpgradeToV2WithNewFeatures() public {
        // Create quest
        _createBasicQuest();
        
        // Deploy QuestSystemV2Simple
        QuestSystemV2Simple newImpl = new QuestSystemV2Simple();
        
        // Upgrade to V2
        questSystemProxy.upgradeToAndCall(address(newImpl), "");
        
        // Cast to V2 interface
        QuestSystemV2Simple questV2 = QuestSystemV2Simple(payable(address(questSystemProxy)));
        
        // Test new V2 functionality
        assertEq(questV2.newFeatureEnabled(), 0);
        
        // Enable new feature
        questV2.enableNewFeature();
        assertGt(questV2.newFeatureEnabled(), 0);
        
        // Test reputation update
        questV2.updateUserReputation(user1, 100);
        assertEq(questV2.userReputationScore(user1), 100);
        
        // Verify original quest still exists
        QuestSystem.Quest memory quest = questV2.getQuest(1);
        assertEq(quest.sponsor, sponsor);
        assertEq(quest.totalRewards, QUEST_REWARD);
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
 * @title QuestSystemV2Simple Example Implementation
 * @dev Simplified example of an upgraded contract with new features
 */
contract QuestSystemV2Simple is QuestSystem {
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
}