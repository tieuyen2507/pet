import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/db";
import { requireAuthSession } from "@/lib/api";
import { getMedicalRecordAnchorDeployment } from "@/lib/web3/contracts";

function petIdToChainValue(petId: string) {
  const hex = petId.replace(/-/g, "");
  return BigInt(`0x${hex}`);
}

export async function POST(request: Request) {
  const session = await requireAuthSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const recordId = body?.recordId as string | undefined;
  if (!recordId) {
    return NextResponse.json({ error: "Thiếu recordId." }, { status: 400 });
  }

  const record = await prisma.medicalRecord.findFirst({
    where: { id: recordId, pet: { ownerId: session.user.id } },
    include: { pet: true },
  });

  if (!record) {
    return NextResponse.json({ error: "Không tìm thấy hồ sơ." }, { status: 404 });
  }

  const title = record.title ?? record.symptoms ?? "";
  const description = record.description ?? record.diagnosis ?? "";
  if (!title || !description) {
    return NextResponse.json(
      { error: "Hồ sơ thiếu tiêu đề hoặc mô tả." },
      { status: 400 }
    );
  }

  const visitDateISO = record.visitDate.toISOString();
  const raw = `${record.petId}|${title}|${description}|${visitDateISO}`;
  const recordHashHex = `0x${crypto
    .createHash("sha256")
    .update(raw)
    .digest("hex")}`;

  const deployment = await getMedicalRecordAnchorDeployment();
  if (!deployment.address) {
    return NextResponse.json(
      { error: "Chưa có địa chỉ MedicalRecordAnchor." },
      { status: 500 }
    );
  }

  const petId = petIdToChainValue(record.petId).toString();

  return NextResponse.json({
    recordHashHex,
    petId,
    chainId: deployment.chainId ?? 31337,
    anchorAddress: deployment.address,
  });
}
