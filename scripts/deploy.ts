import { ethers } from "hardhat";
import { promises as fs } from "fs";
import path from "path";

const deploymentsPath = path.join(
  process.cwd(),
  "contracts",
  "deployments.local.json"
);

async function loadDeployments() {
  try {
    const raw = await fs.readFile(deploymentsPath, "utf-8");
    return JSON.parse(raw) as Record<string, string | number>;
  } catch (error) {
    return {};
  }
}

async function saveDeployments(data: Record<string, string | number>) {
  await fs.writeFile(deploymentsPath, JSON.stringify(data, null, 2));
}

async function main() {
  const network = await ethers.provider.getNetwork();
  const chainId = Number(network.chainId);
  const deployments = await loadDeployments();

  let petRegistryAddress = deployments.PetRegistry as string | undefined;
  if (!petRegistryAddress) {
    const PetRegistry = await ethers.getContractFactory("PetRegistry");
    const petRegistry = await PetRegistry.deploy();
    await petRegistry.waitForDeployment();
    petRegistryAddress = await petRegistry.getAddress();
    console.log("PetRegistry deployed to:", petRegistryAddress);
  } else {
    console.log("PetRegistry found at:", petRegistryAddress);
  }

  const MedicalRecordAnchor = await ethers.getContractFactory(
    "MedicalRecordAnchor"
  );
  const anchor = await MedicalRecordAnchor.deploy(petRegistryAddress);
  await anchor.waitForDeployment();

  const anchorAddress = await anchor.getAddress();
  console.log("MedicalRecordAnchor deployed to:", anchorAddress);

  const nextDeployments: Record<string, string | number> = {
    ...deployments,
    chainId,
    PetRegistry: petRegistryAddress,
    MedicalRecordAnchor: anchorAddress,
  };

  await saveDeployments(nextDeployments);

  console.log("Deployments saved to:", deploymentsPath);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
