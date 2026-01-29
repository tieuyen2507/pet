import { expect } from "chai";
import hardhat from "hardhat";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs.js";

const { ethers } = hardhat;

const recordId = ethers.keccak256(ethers.toUtf8Bytes("record-1"));
const petId = ethers.keccak256(ethers.toUtf8Bytes("pet-1"));
const recordHash = ethers.keccak256(ethers.toUtf8Bytes("hash-1"));

describe("PetAttestation", function () {
  async function deployFixture() {
    const [admin, vet, outsider] = await ethers.getSigners();
    const factory = await ethers.getContractFactory("PetAttestation");
    const contract = await factory.deploy(admin.address);
    await contract.waitForDeployment();

    const ADMIN_ROLE = await contract.ADMIN_ROLE();
    const VET_ROLE = await contract.VET_ROLE();

    return { contract, admin, vet, outsider, ADMIN_ROLE, VET_ROLE };
  }

  it("allows admin to grant vet role", async function () {
    const { contract, admin, vet, VET_ROLE } = await deployFixture();

    await expect(contract.connect(admin).grantRole(VET_ROLE, vet.address))
      .to.emit(contract, "RoleGranted")
      .withArgs(VET_ROLE, vet.address, admin.address);
  });

  it("blocks non-vet from attesting", async function () {
    const { contract, outsider } = await deployFixture();

    await expect(
      contract.connect(outsider).attestRecord(recordId, petId, recordHash, 1)
    ).to.be.reverted;
  });

  it("attests record and emits event", async function () {
    const { contract, admin, vet, VET_ROLE } = await deployFixture();

    await contract.connect(admin).grantRole(VET_ROLE, vet.address);

    await expect(
      contract.connect(vet).attestRecord(recordId, petId, recordHash, 2)
    )
      .to.emit(contract, "RecordAttested")
      .withArgs(recordId, petId, recordHash, vet.address, 2n, anyValue);
  });

  it("returns stored attestation", async function () {
    const { contract, admin, vet, VET_ROLE } = await deployFixture();

    await contract.connect(admin).grantRole(VET_ROLE, vet.address);
    await contract.connect(vet).attestRecord(recordId, petId, recordHash, 3);

    const attestation = await contract.getAttestation(recordId);

    expect(attestation.petId).to.equal(petId);
    expect(attestation.recordHash).to.equal(recordHash);
    expect(attestation.issuer).to.equal(vet.address);
    expect(attestation.recordType).to.equal(3n);
    expect(attestation.timestamp).to.be.gt(0n);
  });
});
