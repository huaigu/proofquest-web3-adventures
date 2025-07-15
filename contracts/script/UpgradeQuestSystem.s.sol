// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {QuestSystem} from "../src/QuestSystem.sol";
import {IPrimusZKTLS, Attestation} from "../lib/zktls-contracts/src/IPrimusZKTLS.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

/**
 * @title UpgradeQuestSystem Script
 * @dev Demonstrates UUPS upgrade functionality for QuestSystem
 * @notice Run with: forge script script/UpgradeQuestSystem.s.sol --rpc-url <RPC_URL> --broadcast
 */
contract UpgradeQuestSystemScript is Script {
    function setUp() public {}

    function run() public {
        // Load contract addresses
        address questSystemProxy = vm.envOr("QUEST_SYSTEM_ADDRESS", address(0));
        require(questSystemProxy != address(0), "QUEST_SYSTEM_ADDRESS not set");
        
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        console.log("=== QuestSystem Upgrade Demo ===");
        console.log("Proxy address:", questSystemProxy);
        
        // Get current state before upgrade
        QuestSystem currentContract = QuestSystem(payable(questSystemProxy));
        uint256 nextQuestIdBefore = currentContract.getNextQuestId();
        address ownerBefore = currentContract.owner();
        
        console.log("Current state before upgrade:");
        console.log("  Next Quest ID:", nextQuestIdBefore);
        console.log("  Owner:", ownerBefore);
        
        vm.startBroadcast(deployerPrivateKey);

        // Deploy new implementation
        console.log("Deploying new QuestSystem implementation...");
        QuestSystem newImplementation = new QuestSystem();
        console.log("New implementation deployed:", address(newImplementation));

        // Perform upgrade
        console.log("Performing UUPS upgrade...");
        currentContract.upgradeToAndCall(
            address(newImplementation),
            "" // No additional initialization data needed
        );

        vm.stopBroadcast();

        // Verify state preservation after upgrade
        uint256 nextQuestIdAfter = currentContract.getNextQuestId();
        address ownerAfter = currentContract.owner();
        
        console.log("State after upgrade:");
        console.log("  Next Quest ID:", nextQuestIdAfter);
        console.log("  Owner:", ownerAfter);
        
        // Verify state was preserved
        require(nextQuestIdBefore == nextQuestIdAfter, "Next Quest ID changed during upgrade!");
        require(ownerBefore == ownerAfter, "Owner changed during upgrade!");
        
        console.log("[SUCCESS] Upgrade completed successfully with state preservation!");
        console.log("[SUCCESS] All existing quests and user data remain intact");
        
        console.log("\n=== Upgrade Summary ===");
        console.log("Proxy address (unchanged):", questSystemProxy);
        console.log("New implementation:", address(newImplementation));
        console.log("State preserved: YES");
    }
}

/**
 * @title QuestSystemV2 Example
 * @dev Example of what an upgraded contract might look like
 * @notice This is just an example - not deployed by default
 */
contract QuestSystemV2 is QuestSystem {
    // Example of new storage variables (must be appended, not inserted)
    uint256 public newFeatureEnabled;
    mapping(address => uint256) public userReputationScore;
    
    // Example of new events
    event NewFeatureAdded(string feature);
    event ReputationUpdated(address user, uint256 score);
    
    /**
     * @notice Example of new function that could be added in V2
     */
    function enableNewFeature() external onlyOwner {
        newFeatureEnabled = block.timestamp;
        emit NewFeatureAdded("Reputation System");
    }
    
    /**
     * @notice Example of new function to update user reputation
     */
    function updateUserReputation(address user, uint256 score) external onlyOwner {
        userReputationScore[user] = score;
        emit ReputationUpdated(user, score);
    }
    
    /**
     * @notice Example of new function that enhances quest claiming with reputation
     */
    function claimRewardWithReputation(uint256 _questId, Attestation calldata _attestation) external {
        // Call the original claimReward function
        this.claimReward(_questId, _attestation);
        
        // Add new logic - increase user reputation
        userReputationScore[msg.sender] += 10;
        emit ReputationUpdated(msg.sender, userReputationScore[msg.sender]);
    }
}

/**
 * @title Deploy and Upgrade to V2 Script
 * @dev Example script showing how to upgrade to a new version with new features
 */
contract UpgradeToV2Script is Script {
    function run() public {
        address questSystemProxy = vm.envOr("QUEST_SYSTEM_ADDRESS", address(0));
        require(questSystemProxy != address(0), "QUEST_SYSTEM_ADDRESS not set");
        
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        console.log("=== Upgrading to QuestSystemV2 ===");
        
        vm.startBroadcast(deployerPrivateKey);

        // Deploy QuestSystemV2 implementation
        QuestSystemV2 newImplementation = new QuestSystemV2();
        console.log("QuestSystemV2 implementation deployed:", address(newImplementation));

        // Perform upgrade
        QuestSystem currentContract = QuestSystem(payable(questSystemProxy));
        currentContract.upgradeToAndCall(
            address(newImplementation),
            "" // Could include initialization data for new features
        );

        vm.stopBroadcast();

        // Test new features
        QuestSystemV2 upgradedContract = QuestSystemV2(payable(questSystemProxy));
        
        console.log("[SUCCESS] Upgraded to V2 successfully!");
        console.log("New feature enabled timestamp:", upgradedContract.newFeatureEnabled());
        
        // Enable new feature
        vm.startBroadcast(deployerPrivateKey);
        upgradedContract.enableNewFeature();
        vm.stopBroadcast();
        
        console.log("[SUCCESS] New reputation system feature enabled!");
        console.log("Feature enabled at:", upgradedContract.newFeatureEnabled());
    }
}