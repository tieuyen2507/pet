import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuthSession } from "@/lib/api";
import { reminderCreateSchema } from "@/lib/validation";

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

  const now = new Date();
  await prisma.reminder.updateMany({
    where: {
      petId: params.id,
      status: { not: "DONE" },
      dueDate: { lt: now },
    },
    data: { status: "OVERDUE" },
  });

  const reminders = await prisma.reminder.findMany({
    where: { petId: params.id },
    orderBy: { dueDate: "asc" },
  });

  return NextResponse.json({ reminders });
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
  const parsed = reminderCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const reminder = await prisma.reminder.create({
    data: {
      petId: params.id,
      type: parsed.data.type,
      title: parsed.data.title,
      dueDate: new Date(parsed.data.dueDate),
      status: parsed.data.status ?? "UPCOMING",
    },
  });

  return NextResponse.json({ reminder }, { status: 201 });
}
