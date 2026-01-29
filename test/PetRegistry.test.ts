import { expect } from "chai";
import hardhat from "hardhat";

const { ethers } = hardhat;

describe("PetRegistry", function () {
  async function deployFixture() {
    const [owner, other] = await ethers.getSigners();
    const factory = await ethers.getContractFactory("PetRegistry");
    const contract = await factory.deploy();
    await contract.waitForDeployment();

    return { contract, owner, other };
  }

  it("should register ok", async function () {
    const { contract, owner } = await deployFixture();

    await expect(contract.connect(owner).registerPet(1))
      .to.emit(contract, "PetRegistered")
      .withArgs(1n, owner.address);

    expect(await contract.petOwner(1)).to.equal(owner.address);
  });

  it("should revert on duplicate", async function () {
    const { contract, owner } = await deployFixture();

    await contract.connect(owner).registerPet(1);

    await expect(contract.connect(owner).registerPet(1)).to.be.revertedWith(
      "PET_EXISTS"
    );
  });

  it("should revert ownerOf unknown", async function () {
    const { contract } = await deployFixture();

    await expect(contract.ownerOf(999)).to.be.revertedWith("PET_NOT_FOUND");
  });
});
