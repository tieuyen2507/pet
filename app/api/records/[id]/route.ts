import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { recordCrudUpdateSchema } from "@/lib/validation";
import { serializeMedicalRecord } from "@/lib/serializers";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const record = await prisma.medicalRecord.findFirst({
    where: { id: params.id, pet: { ownerId: session.user.id } },
  });

  if (!record) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ record: serializeMedicalRecord(record) });
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const existing = await prisma.medicalRecord.findFirst({
    where: { id: params.id, pet: { ownerId: session.user.id } },
  });

  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const parsed = recordCrudUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data = parsed.data;
  const updateData: Record<string, unknown> = {};

  if (data.title !== undefined) {
    updateData.title = data.title ?? null;
    updateData.symptoms = data.title ?? "";
  }

  if (data.description !== undefined) {
    updateData.description = data.description ?? null;
    updateData.diagnosis = data.description ?? "";
    updateData.treatment = data.description ?? "";
  }

  if (data.visitDate !== undefined) {
    updateData.visitDate = data.visitDate ? new Date(data.visitDate) : null;
  }

  if (data.attachmentsUrl !== undefined) {
    updateData.attachmentsUrl = data.attachmentsUrl ?? null;
  }

  if (data.recordHash !== undefined) {
    updateData.recordHash = data.recordHash;
  }

  if (data.txHash !== undefined) {
    updateData.txHash = data.txHash ?? null;
  }

  if (data.chainId !== undefined) {
    updateData.chainId = data.chainId ?? null;
  }

  const record = await prisma.medicalRecord.update({
    where: { id: params.id },
    data: updateData,
  });

  return NextResponse.json({ record: serializeMedicalRecord(record) });
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const existing = await prisma.medicalRecord.findFirst({
    where: { id: params.id, pet: { ownerId: session.user.id } },
  });

  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.medicalRecord.delete({ where: { id: params.id } });

  return NextResponse.json({ ok: true });
}
