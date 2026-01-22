import type { MedicalRecord } from "@prisma/client";

export function serializeMedicalRecord(record: MedicalRecord) {
  return {
    ...record,
    issuedAt: record.issuedAt.toString(),
  };
}

export function serializeMedicalRecords(records: MedicalRecord[]) {
  return records.map(serializeMedicalRecord);
}
