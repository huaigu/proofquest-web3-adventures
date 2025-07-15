// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IPrimusZKTLS, Attestation, RequestData, ResponseResolve, Attestor} from "../../lib/zktls-contracts/src/IPrimusZKTLS.sol";
import "../utils/JsonParser.sol";
import "../utils/StringUtils.sol";

/**
 * @title MockPrimusZKTLS
 * @author Primus Labs
 * @notice Mock implementation of IPrimusZKTLS for comprehensive testing
 * @dev This contract provides configurable verification behavior to test various scenarios:
 *      - Success/failure modes for attestation verification
 *      - Specific attestation ID verification results
 *      - Error condition simulation
 *      - Real zkTLS data format compatibility
 *      - Helper functions for test data creation and JSON loading
 */
contract MockPrimusZKTLS is IPrimusZKTLS {
    using JsonParser for string;
    using StringUtils for string;

    // --- Enums ---
    
    enum VerificationMode {
        AlwaysPass,         // Always return true for verifyAttestation
        AlwaysFail,         // Always return false for verifyAttestation
        Configurable,       // Use per-attestation configuration
        SimulateRealWorld   // Simulate real-world verification logic
    }

    // --- State Variables ---

    /// @notice Current verification mode
    VerificationMode public verificationMode;
    
    /// @notice The verifier address used in the system
    address public verifier;
    
    /// @notice Mapping to track used attestation IDs
    mapping(bytes32 => bool) public usedAttestationIds;
    
    /// @notice Mapping to configure specific attestation verification results
    mapping(bytes32 => bool) public attestationResults;
    
    /// @notice Mapping to store real test data for specific scenarios
    mapping(string => string) public testDataStorage;
    
    /// @notice Mapping to track simulated signature verification results
    mapping(bytes => bool) public signatureVerificationResults;

    // --- Events ---
    
    event VerificationModeChanged(VerificationMode newMode);
    event AttestationResultConfigured(bytes32 indexed attestationId, bool result);
    event TestDataLoaded(string indexed dataKey, uint256 dataLength);
    event SignatureVerificationConfigured(bytes signature, bool result);

    // --- Constructor ---

    constructor(address _verifier) {
        verifier = _verifier;
        verificationMode = VerificationMode.SimulateRealWorld;
    }

    // --- Configuration Functions ---

    /**
     * @notice Set the verification mode for testing different scenarios
     * @param _mode The new verification mode
     */
    function setVerificationMode(VerificationMode _mode) external {
        verificationMode = _mode;
        emit VerificationModeChanged(_mode);
    }

    /**
     * @notice Configure verification result for a specific attestation
     * @param _attestationId The attestation ID
     * @param _result The verification result to return
     */
    function setAttestationResult(bytes32 _attestationId, bool _result) external {
        attestationResults[_attestationId] = _result;
        emit AttestationResultConfigured(_attestationId, _result);
    }

    /**
     * @notice Set the verifier address
     * @param _verifier The new verifier address
     */
    function setVerifier(address _verifier) external {
        verifier = _verifier;
    }

    /**
     * @notice Mark an attestation ID as used for testing
     * @param _id The attestation ID to mark as used
     */
    function markAttestationAsUsed(bytes32 _id) external {
        usedAttestationIds[_id] = true;
    }

    /**
     * @notice Configure signature verification result
     * @param _signature The signature to configure
     * @param _result The verification result
     */
    function setSignatureVerificationResult(bytes calldata _signature, bool _result) external {
        signatureVerificationResults[_signature] = _result;
        emit SignatureVerificationConfigured(_signature, _result);
    }

    // --- Test Data Management ---

    /**
     * @notice Load real test data from JSON files for testing
     * @param _dataKey Unique key for the test data (e.g., "ProofFavAndRetweet", "ProofQuoteTweet")
     * @param _jsonData The JSON data string
     */
    function loadTestData(string calldata _dataKey, string calldata _jsonData) external {
        testDataStorage[_dataKey] = _jsonData;
        emit TestDataLoaded(_dataKey, bytes(_jsonData).length);
    }

    /**
     * @notice Get stored test data
     * @param _dataKey The key for the test data
     * @return The stored JSON data
     */
    function getTestData(string calldata _dataKey) external view returns (string memory) {
        return testDataStorage[_dataKey];
    }

    // --- Helper Functions for Test Data Creation ---

    /**
     * @notice Create a test attestation from real zkTLS data format
     * @param _recipient The recipient address
     * @param _jsonData The JSON data representing the zkTLS response
     * @param _timestamp The timestamp for the attestation
     * @return attestation The created attestation
     */
    function createTestAttestationFromJson(
        address _recipient,
        string calldata _jsonData,
        uint256 _timestamp
    ) external pure returns (Attestation memory attestation) {
        // Parse the JSON data to extract components
        // This is a simplified implementation - in real tests, you'd pass structured data
        
        attestation.recipient = _recipient;
        
        // Create basic request data
        attestation.request = RequestData({
            url: _jsonData.getString("request.url"),
            header: _jsonData.getString("request.header"),
            method: _jsonData.getString("request.method"),
            body: _jsonData.getString("request.body")
        });

        // Set the main data
        attestation.data = _jsonData.getString("data");
        attestation.timestamp = _timestamp;
        attestation.additionParams = _jsonData.getString("additionParams");
        attestation.extendedData = _jsonData.getString("extendedData");

        // Create attestor array (simplified)
        attestation.attestors = new Attestor[](1);
        attestation.attestors[0] = Attestor({
            attestorAddr: address(0xDB736B13E2f522dBE18B2015d0291E4b193D8eF6), // From real data
            url: "https://primuslabs.xyz"
        });

        // Create signatures array (simplified)
        attestation.signatures = new bytes[](1);
        attestation.signatures[0] = abi.encodePacked(_jsonData.getString("signatures[0]"));

        return attestation;
    }

    /**
     * @notice Create a test attestation for Like & Retweet quest
     * @param _recipient The recipient address
     * @param _tweetId The target tweet ID
     * @param _favorited Whether the tweet is favorited
     * @param _retweeted Whether the tweet is retweeted
     * @return attestation The created attestation
     */
    function createLikeRetweetAttestation(
        address _recipient,
        string calldata _tweetId,
        bool _favorited,
        bool _retweeted
    ) external view returns (Attestation memory attestation) {
        attestation.recipient = _recipient;
        
        // Create realistic request URL for Twitter API
        string memory url = string(abi.encodePacked(
            "https://x.com/i/api/graphql/FJGOFKfjA67MmT4I9p1qZg/TweetDetail?variables=%7B%22focalTweetId%22%3A%22",
            _tweetId,
            "%22%2C%22with_rux_injections%22%3Afalse%7D"
        ));
        
        attestation.request = RequestData({
            url: url,
            header: "",
            method: "GET",
            body: ""
        });

        // Create ResponseResolve array
        attestation.responseResolve = new ResponseResolve[](2);
        attestation.responseResolve[0] = ResponseResolve({
            keyName: "favorited",
            parseType: "",
            parsePath: "$.data.threaded_conversation_with_injections_v2.instructions[0].entries[0].content.itemContent.tweet_results.result.legacy.favorited"
        });
        attestation.responseResolve[1] = ResponseResolve({
            keyName: "retweeted",
            parseType: "",
            parsePath: "$.data.threaded_conversation_with_injections_v2.instructions[0].entries[0].content.itemContent.tweet_results.result.legacy.retweeted"
        });

        // Create data JSON
        string memory favStr = _favorited ? "true" : "false";
        string memory retStr = _retweeted ? "true" : "false";
        attestation.data = string(abi.encodePacked(
            '{"favorited":"', favStr, '","retweeted":"', retStr, '"}'
        ));

        attestation.timestamp = block.timestamp;
        attestation.additionParams = '{"algorithmType":"proxytls"}';

        // Create attestor
        attestation.attestors = new Attestor[](1);
        attestation.attestors[0] = Attestor({
            attestorAddr: verifier,
            url: "https://primuslabs.xyz"
        });

        // Create mock signature (65 bytes to pass length check)
        attestation.signatures = new bytes[](1);
        bytes32 hash = keccak256(abi.encode(attestation.data, attestation.timestamp));
        attestation.signatures[0] = abi.encodePacked(hash, hash, uint8(27)); // 32 + 32 + 1 = 65 bytes

        attestation.extendedData = attestation.data;

        return attestation;
    }

    /**
     * @notice Create a test attestation for Quote Tweet quest
     * @param _recipient The recipient address
     * @param _userTweetId The user's quote tweet ID
     * @param _quotedTweetId The original tweet being quoted
     * @param _userId The user's Twitter ID
     * @return attestation The created attestation
     */
    function createQuoteTweetAttestation(
        address _recipient,
        string calldata _userTweetId,
        string calldata _quotedTweetId,
        string calldata _userId
    ) external view returns (Attestation memory attestation) {
        attestation.recipient = _recipient;
        
        // Create realistic request URL for Twitter API
        string memory url = string(abi.encodePacked(
            "https://x.com/i/api/graphql/FJGOFKfjA67MmT4I9p1qZg/TweetDetail?variables=%7B%22focalTweetId%22%3A%22",
            _userTweetId,
            "%22%2C%22with_rux_injections%22%3Afalse%7D"
        ));
        
        attestation.request = RequestData({
            url: url,
            header: "",
            method: "GET",
            body: ""
        });

        // Create ResponseResolve array
        attestation.responseResolve = new ResponseResolve[](3);
        attestation.responseResolve[0] = ResponseResolve({
            keyName: "quoted_status_id_str",
            parseType: "",
            parsePath: "$.data.threaded_conversation_with_injections_v2.instructions[0].entries[0].content.itemContent.tweet_results.result.legacy.quoted_status_id_str"
        });
        attestation.responseResolve[1] = ResponseResolve({
            keyName: "user_id_str",
            parseType: "",
            parsePath: "$.data.threaded_conversation_with_injections_v2.instructions[0].entries[0].content.itemContent.tweet_results.result.legacy.user_id_str"
        });
        attestation.responseResolve[2] = ResponseResolve({
            keyName: "id_str",
            parseType: "",
            parsePath: "$.data.threaded_conversation_with_injections_v2.instructions[0].entries[0].content.itemContent.tweet_results.result.legacy.id_str"
        });

        // Create data JSON
        attestation.data = string(abi.encodePacked(
            '{"user_id_str":"', _userId, 
            '","id_str":"', _userTweetId,
            '","quoted_status_id_str":"', _quotedTweetId, '"}'
        ));

        attestation.timestamp = block.timestamp;
        attestation.additionParams = '{"algorithmType":"proxytls"}';

        // Create attestor
        attestation.attestors = new Attestor[](1);
        attestation.attestors[0] = Attestor({
            attestorAddr: verifier,
            url: "https://primuslabs.xyz"
        });

        // Create mock signature (65 bytes to pass length check)
        attestation.signatures = new bytes[](1);
        bytes32 hash = keccak256(abi.encode(attestation.data, attestation.timestamp));
        attestation.signatures[0] = abi.encodePacked(hash, hash, uint8(27)); // 32 + 32 + 1 = 65 bytes

        attestation.extendedData = attestation.data;

        return attestation;
    }

    // --- IPrimusZKTLS Implementation ---

    /**
     * @inheritdoc IPrimusZKTLS
     */
    function verifyAttestation(Attestation calldata _attestation) external view override returns (bool) {
        if (verificationMode == VerificationMode.AlwaysPass) {
            return true;
        }
        
        if (verificationMode == VerificationMode.AlwaysFail) {
            return false;
        }
        
        if (verificationMode == VerificationMode.Configurable) {
            bytes32 attestationId = _getAttestationId(_attestation);
            return attestationResults[attestationId];
        }
        
        if (verificationMode == VerificationMode.SimulateRealWorld) {
            return _simulateRealWorldVerification(_attestation);
        }
        
        return false;
    }

    /**
     * @inheritdoc IPrimusZKTLS
     */
    function getVerifier() external view override returns (address) {
        return verifier;
    }

    /**
     * @inheritdoc IPrimusZKTLS
     */
    function isUsed(bytes32 _id) external view override returns (bool) {
        return usedAttestationIds[_id];
    }

    // --- Internal Functions ---

    /**
     * @notice Simulate real-world verification logic
     * @param _attestation The attestation to verify
     * @return bool True if verification passes
     */
    function _simulateRealWorldVerification(Attestation calldata _attestation) internal view returns (bool) {
        // Check basic structure
        if (_attestation.recipient == address(0)) {
            return false;
        }
        
        // Check timestamp (not too old, not in future)
        if (_attestation.timestamp == 0 || _attestation.timestamp > block.timestamp) {
            return false;
        }
        
        // Check if timestamp is reasonable (within last 24 hours)
        // In testing environment (block.timestamp < 1000), be more lenient
        uint256 maxAge = block.timestamp < 1000 ? block.timestamp : 24 hours;
        if (_attestation.timestamp > block.timestamp || block.timestamp - _attestation.timestamp > maxAge) {
            return false;
        }
        
        // Check attestor array is not empty
        if (_attestation.attestors.length == 0) {
            return false;
        }
        
        // Check signatures array matches attestors
        if (_attestation.signatures.length != _attestation.attestors.length) {
            return false;
        }
        
        // Check data is not empty
        if (bytes(_attestation.data).length == 0) {
            return false;
        }
        
        // Check URL structure (should be Twitter/X API)
        if (!_attestation.request.url.contains("x.com") && !_attestation.request.url.contains("twitter.com")) {
            return false;
        }
        
        // Simulate signature verification
        for (uint256 i = 0; i < _attestation.signatures.length; i++) {
            bytes memory signature = _attestation.signatures[i];
            
            // Default: simulate signature verification based on signature length
            if (signature.length < 65) {
                return false;
            }
        }
        
        return true;
    }

    /**
     * @notice Generate a unique ID for an attestation
     * @param _attestation The attestation
     * @return The unique attestation ID
     */
    function _getAttestationId(Attestation calldata _attestation) internal pure returns (bytes32) {
        return keccak256(abi.encode(
            _attestation.recipient,
            _attestation.data,
            _attestation.timestamp,
            _attestation.request.url
        ));
    }

    // --- View Functions for Testing ---

    /**
     * @notice Get attestation ID for testing purposes
     * @param _attestation The attestation
     * @return The attestation ID
     */
    function getAttestationId(Attestation calldata _attestation) external pure returns (bytes32) {
        return _getAttestationId(_attestation);
    }

    /**
     * @notice Check if attestation would pass real-world verification
     * @param _attestation The attestation to check
     * @return bool True if it would pass
     */
    function checkRealWorldVerification(Attestation calldata _attestation) external view returns (bool) {
        return _simulateRealWorldVerification(_attestation);
    }

    /**
     * @notice Debug function to check verification step by step
     * @param _attestation The attestation to check
     * @return steps Array of verification step results
     */
    function debugVerification(Attestation calldata _attestation) external view returns (bool[] memory steps) {
        steps = new bool[](6);
        
        // Step 0: Check recipient
        steps[0] = _attestation.recipient != address(0);
        
        // Step 1: Check timestamp not zero and not future
        steps[1] = _attestation.timestamp != 0 && _attestation.timestamp <= block.timestamp;
        
        // Step 2: Check timestamp not too old
        uint256 maxAge = block.timestamp < 1000 ? block.timestamp : 24 hours;
        steps[2] = _attestation.timestamp <= block.timestamp && block.timestamp - _attestation.timestamp <= maxAge;
        
        // Step 3: Check attestor array not empty
        steps[3] = _attestation.attestors.length > 0;
        
        // Step 4: Check signatures match attestors
        steps[4] = _attestation.signatures.length == _attestation.attestors.length;
        
        // Step 5: Check data not empty
        steps[5] = bytes(_attestation.data).length > 0;
        
        return steps;
    }

    /**
     * @notice Get current verification mode
     * @return The current verification mode
     */
    function getCurrentVerificationMode() external view returns (VerificationMode) {
        return verificationMode;
    }

    /**
     * @notice Check if specific signature verification is configured
     * @param _signature The signature to check
     * @return bool True if configured to pass
     */
    function isSignatureConfiguredToPass(bytes calldata _signature) external view returns (bool) {
        return signatureVerificationResults[_signature];
    }

    // --- Utility Functions ---

    /**
     * @notice Reset all configurations to default state
     */
    function resetToDefaults() external {
        verificationMode = VerificationMode.SimulateRealWorld;
        emit VerificationModeChanged(verificationMode);
    }

    /**
     * @notice Batch configure multiple attestation results
     * @param _attestationIds Array of attestation IDs
     * @param _results Array of corresponding results
     */
    function batchSetAttestationResults(
        bytes32[] calldata _attestationIds,
        bool[] calldata _results
    ) external {
        require(_attestationIds.length == _results.length, "Array length mismatch");
        
        for (uint256 i = 0; i < _attestationIds.length; i++) {
            attestationResults[_attestationIds[i]] = _results[i];
            emit AttestationResultConfigured(_attestationIds[i], _results[i]);
        }
    }

    /**
     * @notice Clear all used attestation IDs (for test cleanup)
     */
    function clearUsedAttestationIds() external {
        // Note: In a real implementation, you'd need to track all used IDs
        // This is a simplified version for testing
    }
}