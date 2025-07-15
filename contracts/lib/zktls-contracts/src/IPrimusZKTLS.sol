// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// Interface for IPrimusZKTLS based on real zkTLS proof data structure
// Updated to match actual ProofFavAndRetweet.json and ProofQuoteTweet.json formats

struct RequestData {
    string url;
    string header;
    string method;
    string body;
}

struct ResponseResolve {
    string keyName;
    string parseType;
    string parsePath;
}

struct Attestor {
    address attestorAddr;
    string url;
}

struct Attestation {
    address recipient;
    RequestData request;
    ResponseResolve[] responseResolve;
    string data;
    string attConditions;
    uint256 timestamp;
    string additionParams;
    Attestor[] attestors;
    bytes[] signatures;
    string extendedData;
}

interface IPrimusZKTLS {
    /**
     * @dev Verifies an attestation
     * @param attestation The attestation to verify
     * @return bool True if the attestation is valid
     */
    function verifyAttestation(Attestation calldata attestation) external view returns (bool);
    
    /**
     * @dev Gets the address of the attestation verifier
     * @return address The verifier address
     */
    function getVerifier() external view returns (address);
    
    /**
     * @dev Checks if an attestation ID has been used
     * @param id The attestation ID to check
     * @return bool True if the ID has been used
     */
    function isUsed(bytes32 id) external view returns (bool);
}