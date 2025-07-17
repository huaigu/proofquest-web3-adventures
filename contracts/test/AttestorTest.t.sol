// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test, console} from "forge-std/Test.sol";
import {AttestorTest} from "../src/AttestorTest.sol";
import {IPrimusZKTLS, Attestation, AttNetworkRequest, AttNetworkResponseResolve, Attestor} from "@primuslabs/zktls-contracts/src/IPrimusZKTLS.sol";

// Mock contract for testing
contract MockPrimusZKTLS is IPrimusZKTLS {
    mapping(bytes32 => bool) private usedIds;
    
    function verifyAttestation(Attestation calldata) external pure override returns (bool) {
        // Mock implementation - always returns true for testing
        return true;
    }
    
    function getVerifier() external view override returns (address) {
        return address(this);
    }
    
    function isUsed(bytes32 id) external view override returns (bool) {
        return usedIds[id];
    }
    
    function markAsUsed(bytes32 id) external {
        usedIds[id] = true;
    }
}

contract AttestorTestTest is Test {
    AttestorTest public attestorTest;
    MockPrimusZKTLS public mockPrimus;
    
    function setUp() public {
        mockPrimus = new MockPrimusZKTLS();
        attestorTest = new AttestorTest(address(mockPrimus));
    }
    
    function testConstructor() public {
        assertEq(attestorTest.primusAddress(), address(mockPrimus));
    }
    
    function testVerifySignature() public {
        // Create a test attestation with all required fields
        AttNetworkRequest memory request = AttNetworkRequest({
            url: "https://example.com",
            header: "",
            method: "GET",
            body: ""
        });
        
        AttNetworkResponseResolve[] memory responseResolve = new AttNetworkResponseResolve[](1);
        responseResolve[0] = AttNetworkResponseResolve({
            keyName: "test",
            parseType: "",
            parsePath: "$.test"
        });
        
        string memory attConditions = "test condition";
        
        Attestor[] memory attestors = new Attestor[](1);
        attestors[0] = Attestor({
            attestorAddr: address(0x1234),
            url: "https://attestor.com"
        });
        
        bytes[] memory signatures = new bytes[](1);
        signatures[0] = hex"deadbeef";
        
        Attestation memory attestation = Attestation({
            recipient: address(0x1234),
            request: request,
            reponseResolve: responseResolve,
            data: '{"test":"value"}',
            attConditions: attConditions,
            timestamp: uint64(block.timestamp),
            additionParams: "{}",
            attestors: attestors,
            signatures: signatures,
            extendedData: '{"test":"value"}'
        });
        
        // Should return true for valid attestation
        bool result = attestorTest.verifySignature(attestation);
        assertTrue(result);
    }
    
    function testVerifySignatureWithDifferentData() public {
        // Create another test attestation with different data
        AttNetworkRequest memory request2 = AttNetworkRequest({
            url: "https://different.com",
            header: "",
            method: "POST",
            body: ""
        });
        
        AttNetworkResponseResolve[] memory responseResolve2 = new AttNetworkResponseResolve[](1);
        responseResolve2[0] = AttNetworkResponseResolve({
            keyName: "different",
            parseType: "",
            parsePath: "$.different"
        });
        
        string memory attConditions2 = "different condition";
        
        Attestor[] memory attestors2 = new Attestor[](1);
        attestors2[0] = Attestor({
            attestorAddr: address(0x5678),
            url: "https://attestor2.com"
        });
        
        bytes[] memory signatures2 = new bytes[](1);
        signatures2[0] = hex"cafebabe";
        
        Attestation memory attestation = Attestation({
            recipient: address(0x5678),
            request: request2,
            reponseResolve: responseResolve2,
            data: '{"different":"value"}',
            attConditions: attConditions2,
            timestamp: uint64(block.timestamp + 100),
            additionParams: "{}",
            attestors: attestors2,
            signatures: signatures2,
            extendedData: '{"different":"value"}'
        });
        
        // Should still return true (based on simple implementation)
        bool result = attestorTest.verifySignature(attestation);
        assertTrue(result);
    }
    
    function testCannotDeployWithZeroAddress() public {
        vm.expectRevert();
        new AttestorTest(address(0));
    }
    
    function testPrimusAddressIsSet() public {
        address expectedAddress = address(mockPrimus);
        assertEq(attestorTest.primusAddress(), expectedAddress);
    }
}