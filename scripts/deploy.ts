import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  const factory = await ethers.getContractFactory("PetAttestation");
  const contract = await factory.deploy(deployer.address);

  await contract.waitForDeployment();

  console.log("PetAttestation deployed to:", await contract.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
