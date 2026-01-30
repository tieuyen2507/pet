// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract PetRegistry {
    mapping(uint256 => address) public petOwner;

    event PetRegistered(uint256 indexed petId, address indexed owner);

    function registerPet(uint256 petId) external {
        require(petOwner[petId] == address(0), "PET_EXISTS");
        petOwner[petId] = msg.sender;
        emit PetRegistered(petId, msg.sender);
    }

    function ownerOf(uint256 petId) external view returns (address) {
        require(petOwner[petId] != address(0), "PET_NOT_FOUND");
        return petOwner[petId];
    }
}
