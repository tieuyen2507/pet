import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuthSession, hasVetRole } from "@/lib/api";
import { saveSignatureSchema } from "@/lib/validation";
import { serializeMedicalRecord } from "@/lib/serializers";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await requireAuthSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!hasVetRole(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const record = await prisma.medicalRecord.findUnique({
    where: { id: params.id },
  });
  if (!record) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await request.json();
  const parsed = saveSignatureSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  if (record.recordHash !== parsed.data.recordHash) {
    return NextResponse.json(
      { error: "Record hash mismatch" },
      { status: 400 }
    );
  }

  const updated = await prisma.medicalRecord.update({
    where: { id: params.id },
    data: {
      issuerAddress: parsed.data.issuerAddress.toLowerCase(),
      signature: parsed.data.signature,
      recordHash: parsed.data.recordHash,
    },
  });

  return NextResponse.json({ record: serializeMedicalRecord(updated) });
}
