// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {QuestSystem} from "../src/QuestSystem.sol";
import {MockPrimusZKTLS} from "../src/mocks/MockPrimusZKTLS.sol";
import {ERC1967Proxy} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";

/**
 * @title DeployQuestSystem Script
 * @dev Deploys the complete QuestSystem with UUPS proxy pattern
 * @notice Run with: forge script script/DeployQuestSystem.s.sol --rpc-url <RPC_URL> --broadcast --verify
 */
contract DeployQuestSystemScript is Script {
    // Deployment configuration
    struct DeployConfig {
        address primusZKTLS;        // Address of PrimusZKTLS contract (use MockPrimusZKTLS for testing)
        address verifier;           // Verifier address for MockPrimusZKTLS
        bool useMockZKTLS;         // Whether to deploy MockPrimusZKTLS or use existing contract
        address owner;             // Owner of the QuestSystem contract
    }

    function setUp() public {}

    function run() public returns (address questSystemProxy, address primusZKTLS) {
        // Load deployment configuration
        DeployConfig memory config = _loadConfig();
        
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        console.log("=== ProofQuest Deployment Started ===");
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

        // Deploy QuestSystem implementation
        console.log("Deploying QuestSystem implementation...");
        QuestSystem implementation = new QuestSystem();
        console.log("QuestSystem implementation:", address(implementation));

        // Prepare initialization data
        bytes memory initData = abi.encodeWithSelector(
            QuestSystem.initialize.selector,
            primusZKTLS
        );

        // Deploy UUPS Proxy
        console.log("Deploying UUPS Proxy...");
        ERC1967Proxy proxy = new ERC1967Proxy(
            address(implementation),
            initData
        );
        questSystemProxy = address(proxy);
        console.log("QuestSystem Proxy (Main Contract):", questSystemProxy);

        // Transfer ownership if specified
        if (config.owner != address(0) && config.owner != deployer) {
            console.log("Transferring ownership to:", config.owner);
            QuestSystem(payable(questSystemProxy)).transferOwnership(config.owner);
        }

        vm.stopBroadcast();

        // Verify contracts if not on local network
        if (block.chainid != 31337) { // Not Anvil
            _verifyContracts(questSystemProxy, address(implementation), primusZKTLS, config);
        }

        // Log deployment summary
        _logDeploymentSummary(questSystemProxy, primusZKTLS, config);
        
        return (questSystemProxy, primusZKTLS);
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

    function _verifyContracts(address questSystemProxy, address implementation, address primusZKTLS, DeployConfig memory config) internal {
        console.log("\n=== Starting Contract Verification ===");
        
        // Verify MockPrimusZKTLS if deployed
        if (config.useMockZKTLS) {
            console.log("Verifying MockPrimusZKTLS...");
            try vm.parseJson(vm.readFile("./broadcast/DeployQuestSystem.s.sol/run-latest.json")) {
                string[] memory verifyCmd = new string[](8);
                verifyCmd[0] = "forge";
                verifyCmd[1] = "verify-contract";
                verifyCmd[2] = vm.toString(primusZKTLS);
                verifyCmd[3] = "src/mocks/MockPrimusZKTLS.sol:MockPrimusZKTLS";
                verifyCmd[4] = "--constructor-args";
                verifyCmd[5] = vm.toString(abi.encode(config.verifier));
                verifyCmd[6] = "--etherscan-api-key";
                verifyCmd[7] = vm.envString("ETHERSCAN_API_KEY");
                
                // Note: vm.ffi is not available in script context, so we'll log the command
                console.log("MockPrimusZKTLS verification command:");
                console.log("forge verify-contract", primusZKTLS, "src/mocks/MockPrimusZKTLS.sol:MockPrimusZKTLS");
                console.log("  --constructor-args", vm.toString(abi.encode(config.verifier)));
            } catch {
                console.log("Note: Manual verification may be required for MockPrimusZKTLS");
            }
        }
        
        // Log verification commands for manual execution
        console.log("\n=== Manual Verification Commands ===");
        console.log("1. Verify QuestSystem Implementation:");
        console.log("forge verify-contract", implementation, "src/QuestSystem.sol:QuestSystem");
        
        console.log("\n2. Verify ERC1967Proxy:");
        console.log("forge verify-contract", questSystemProxy);
        console.log("  @openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol:ERC1967Proxy");
        console.log("  --constructor-args $(cast abi-encode \"constructor(address,bytes)\"", implementation);
        console.log("    $(cast abi-encode \"initialize(address)\"", primusZKTLS, "))");
        
        if (config.useMockZKTLS) {
            console.log("\n3. Verify MockPrimusZKTLS:");
            console.log("forge verify-contract", primusZKTLS, "src/mocks/MockPrimusZKTLS.sol:MockPrimusZKTLS");
            console.log("  --constructor-args $(cast abi-encode \"constructor(address)\"", config.verifier, ")");
        }
        
        console.log("\nNote: Add --etherscan-api-key $ETHERSCAN_API_KEY to each command");
        console.log("Note: Add --rpc-url <RPC_URL> to each command if needed");
    }

    function _logDeploymentSummary(address questSystemProxy, address primusZKTLS, DeployConfig memory config) internal view {
        console.log("\n=== Deployment Summary ===");
        console.log("QuestSystem Proxy:", questSystemProxy);
        console.log("PrimusZKTLS:", primusZKTLS);
        console.log("Owner:", config.owner == address(0) ? "Deployer" : "Custom");
        console.log("Chain ID:", block.chainid);
        
        console.log("");
        console.log("=== Integration Ready ===");
        console.log("All contracts deployed and verification commands provided above.");
        
        console.log("");
        console.log("=== Next Steps ===");
        console.log("1. Save contract addresses to your .env file");
        console.log("2. Run demo script:");
        console.log("   forge script script/DemoQuestSystem.s.sol --rpc-url <RPC_URL> --broadcast");
        console.log("3. Integrate with frontend using the proxy address:", questSystemProxy);
        
        console.log("");
        console.log("=== Environment Variables to Set ===");
        console.log("QUEST_SYSTEM_ADDRESS=", questSystemProxy);
        console.log("PRIMUS_ZKTLS_ADDRESS=", primusZKTLS);
    }
}

/**
 * @title Deploy to Anvil (Local)
 * @dev Quick deployment script for local Anvil testing
 */
contract DeployAnvilScript is Script {
    function run() public {
        uint256 deployerPrivateKey = 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80; // Anvil default key
        
        vm.startBroadcast(deployerPrivateKey);

        // Deploy MockPrimusZKTLS with default verifier
        MockPrimusZKTLS mockZKTLS = new MockPrimusZKTLS(
            address(0x1234567890123456789012345678901234567890)
        );

        // Deploy QuestSystem
        QuestSystem implementation = new QuestSystem();
        bytes memory initData = abi.encodeWithSelector(
            QuestSystem.initialize.selector,
            address(mockZKTLS)
        );
        
        ERC1967Proxy proxy = new ERC1967Proxy(
            address(implementation),
            initData
        );

        vm.stopBroadcast();

        console.log("=== Anvil Local Deployment ===");
        console.log("QuestSystem:", address(proxy));
        console.log("MockPrimusZKTLS:", address(mockZKTLS));
        console.log("Ready for testing!");
    }
}