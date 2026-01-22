import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuthSession } from "@/lib/api";
import { reminderUpdateSchema } from "@/lib/validation";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await requireAuthSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const existing = await prisma.reminder.findFirst({
    where: { id: params.id, pet: { ownerId: session.user.id } },
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await request.json();
  const parsed = reminderUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const reminder = await prisma.reminder.update({
    where: { id: params.id },
    data: {
      type: parsed.data.type ?? undefined,
      title: parsed.data.title ?? undefined,
      dueDate:
        parsed.data.dueDate !== undefined
          ? new Date(parsed.data.dueDate)
          : undefined,
      status: parsed.data.status ?? undefined,
    },
  });

  return NextResponse.json({ reminder });
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const session = await requireAuthSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const existing = await prisma.reminder.findFirst({
    where: { id: params.id, pet: { ownerId: session.user.id } },
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.reminder.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
