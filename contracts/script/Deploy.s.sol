// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {AttestorTest} from "../src/AttestorTest.sol";

contract DeployScript is Script {
    function setUp() public {}

    function run() public {
        // Load deployment parameters from environment variables
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        // You can set this via environment variable or hardcode for testing
        address primusAddress = vm.envOr("PRIMUS_ADDRESS", address(0x1234567890123456789012345678901234567890));
        
        vm.startBroadcast(deployerPrivateKey);

        // Deploy AttestorTest contract
        AttestorTest attestorTest = new AttestorTest(primusAddress);

        vm.stopBroadcast();

        // Log deployment information
        console.log("AttestorTest deployed to:", address(attestorTest));
        console.log("Primus address set to:", primusAddress);
        console.log("Deployer address:", vm.addr(deployerPrivateKey));
    }
}