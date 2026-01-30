import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuthSession } from "@/lib/api";
import { appointmentUpdateSchema } from "@/lib/validation";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await requireAuthSession();
  if (!session) {
    return NextResponse.json({ error: "Không có quyền truy cập." }, { status: 401 });
  }

  const existing = await prisma.appointment.findFirst({
    where: { id: params.id, pet: { ownerId: session.user.id } },
  });
  if (!existing) {
    return NextResponse.json({ error: "Không tìm thấy lịch hẹn." }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const parsed = appointmentUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dữ liệu không hợp lệ.", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const appointment = await prisma.appointment.update({
    where: { id: params.id },
    data: {
      type: parsed.data.type ?? undefined,
      note: parsed.data.note ?? undefined,
      startAt:
        parsed.data.startAt !== undefined
          ? new Date(parsed.data.startAt)
          : undefined,
    },
  });

  return NextResponse.json({ appointment });
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const session = await requireAuthSession();
  if (!session) {
    return NextResponse.json({ error: "Không có quyền truy cập." }, { status: 401 });
  }

  const existing = await prisma.appointment.findFirst({
    where: { id: params.id, pet: { ownerId: session.user.id } },
  });
  if (!existing) {
    return NextResponse.json({ error: "Không tìm thấy lịch hẹn." }, { status: 404 });
  }

  await prisma.appointment.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
