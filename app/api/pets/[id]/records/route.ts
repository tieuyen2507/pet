import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { recordCreateSchema, recordCrudCreateSchema } from "@/lib/validation";
import { buildRecordHash, hashToBytes32 } from "@/lib/attestation";
import { serializeMedicalRecord, serializeMedicalRecords } from "@/lib/serializers";
import crypto from "crypto";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
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
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const pet = await prisma.pet.findFirst({
    where: { id: params.id, ownerId: session.user.id },
  });
  if (!pet) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const useNewShape =
    body &&
    (Object.prototype.hasOwnProperty.call(body, "title") ||
      Object.prototype.hasOwnProperty.call(body, "description") ||
      Object.prototype.hasOwnProperty.call(body, "attachmentsUrl"));

  if (useNewShape) {
    const parsed = recordCrudCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payload", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const recordId = crypto.randomUUID();
    const visitDate = new Date(parsed.data.visitDate);
    const issuedAt = BigInt(Math.floor(Date.now() / 1000));
    const recordIdBytes32 = hashToBytes32(recordId);

    const recordHash =
      parsed.data.recordHash ||
      buildRecordHash(
        {
          id: recordId,
          petId: params.id,
          visitDate,
          symptoms: parsed.data.title,
          diagnosis: parsed.data.description,
          treatment: parsed.data.description,
          cost: 0,
          recordType: "OTHER",
          recordIdBytes32: "",
          recordHash: "",
          issuerAddress: null,
          signature: null,
          issuedAt,
          createdAt: new Date(),
        },
        pet
      );

    const record = await prisma.medicalRecord.create({
      data: {
        id: recordId,
        petId: params.id,
        title: parsed.data.title,
        description: parsed.data.description,
        visitDate,
        symptoms: parsed.data.title,
        diagnosis: parsed.data.description,
        treatment: parsed.data.description,
        cost: 0,
        recordType: "OTHER",
        recordIdBytes32,
        recordHash,
        attachmentsUrl: parsed.data.attachmentsUrl ?? null,
        txHash: parsed.data.txHash ?? null,
        chainId: parsed.data.chainId ?? null,
        issuedAt,
      },
    });

    return NextResponse.json(
      { record: serializeMedicalRecord(record) },
      { status: 201 }
    );
  }

  const parsed = recordCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", details: parsed.error.flatten() },
      { status: 400 }
    );
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

  return NextResponse.json(
    { record: serializeMedicalRecord(record) },
    { status: 201 }
  );
}
