import { keccak256, toUtf8Bytes } from "ethers";
import type { MedicalRecord, Pet } from "@prisma/client";

const RECORD_TYPE_INDEX: Record<string, number> = {
  VACCINE: 0,
  DIAGNOSIS: 1,
  TRANSFER: 2,
  OTHER: 3,
};

export function recordTypeToIndex(recordType: string) {
  return RECORD_TYPE_INDEX[recordType] ?? 3;
}

export function hashToBytes32(input: string) {
  return keccak256(toUtf8Bytes(input));
}

function sortValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sortValue);
  }
  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>).sort(
      ([a], [b]) => a.localeCompare(b)
    );
    return Object.fromEntries(entries.map(([key, val]) => [key, sortValue(val)]));
  }
  return value;
}

export function canonicalJson(payload: Record<string, unknown>) {
  return JSON.stringify(sortValue(payload));
}

export function buildRecordPayload(record: MedicalRecord, pet: Pet) {
  return {
    recordId: record.id,
    petId: pet.id,
    visitDate: record.visitDate.toISOString(),
    symptoms: record.symptoms,
    diagnosis: record.diagnosis,
    treatment: record.treatment,
    cost: record.cost,
    recordType: record.recordType,
  };
}

export function buildRecordHash(record: MedicalRecord, pet: Pet) {
  const payload = buildRecordPayload(record, pet);
  const canonical = canonicalJson(payload);
  return keccak256(toUtf8Bytes(canonical));
}

export function buildTypedData(params: {
  chainId: number;
  verifyingContract: string;
  recordIdBytes32: string;
  petIdBytes32: string;
  recordHash: string;
  issuedAt: bigint;
  recordType: string;
}) {
  return {
    domain: {
      name: "PetAttestation",
      version: "1",
      chainId: params.chainId,
      verifyingContract: params.verifyingContract,
    },
    types: {
      MedicalAttestation: [
        { name: "recordId", type: "bytes32" },
        { name: "petId", type: "bytes32" },
        { name: "recordHash", type: "bytes32" },
        { name: "issuedAt", type: "uint64" },
        { name: "recordType", type: "uint8" },
      ],
    },
    message: {
      recordId: params.recordIdBytes32,
      petId: params.petIdBytes32,
      recordHash: params.recordHash,
      issuedAt: Number(params.issuedAt),
      recordType: recordTypeToIndex(params.recordType),
    },
  };
}
