// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { IPrimusZKTLS, Attestation } from "@primuslabs/zktls-contracts/src/IPrimusZKTLS.sol";

contract AttestorTest {
    address public primusAddress;

    constructor(address _primusAddress) {
        require(_primusAddress != address(0), "Primus address cannot be zero");
        // Replace with the network you are deploying on
        primusAddress = _primusAddress;
    }

    function verifySignature(Attestation calldata attestation) public view returns(bool) {
        IPrimusZKTLS(primusAddress).verifyAttestation(attestation);

        // Business logic checks, such as attestation content and timestamp checks
        // do your own business logic
        return true;
    }
}