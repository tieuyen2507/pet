import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuthSession } from "@/lib/api";
import { recordCreateSchema } from "@/lib/validation";
import { buildRecordHash, hashToBytes32 } from "@/lib/attestation";
import { serializeMedicalRecord, serializeMedicalRecords } from "@/lib/serializers";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const session = await requireAuthSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const pet = await prisma.pet.findFirst({
    where: { id: params.id, ownerId: session.user.id },
  });
  if (!pet) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const records = await prisma.medicalRecord.findMany({
    where: { petId: params.id },
    orderBy: { visitDate: "desc" },
  });

  return NextResponse.json({ records: serializeMedicalRecords(records) });
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await requireAuthSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const pet = await prisma.pet.findFirst({
    where: { id: params.id, ownerId: session.user.id },
  });
  if (!pet) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await request.json();
  const parsed = recordCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const recordId = crypto.randomUUID();
  const visitDate = new Date(parsed.data.visitDate);
  const issuedAt = BigInt(Math.floor(Date.now() / 1000));

  const recordHash = buildRecordHash(
    {
      id: recordId,
      petId: params.id,
      visitDate,
      symptoms: parsed.data.symptoms,
      diagnosis: parsed.data.diagnosis,
      treatment: parsed.data.treatment,
      cost: parsed.data.cost,
      recordType: parsed.data.recordType,
      recordIdBytes32: "",
      recordHash: "",
      issuerAddress: null,
      signature: null,
      issuedAt,
      createdAt: new Date(),
    },
    pet
  );

  const recordIdBytes32 = hashToBytes32(recordId);

  const record = await prisma.medicalRecord.create({
    data: {
      id: recordId,
      petId: params.id,
      visitDate,
      symptoms: parsed.data.symptoms,
      diagnosis: parsed.data.diagnosis,
      treatment: parsed.data.treatment,
      cost: parsed.data.cost,
      recordType: parsed.data.recordType,
      recordIdBytes32,
      recordHash,
      issuedAt,
    },
  });

  return NextResponse.json({ record: serializeMedicalRecord(record) }, { status: 201 });
}
