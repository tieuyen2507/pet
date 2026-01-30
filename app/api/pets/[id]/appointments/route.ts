import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuthSession } from "@/lib/api";
import { appointmentCreateSchema } from "@/lib/validation";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const session = await requireAuthSession();
  if (!session) {
    return NextResponse.json({ error: "Không có quyền truy cập." }, { status: 401 });
  }

  const pet = await prisma.pet.findFirst({
    where: { id: params.id, ownerId: session.user.id },
  });
  if (!pet) {
    return NextResponse.json({ error: "Không tìm thấy thú cưng." }, { status: 404 });
  }

  const appointments = await prisma.appointment.findMany({
    where: { petId: params.id },
    orderBy: { startAt: "asc" },
  });

  return NextResponse.json({ appointments });
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await requireAuthSession();
  if (!session) {
    return NextResponse.json({ error: "Không có quyền truy cập." }, { status: 401 });
  }

  const pet = await prisma.pet.findFirst({
    where: { id: params.id, ownerId: session.user.id },
  });
  if (!pet) {
    return NextResponse.json({ error: "Không tìm thấy thú cưng." }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const parsed = appointmentCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dữ liệu không hợp lệ.", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const appointment = await prisma.appointment.create({
    data: {
      petId: params.id,
      type: parsed.data.type,
      note: parsed.data.note ?? null,
      startAt: new Date(parsed.data.startAt),
    },
  });

  return NextResponse.json({ appointment }, { status: 201 });
}
