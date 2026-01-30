import { expect } from "chai";
import { ethers } from "hardhat";

describe("MedicalRecordAnchor", function () {
  async function deployFixture() {
    const [owner, other] = await ethers.getSigners();

    const PetRegistry = await ethers.getContractFactory("PetRegistry");
    const petRegistry = await PetRegistry.deploy();
    await petRegistry.waitForDeployment();

    const Anchor = await ethers.getContractFactory("MedicalRecordAnchor");
    const anchor = await Anchor.deploy(await petRegistry.getAddress());
    await anchor.waitForDeployment();

    return { owner, other, petRegistry, anchor };
  }

  it("owner anchor ok", async function () {
    const { owner, petRegistry, anchor } = await deployFixture();
    const petId = 1;
    const recordHash = ethers.keccak256(ethers.toUtf8Bytes("record-1"));

    await petRegistry.connect(owner).registerPet(petId);

    const anchorId = ethers.solidityPackedKeccak256(
      ["bytes32", "uint256", "address"],
      [recordHash, petId, owner.address]
    );

    await expect(anchor.connect(owner).anchorRecord(recordHash, petId))
      .to.emit(anchor, "RecordAnchored")
      .withArgs(anchorId, recordHash, petId, owner.address);

    expect(await anchor.anchored(recordHash)).to.equal(true);
  });

  it("non-owner revert", async function () {
    const { owner, other, petRegistry, anchor } = await deployFixture();
    const petId = 2;
    const recordHash = ethers.keccak256(ethers.toUtf8Bytes("record-2"));

    await petRegistry.connect(owner).registerPet(petId);

    await expect(
      anchor.connect(other).anchorRecord(recordHash, petId)
    ).to.be.revertedWith("NOT_OWNER");
  });

  it("duplicate hash revert", async function () {
    const { owner, petRegistry, anchor } = await deployFixture();
    const petId = 3;
    const recordHash = ethers.keccak256(ethers.toUtf8Bytes("record-3"));

    await petRegistry.connect(owner).registerPet(petId);
    await anchor.connect(owner).anchorRecord(recordHash, petId);

    await expect(
      anchor.connect(owner).anchorRecord(recordHash, petId)
    ).to.be.revertedWith("RECORD_ALREADY_ANCHORED");
  });
});
