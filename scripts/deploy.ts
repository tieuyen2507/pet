import { ethers } from "hardhat";
import fs from "fs";
import path from "path";

async function main() {
  const [deployer] = await ethers.getSigners();
  const factory = await ethers.getContractFactory("PetRegistry");
  const contract = await factory.deploy();

  await contract.waitForDeployment();

  const address = await contract.getAddress();
  const network = await ethers.provider.getNetwork();
  const chainId = Number(network.chainId);

  const deploymentsPath = path.join(
    __dirname,
    "..",
    "contracts",
    "deployments.local.json"
  );

  let deployments: Record<string, unknown> = {};
  if (fs.existsSync(deploymentsPath)) {
    const raw = fs.readFileSync(deploymentsPath, "utf8");
    if (raw.trim()) {
      deployments = JSON.parse(raw) as Record<string, unknown>;
    }
  }

  const nextDeployments = {
    ...deployments,
    chainId,
    PetRegistry: address,
  };

  fs.writeFileSync(deploymentsPath, JSON.stringify(nextDeployments, null, 2));

  console.log("PetRegistry deployed to:", address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
