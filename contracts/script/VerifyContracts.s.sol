// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";

/**
 * @title VerifyContracts Script
 * @dev Script to verify all deployed contracts
 * @notice Run with: forge script script/VerifyContracts.s.sol --rpc-url <RPC_URL>
 */
contract VerifyContractsScript is Script {
    struct ContractAddresses {
        address questSystemProxy;
        address questSystemImplementation;
        address primusZKTLS;
        address verifier;
        bool useMockZKTLS;
    }

    function run() public {
        ContractAddresses memory addresses = _loadAddresses();
        
        console.log("=== Contract Verification Script ===");
        console.log("QuestSystem Proxy:", addresses.questSystemProxy);
        console.log("QuestSystem Implementation:", addresses.questSystemImplementation);
        console.log("PrimusZKTLS:", addresses.primusZKTLS);
        console.log("Use Mock zkTLS:", addresses.useMockZKTLS);
        
        _printVerificationCommands(addresses);
    }

    function _loadAddresses() internal view returns (ContractAddresses memory addresses) {
        // Load from environment variables
        addresses.questSystemProxy = vm.envAddress("QUEST_SYSTEM_ADDRESS");
        addresses.questSystemImplementation = vm.envOr("QUEST_SYSTEM_IMPLEMENTATION", address(0));
        addresses.primusZKTLS = vm.envAddress("PRIMUS_ZKTLS_ADDRESS");
        addresses.verifier = vm.envOr("VERIFIER_ADDRESS", address(0x1234567890123456789012345678901234567890));
        addresses.useMockZKTLS = vm.envOr("USE_MOCK_ZKTLS", true);
        
        // Validation
        require(addresses.questSystemProxy != address(0), "QUEST_SYSTEM_ADDRESS must be set");
        require(addresses.primusZKTLS != address(0), "PRIMUS_ZKTLS_ADDRESS must be set");
    }

    function _printVerificationCommands(ContractAddresses memory addresses) internal view {
        console.log("\n=== Copy and run these commands ===");
        
        // 1. Verify QuestSystem Implementation (if address provided)
        if (addresses.questSystemImplementation != address(0)) {
            console.log("\n1. Verify QuestSystem Implementation:");
            console.log("forge verify-contract", addresses.questSystemImplementation);
            console.log("  src/QuestSystem.sol:QuestSystem");
            console.log("  --etherscan-api-key $ETHERSCAN_API_KEY");
            console.log("  --rpc-url $RPC_URL");
        }
        
        // 2. Verify ERC1967Proxy
        console.log("\n2. Verify ERC1967Proxy:");
        console.log("forge verify-contract", addresses.questSystemProxy);
        console.log("  @openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol:ERC1967Proxy");
        if (addresses.questSystemImplementation != address(0)) {
            console.log("  --constructor-args $(cast abi-encode \"constructor(address,bytes)\"", addresses.questSystemImplementation);
            console.log("    $(cast abi-encode \"initialize(address)\"", addresses.primusZKTLS, "))");
        } else {
            console.log("  --constructor-args $(cast abi-encode \"constructor(address,bytes)\" <IMPLEMENTATION_ADDRESS>");
            console.log("    $(cast abi-encode \"initialize(address)\"", addresses.primusZKTLS, "))");
        }
        console.log("  --etherscan-api-key $ETHERSCAN_API_KEY");
        console.log("  --rpc-url $RPC_URL");
        
        // 3. Verify MockPrimusZKTLS (if using mock)
        if (addresses.useMockZKTLS) {
            console.log("\n3. Verify MockPrimusZKTLS:");
            console.log("forge verify-contract", addresses.primusZKTLS);
            console.log("  src/mocks/MockPrimusZKTLS.sol:MockPrimusZKTLS");
            console.log("  --constructor-args $(cast abi-encode \"constructor(address)\"", addresses.verifier, ")");
            console.log("  --etherscan-api-key $ETHERSCAN_API_KEY");
            console.log("  --rpc-url $RPC_URL");
        }
        
        console.log("\n=== Environment Variables Needed ===");
        console.log("ETHERSCAN_API_KEY=your_api_key_here");
        console.log("RPC_URL=your_rpc_url_here");
        console.log("QUEST_SYSTEM_ADDRESS=", addresses.questSystemProxy);
        console.log("PRIMUS_ZKTLS_ADDRESS=", addresses.primusZKTLS);
        if (addresses.questSystemImplementation != address(0)) {
            console.log("QUEST_SYSTEM_IMPLEMENTATION=", addresses.questSystemImplementation);
        }
        
        console.log("\n=== Quick Verify Script ===");
        console.log("You can also create a shell script with these commands:");
        console.log("#!/bin/bash");
        console.log("set -e");
        console.log("");
        if (addresses.questSystemImplementation != address(0)) {
            console.log("echo \"Verifying QuestSystem Implementation...\"");
            console.log("forge verify-contract", addresses.questSystemImplementation, "src/QuestSystem.sol:QuestSystem --etherscan-api-key $ETHERSCAN_API_KEY --rpc-url $RPC_URL");
            console.log("");
        }
        console.log("echo \"Verifying ERC1967Proxy...\"");
        console.log("CONSTRUCTOR_ARGS=$(cast abi-encode \"constructor(address,bytes)\"", addresses.questSystemImplementation != address(0) ? addresses.questSystemImplementation : address(0));
        console.log("  $(cast abi-encode \"initialize(address)\"", addresses.primusZKTLS, "))");
        console.log("forge verify-contract", addresses.questSystemProxy);
        console.log("  @openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol:ERC1967Proxy");
        console.log("  --constructor-args $CONSTRUCTOR_ARGS --etherscan-api-key $ETHERSCAN_API_KEY --rpc-url $RPC_URL");
        console.log("");
        if (addresses.useMockZKTLS) {
            console.log("echo \"Verifying MockPrimusZKTLS...\"");
            console.log("forge verify-contract", addresses.primusZKTLS, "src/mocks/MockPrimusZKTLS.sol:MockPrimusZKTLS");
            console.log("  --constructor-args $(cast abi-encode \"constructor(address)\"", addresses.verifier, ")");
            console.log("  --etherscan-api-key $ETHERSCAN_API_KEY --rpc-url $RPC_URL");
        }
        console.log("");
        console.log("echo \"All contracts verified successfully!\"");
    }
}