import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { petUpdateSchema } from "@/lib/validation";

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

  return NextResponse.json({ pet });
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = petUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const existing = await prisma.pet.findFirst({
    where: { id: params.id, ownerId: session.user.id },
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const pet = await prisma.pet.update({
    where: { id: params.id },
    data: {
      name: parsed.data.name ?? undefined,
      species: parsed.data.species ?? undefined,
      breed: parsed.data.breed ?? undefined,
      gender: parsed.data.gender ?? undefined,
      birthDate:
        parsed.data.birthDate !== undefined
          ? parsed.data.birthDate
            ? new Date(parsed.data.birthDate)
            : null
          : undefined,
      weightKg:
        parsed.data.weightKg !== undefined ? parsed.data.weightKg : undefined,
      photoUrl:
        parsed.data.photoUrl !== undefined ? parsed.data.photoUrl : undefined,
      notes: parsed.data.notes !== undefined ? parsed.data.notes : undefined,
    },
  });

  return NextResponse.json({ pet });
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const existing = await prisma.pet.findFirst({
    where: { id: params.id, ownerId: session.user.id },
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.pet.delete({ where: { id: params.id } });

  return NextResponse.json({ ok: true });
}
