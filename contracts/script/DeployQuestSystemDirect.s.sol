// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {QuestSystem} from "../src/QuestSystem.sol";
import {MockPrimusZKTLS} from "../src/mocks/MockPrimusZKTLS.sol";
import {IPrimusZKTLS} from "../lib/zktls-contracts/src/IPrimusZKTLS.sol";

/**
 * @title DeployQuestSystemDirect Script
 * @dev Deploys QuestSystem directly without proxy pattern
 * @notice Run with: forge script script/DeployQuestSystemDirect.s.sol --rpc-url <RPC_URL> --broadcast --verify
 */
contract DeployQuestSystemDirectScript is Script {
    // Deployment configuration
    struct DeployConfig {
        address primusZKTLS;        // Address of PrimusZKTLS contract (use MockPrimusZKTLS for testing)
        address verifier;           // Verifier address for MockPrimusZKTLS
        bool useMockZKTLS;         // Whether to deploy MockPrimusZKTLS or use existing contract
        address owner;             // Owner of the QuestSystem contract
    }

    function setUp() public {}

    function run() public returns (address questSystem, address primusZKTLS) {
        // Load deployment configuration
        DeployConfig memory config = _loadConfig();
        
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        console.log("=== ProofQuest Direct Deployment Started ===");
        console.log("Deployer:", deployer);
        console.log("Network:", block.chainid);
        console.log("Use Mock zkTLS:", config.useMockZKTLS);
        
        vm.startBroadcast(deployerPrivateKey);

        // Deploy PrimusZKTLS (mock or use existing)
        if (config.useMockZKTLS) {
            console.log("Deploying MockPrimusZKTLS...");
            MockPrimusZKTLS mockZKTLS = new MockPrimusZKTLS(config.verifier);
            primusZKTLS = address(mockZKTLS);
            console.log("MockPrimusZKTLS deployed:", primusZKTLS);
            console.log("Verifier address:", config.verifier);
        } else {
            primusZKTLS = config.primusZKTLS;
            console.log("Using existing PrimusZKTLS:", primusZKTLS);
        }

        // Deploy QuestSystem directly (no proxy)
        console.log("Deploying QuestSystem directly...");
        QuestSystem questSystemContract = new QuestSystem(primusZKTLS);
        questSystem = address(questSystemContract);
        console.log("QuestSystem deployed:", questSystem);
        console.log("QuestSystem initialized with PrimusZKTLS:", primusZKTLS);

        // Transfer ownership if specified
        if (config.owner != address(0) && config.owner != deployer) {
            console.log("Transferring ownership to:", config.owner);
            questSystemContract.transferOwnership(config.owner);
        }

        vm.stopBroadcast();

        // Verify contracts if not on local network
        if (block.chainid != 31337) { // Not Anvil
            _verifyContracts(questSystem, primusZKTLS, config);
        }

        // Log deployment summary
        _logDeploymentSummary(questSystem, primusZKTLS, config);
        
        return (questSystem, primusZKTLS);
    }

    function _loadConfig() internal view returns (DeployConfig memory config) {
        // Load from environment variables with sensible defaults
        config.primusZKTLS = vm.envOr("PRIMUS_ZKTLS_ADDRESS", address(0));
        config.verifier = vm.envOr("VERIFIER_ADDRESS", address(0x1234567890123456789012345678901234567890));
        config.useMockZKTLS = vm.envOr("USE_MOCK_ZKTLS", true);
        config.owner = vm.envOr("QUEST_SYSTEM_OWNER", address(0));

        // Validation
        if (!config.useMockZKTLS && config.primusZKTLS == address(0)) {
            revert("PRIMUS_ZKTLS_ADDRESS must be set when USE_MOCK_ZKTLS=false");
        }
    }

    function _verifyContracts(address questSystem, address primusZKTLS, DeployConfig memory config) pure internal {
        console.log("\n=== Starting Contract Verification ===");
        
        // Log verification commands for manual execution
        console.log("\n=== Manual Verification Commands ===");
        console.log("1. Verify QuestSystem:");
        console.log("forge verify-contract", questSystem, "src/QuestSystem.sol:QuestSystem");
        
        if (config.useMockZKTLS) {
            console.log("\n2. Verify MockPrimusZKTLS:");
            console.log("forge verify-contract", primusZKTLS, "src/mocks/MockPrimusZKTLS.sol:MockPrimusZKTLS");
            console.log("  --constructor-args $(cast abi-encode \"constructor(address)\"", config.verifier, ")");
        }
        
        console.log("\nNote: Add --etherscan-api-key $ETHERSCAN_API_KEY to each command");
        console.log("Note: Add --rpc-url <RPC_URL> to each command if needed");
    }

    function _logDeploymentSummary(address questSystem, address primusZKTLS, DeployConfig memory config) internal view {
        console.log("\n=== Deployment Summary ===");
        console.log("QuestSystem (Direct):", questSystem);
        console.log("PrimusZKTLS:", primusZKTLS);
        console.log("Owner:", config.owner == address(0) ? "Deployer" : "Custom");
        console.log("Chain ID:", block.chainid);
        
        console.log("");
        console.log("=== Integration Ready ===");
        console.log("QuestSystem deployed directly without proxy pattern.");
        console.log("Contract is initialized and ready for use.");
        
        console.log("");
        console.log("=== Next Steps ===");
        console.log("1. Save contract addresses to your .env file");
        console.log("2. Run demo script:");
        console.log("   forge script script/DemoQuestSystem.s.sol --rpc-url <RPC_URL> --broadcast");
        console.log("3. Integrate with frontend using the direct address:", questSystem);
        
        console.log("");
        console.log("=== Environment Variables to Set ===");
        console.log("QUEST_SYSTEM_ADDRESS=", questSystem);
        console.log("PRIMUS_ZKTLS_ADDRESS=", primusZKTLS);
    }
}