import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuthSession } from "@/lib/api";
import {
  buildRecordHash,
  buildTypedData,
  hashToBytes32,
} from "@/lib/attestation";

export async function POST(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const session = await requireAuthSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const record = await prisma.medicalRecord.findUnique({
    where: { id: params.id },
    include: { pet: true },
  });

  if (!record) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const isOwner = record.pet.ownerId === session.user.id;
  const isVet = session.user.role === "VET" || session.user.role === "ADMIN";

  if (!isOwner && !isVet) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const recordHash = buildRecordHash(record, record.pet);
  const recordIdBytes32 = hashToBytes32(record.id);
  const petIdBytes32 = hashToBytes32(record.pet.id);
  const issuedAt = record.issuedAt ?? BigInt(Math.floor(Date.now() / 1000));

  const chainId = Number(process.env.CHAIN_ID ?? 31337);
  const verifyingContract = process.env.CONTRACT_ADDRESS ?? "";

  if (!verifyingContract) {
    return NextResponse.json(
      { error: "Missing CONTRACT_ADDRESS" },
      { status: 500 }
    );
  }

  await prisma.medicalRecord.update({
    where: { id: record.id },
    data: {
      recordHash,
      recordIdBytes32,
      issuedAt,
    },
  });

  const typedData = buildTypedData({
    chainId,
    verifyingContract,
    recordIdBytes32,
    petIdBytes32,
    recordHash,
    issuedAt,
    recordType: record.recordType,
  });

  return NextResponse.json({
    recordHash,
    recordIdBytes32,
    petIdBytes32,
    issuedAt: issuedAt.toString(),
    typedData,
  });
}
