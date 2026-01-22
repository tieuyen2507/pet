// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";

contract PetAttestation is AccessControl {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant VET_ROLE = keccak256("VET_ROLE");

    struct Attestation {
        bytes32 petId;
        bytes32 recordHash;
        address issuer;
        uint8 recordType;
        uint64 timestamp;
    }

    mapping(bytes32 => Attestation) private attestations;

    event RecordAttested(
        bytes32 indexed recordId,
        bytes32 indexed petId,
        bytes32 recordHash,
        address issuer,
        uint8 recordType,
        uint64 timestamp
    );

    constructor(address admin) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(ADMIN_ROLE, admin);
        _setRoleAdmin(VET_ROLE, ADMIN_ROLE);
    }

    function attestRecord(
        bytes32 recordId,
        bytes32 petId,
        bytes32 recordHash,
        uint8 recordType
    ) external onlyRole(VET_ROLE) {
        Attestation memory attestation = Attestation({
            petId: petId,
            recordHash: recordHash,
            issuer: msg.sender,
            recordType: recordType,
            timestamp: uint64(block.timestamp)
        });

        attestations[recordId] = attestation;

        emit RecordAttested(
            recordId,
            petId,
            recordHash,
            msg.sender,
            recordType,
            attestation.timestamp
        );
    }

    function getAttestation(bytes32 recordId)
        external
        view
        returns (Attestation memory)
    {
        return attestations[recordId];
    }
}
