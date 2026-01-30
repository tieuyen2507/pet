import { Contract } from "ethers";
import { medicalRecordAnchorAbi } from "@/lib/contract";
import { promises as fs } from "fs";
import path from "path";

type Deployments = {
  chainId?: number;
  MedicalRecordAnchor?: string;
  PetRegistry?: string;
};

const deploymentsPath = path.join(
  process.cwd(),
  "contracts",
  "deployments.local.json"
);

export async function readDeployments(): Promise<Deployments> {
  try {
    const raw = await fs.readFile(deploymentsPath, "utf-8");
    return JSON.parse(raw) as Deployments;
  } catch (error) {
    return {};
  }
}

export async function getMedicalRecordAnchorDeployment() {
  const deployments = await readDeployments();
  return {
    chainId: deployments.chainId ?? 31337,
    address: deployments.MedicalRecordAnchor ?? null,
    petRegistry: deployments.PetRegistry ?? null,
  };
}

export function createMedicalRecordAnchorContract(
  address: string,
  signerOrProvider: any
) {
  return new Contract(address, medicalRecordAnchorAbi, signerOrProvider);
}
