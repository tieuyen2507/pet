// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IPetRegistry {
    function ownerOf(uint256 petId) external view returns (address);
}

contract MedicalRecordAnchor {
    struct Anchor {
        bytes32 anchorId;
        bytes32 recordHash;
        uint256 petId;
        address owner;
        uint64 timestamp;
    }

    IPetRegistry public immutable petRegistry;
    mapping(bytes32 => bool) public anchored;
    mapping(bytes32 => Anchor) public anchors;

    event RecordAnchored(
        bytes32 indexed anchorId,
        bytes32 indexed recordHash,
        uint256 indexed petId,
        address owner
    );

    constructor(address petRegistryAddress) {
        petRegistry = IPetRegistry(petRegistryAddress);
    }

    function anchorRecord(bytes32 recordHash, uint256 petId) external {
        require(petRegistry.ownerOf(petId) == msg.sender, "NOT_OWNER");
        require(!anchored[recordHash], "RECORD_ALREADY_ANCHORED");

        bytes32 anchorId = keccak256(
            abi.encodePacked(recordHash, petId, msg.sender)
        );

        anchored[recordHash] = true;
        anchors[recordHash] = Anchor({
            anchorId: anchorId,
            recordHash: recordHash,
            petId: petId,
            owner: msg.sender,
            timestamp: uint64(block.timestamp)
        });

        emit RecordAnchored(anchorId, recordHash, petId, msg.sender);
    }
}
