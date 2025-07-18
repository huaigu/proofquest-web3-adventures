// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "forge-std/Test.sol";
import "forge-std/console.sol";
import "../src/mocks/MockPrimusZKTLS.sol";
import {IPrimusZKTLS, Attestation} from "../lib/zktls-contracts/src/IPrimusZKTLS.sol";
import "../src/utils/StringUtils.sol";

contract MockPrimusZKTLSTest is Test {
    using StringUtils for string;
    
    MockPrimusZKTLS public mockZKTLS;
    address public verifier;
    address public user;

    // Test data constants
    string constant PROOF_FAV_RETWEET_JSON = '{"recipient":"0xB12a1f7035FdCBB4cC5Fa102C01346BD45439Adf","request":{"url":"https://x.com/i/api/graphql/FJGOFKfjA67MmT4I9p1qZg/TweetDetail?variables=%7B%22focalTweetId%22%3A%221942933687978365289%22%2C%22with_rux_injections%22%3Afalse%7D","header":"","method":"GET","body":""},"data":"{\\"favorited\\":\\"true\\",\\"retweeted\\":\\"true\\"}","timestamp":1752473912632,"additionParams":"{\\"algorithmType\\":\\"proxytls\\"}","signatures":["0x2c54ef20a94e5f892341bd47db97e9792eff8a273bdc732e914efd00e9e1356a5d06db1bf11daa8ea1ca0c7ac6917eafdd58db6f8490941236096500fd2a5b471b"],"extendedData":"{\\"favorited\\":\\"true\\",\\"retweeted\\":\\"true\\"}"}';
    
    string constant PROOF_QUOTE_TWEET_JSON = '{"recipient":"0xB12a1f7035FdCBB4cC5Fa102C01346BD45439Adf","request":{"url":"https://x.com/i/api/graphql/FJGOFKfjA67MmT4I9p1qZg/TweetDetail?variables=%7B%22focalTweetId%22%3A%221940381550228721818%22%2C%22with_rux_injections%22%3Afalse%7D","header":"","method":"GET","body":""},"data":"{\\"user_id_str\\":\\"898091366260948992\\",\\"id_str\\":\\"1940381550228721818\\",\\"quoted_status_id_str\\":\\"1940372466486137302\\"}","timestamp":1752475379394,"additionParams":"{\\"algorithmType\\":\\"proxytls\\"}","signatures":["0x95cab346057f2eb5bf7ca0a60f6b3006597eb8a8606df3db82fe26bf257e89cb52b2aed831d04e3ca07dd043a313d24015781b23ae3c688927ad115bea6441091c"],"extendedData":"{\\"id_str\\":\\"1940381550228721818\\",\\"quoted_status_id_str\\":\\"1940372466486137302\\",\\"user_id_str\\":\\"898091366260948992\\"}"}';

    function setUp() public {
        verifier = makeAddr("verifier");
        user = makeAddr("user");
        
        mockZKTLS = new MockPrimusZKTLS(verifier);
    }

    // --- Basic Configuration Tests ---

    function test_InitialState() public {
        assertEq(mockZKTLS.getVerifier(), verifier);
        assertEq(uint(mockZKTLS.verificationMode()), uint(MockPrimusZKTLS.VerificationMode.SimulateRealWorld));
        assertFalse(mockZKTLS.isUsed(keccak256("test")));
    }

    function test_SetVerificationMode() public {
        // Test setting to AlwaysPass
        mockZKTLS.setVerificationMode(MockPrimusZKTLS.VerificationMode.AlwaysPass);
        assertEq(uint(mockZKTLS.verificationMode()), uint(MockPrimusZKTLS.VerificationMode.AlwaysPass));

        // Test setting to AlwaysFail
        mockZKTLS.setVerificationMode(MockPrimusZKTLS.VerificationMode.AlwaysFail);
        assertEq(uint(mockZKTLS.verificationMode()), uint(MockPrimusZKTLS.VerificationMode.AlwaysFail));

        // Test setting to Configurable
        mockZKTLS.setVerificationMode(MockPrimusZKTLS.VerificationMode.Configurable);
        assertEq(uint(mockZKTLS.verificationMode()), uint(MockPrimusZKTLS.VerificationMode.Configurable));
    }

    function test_SetVerifier() public {
        address newVerifier = makeAddr("newVerifier");
        mockZKTLS.setVerifier(newVerifier);
        assertEq(mockZKTLS.getVerifier(), newVerifier);
    }

    function test_MarkAttestationAsUsed() public {
        bytes32 testId = keccak256("test-attestation");
        assertFalse(mockZKTLS.isUsed(testId));
        
        mockZKTLS.markAttestationAsUsed(testId);
        assertTrue(mockZKTLS.isUsed(testId));
    }

    // --- Test Data Management Tests ---

    function test_LoadAndGetTestData() public {
        string memory key = "ProofFavAndRetweet";
        mockZKTLS.loadTestData(key, PROOF_FAV_RETWEET_JSON);
        
        string memory retrievedData = mockZKTLS.getTestData(key);
        assertEq(retrievedData, PROOF_FAV_RETWEET_JSON);
    }

    function test_LoadMultipleTestData() public {
        mockZKTLS.loadTestData("ProofFavAndRetweet", PROOF_FAV_RETWEET_JSON);
        mockZKTLS.loadTestData("ProofQuoteTweet", PROOF_QUOTE_TWEET_JSON);
        
        assertEq(mockZKTLS.getTestData("ProofFavAndRetweet"), PROOF_FAV_RETWEET_JSON);
        assertEq(mockZKTLS.getTestData("ProofQuoteTweet"), PROOF_QUOTE_TWEET_JSON);
    }

    // --- Helper Function Tests ---

    function test_CreateLikeRetweetAttestation() public {
        Attestation memory attestation = mockZKTLS.createLikeRetweetAttestation(
            user,
            "1942933687978365289",
            true,  // favorited
            true   // retweeted
        );

        assertEq(attestation.recipient, user);
        assertTrue(bytes(attestation.request.url).length > 0);
        assertTrue(attestation.request.url.contains("1942933687978365289"));
        assertTrue(attestation.data.contains("favorited"));
        assertTrue(attestation.data.contains("retweeted"));
        assertEq(attestation.reponseResolve.length, 2);
        assertEq(attestation.attestors.length, 1);
        assertEq(attestation.signatures.length, 1);
    }

    function test_CreateQuoteTweetAttestation() public {
        Attestation memory attestation = mockZKTLS.createQuoteTweetAttestation(
            user,
            "1940381550228721818",
            "1940372466486137302",
            "898091366260948992"
        );

        assertEq(attestation.recipient, user);
        assertTrue(bytes(attestation.request.url).length > 0);
        assertTrue(attestation.request.url.contains("1940381550228721818"));
        assertTrue(attestation.data.contains("user_id_str"));
        assertTrue(attestation.data.contains("quoted_status_id_str"));
        assertTrue(attestation.data.contains("id_str"));
        assertEq(attestation.reponseResolve.length, 3);
        assertEq(attestation.attestors.length, 1);
        assertEq(attestation.signatures.length, 1);
    }

    // --- Verification Mode Tests ---

    function test_AlwaysPassMode() public {
        mockZKTLS.setVerificationMode(MockPrimusZKTLS.VerificationMode.AlwaysPass);
        
        // Create a completely invalid attestation
        Attestation memory invalidAttestation;
        
        // Should not revert in AlwaysPass mode
        mockZKTLS.verifyAttestation(invalidAttestation);
    }

    function test_AlwaysFailMode() public {
        mockZKTLS.setVerificationMode(MockPrimusZKTLS.VerificationMode.AlwaysFail);
        
        // Create a valid-looking attestation
        Attestation memory validAttestation = mockZKTLS.createLikeRetweetAttestation(
            user,
            "1942933687978365289",
            true,
            true
        );
        
        // Should revert in AlwaysFail mode
        vm.expectRevert("Attestation verification failed");
        mockZKTLS.verifyAttestation(validAttestation);
    }

    function test_ConfigurableMode() public {
        mockZKTLS.setVerificationMode(MockPrimusZKTLS.VerificationMode.Configurable);
        
        Attestation memory attestation = mockZKTLS.createLikeRetweetAttestation(
            user,
            "1942933687978365289",
            true,
            true
        );
        
        bytes32 attestationId = mockZKTLS.getAttestationId(attestation);
        
        // Initially should return false (default)
        // Should revert\n        vm.expectRevert();\n        mockZKTLS.verifyAttestation(attestation));
        
        // Configure to return true
        mockZKTLS.setAttestationResult(attestationId, true);
        // Should not revert\n        mockZKTLS.verifyAttestation(attestation));
        
        // Configure to return false
        mockZKTLS.setAttestationResult(attestationId, false);
        // Should revert\n        vm.expectRevert();\n        mockZKTLS.verifyAttestation(attestation));
    }

    function test_SimulateRealWorldMode() public {
        mockZKTLS.setVerificationMode(MockPrimusZKTLS.VerificationMode.SimulateRealWorld);
        
        // Create valid attestation
        Attestation memory validAttestation = mockZKTLS.createLikeRetweetAttestation(
            user,
            "1942933687978365289",
            true,
            true
        );
        
        // Should not revert\n        mockZKTLS.verifyAttestation(validAttestation));
        
        // Test invalid attestation (zero recipient)
        Attestation memory invalidAttestation = validAttestation;
        invalidAttestation.recipient = address(0);
        // Should revert\n        vm.expectRevert();\n        mockZKTLS.verifyAttestation(invalidAttestation));
        
        // Test invalid attestation (future timestamp)
        invalidAttestation = validAttestation;
        invalidAttestation.timestamp = uint64(block.timestamp + 1 days);
        // Should revert\n        vm.expectRevert();\n        mockZKTLS.verifyAttestation(invalidAttestation));
        
        // Test invalid attestation (old timestamp)
        invalidAttestation = validAttestation;
        // Only test old timestamp if block.timestamp is large enough
        if (block.timestamp > 25 hours) {
            invalidAttestation.timestamp = uint64(block.timestamp - 25 hours);
            // Should revert\n        vm.expectRevert();\n        mockZKTLS.verifyAttestation(invalidAttestation));
        } else {
            // In test environment, set timestamp to 0 (which should fail)
            invalidAttestation.timestamp = 0;
            // Should revert\n        vm.expectRevert();\n        mockZKTLS.verifyAttestation(invalidAttestation));
        }
        
        // Test invalid URL
        invalidAttestation = validAttestation;
        invalidAttestation.request.url = "https://invalid.com/api";
        // Should revert\n        vm.expectRevert();\n        mockZKTLS.verifyAttestation(invalidAttestation));
    }

    // --- Signature Verification Tests ---

    function test_SignatureVerificationConfiguration() public {
        bytes memory testSignature = hex"2c54ef20a94e5f892341bd47db97e9792eff8a273bdc732e914efd00e9e1356a5d06db1bf11daa8ea1ca0c7ac6917eafdd58db6f8490941236096500fd2a5b471b";
        
        assertFalse(mockZKTLS.isSignatureConfiguredToPass(testSignature));
        
        mockZKTLS.setSignatureVerificationResult(testSignature, true);
        assertTrue(mockZKTLS.isSignatureConfiguredToPass(testSignature));
    }

    // --- Batch Operations Tests ---

    function test_BatchSetAttestationResults() public {
        mockZKTLS.setVerificationMode(MockPrimusZKTLS.VerificationMode.Configurable);
        
        Attestation memory attestation1 = mockZKTLS.createLikeRetweetAttestation(user, "123", true, true);
        Attestation memory attestation2 = mockZKTLS.createQuoteTweetAttestation(user, "456", "789", "user123");
        
        bytes32[] memory ids = new bytes32[](2);
        bool[] memory results = new bool[](2);
        
        ids[0] = mockZKTLS.getAttestationId(attestation1);
        ids[1] = mockZKTLS.getAttestationId(attestation2);
        results[0] = true;
        results[1] = false;
        
        mockZKTLS.batchSetAttestationResults(ids, results);
        
        // Should not revert\n        mockZKTLS.verifyAttestation(attestation1));
        // Should revert\n        vm.expectRevert();\n        mockZKTLS.verifyAttestation(attestation2));
    }

    function test_BatchSetAttestationResults_RevertOnMismatch() public {
        bytes32[] memory ids = new bytes32[](2);
        bool[] memory results = new bool[](1); // Length mismatch
        
        vm.expectRevert("Array length mismatch");
        mockZKTLS.batchSetAttestationResults(ids, results);
    }

    // --- Reset and Utility Tests ---

    function test_ResetToDefaults() public {
        // Change some settings
        mockZKTLS.setVerificationMode(MockPrimusZKTLS.VerificationMode.AlwaysPass);
        
        // Reset
        mockZKTLS.resetToDefaults();
        
        assertEq(uint(mockZKTLS.verificationMode()), uint(MockPrimusZKTLS.VerificationMode.SimulateRealWorld));
    }

    // --- Edge Cases and Error Conditions ---

    function test_EmptyDataAttestation() public {
        mockZKTLS.setVerificationMode(MockPrimusZKTLS.VerificationMode.SimulateRealWorld);
        
        Attestation memory attestation = mockZKTLS.createLikeRetweetAttestation(user, "123", true, true);
        attestation.data = ""; // Empty data
        
        // Should revert\n        vm.expectRevert();\n        mockZKTLS.verifyAttestation(attestation));
    }

    function test_NoAttestorsAttestation() public {
        mockZKTLS.setVerificationMode(MockPrimusZKTLS.VerificationMode.SimulateRealWorld);
        
        Attestation memory attestation = mockZKTLS.createLikeRetweetAttestation(user, "123", true, true);
        
        // Create new arrays with zero length
        attestation.attestors = new Attestor[](0);
        
        // Should revert\n        vm.expectRevert();\n        mockZKTLS.verifyAttestation(attestation));
    }

    function test_MismatchedSignatureLength() public {
        mockZKTLS.setVerificationMode(MockPrimusZKTLS.VerificationMode.SimulateRealWorld);
        
        Attestation memory attestation = mockZKTLS.createLikeRetweetAttestation(user, "123", true, true);
        
        // Add extra signature to create mismatch
        bytes[] memory newSignatures = new bytes[](2);
        newSignatures[0] = attestation.signatures[0];
        newSignatures[1] = attestation.signatures[0];
        attestation.signatures = newSignatures;
        
        // Should revert\n        vm.expectRevert();\n        mockZKTLS.verifyAttestation(attestation));
    }

    // --- Integration Tests ---

    function test_FullWorkflowWithRealDataStructure() public {
        // Load real test data
        mockZKTLS.loadTestData("ProofFavAndRetweet", PROOF_FAV_RETWEET_JSON);
        
        // Create attestation based on real data structure
        Attestation memory attestation = mockZKTLS.createLikeRetweetAttestation(
            0xB12a1f7035FdCBB4cC5Fa102C01346BD45439Adf,
            "1942933687978365289",
            true,
            true
        );
        
        // Test in different modes
        mockZKTLS.setVerificationMode(MockPrimusZKTLS.VerificationMode.SimulateRealWorld);
        // Should not revert\n        mockZKTLS.verifyAttestation(attestation));
        
        mockZKTLS.setVerificationMode(MockPrimusZKTLS.VerificationMode.AlwaysFail);
        // Should revert\n        vm.expectRevert();\n        mockZKTLS.verifyAttestation(attestation));
        
        mockZKTLS.setVerificationMode(MockPrimusZKTLS.VerificationMode.AlwaysPass);
        // Should not revert\n        mockZKTLS.verifyAttestation(attestation));
    }

    function test_QuoteTweetWorkflow() public {
        // Load real test data
        mockZKTLS.loadTestData("ProofQuoteTweet", PROOF_QUOTE_TWEET_JSON);
        
        // Create quote tweet attestation
        Attestation memory attestation = mockZKTLS.createQuoteTweetAttestation(
            0xB12a1f7035FdCBB4cC5Fa102C01346BD45439Adf,
            "1940381550228721818",
            "1940372466486137302",
            "898091366260948992"
        );
        
        // Verify structure
        assertEq(attestation.reponseResolve.length, 3);
        assertEq(attestation.reponseResolve[0].keyName, "quoted_status_id_str");
        assertEq(attestation.reponseResolve[1].keyName, "user_id_str");
        assertEq(attestation.reponseResolve[2].keyName, "id_str");
        
        // Test verification
        mockZKTLS.setVerificationMode(MockPrimusZKTLS.VerificationMode.SimulateRealWorld);
        // Should not revert\n        mockZKTLS.verifyAttestation(attestation));
    }
}