import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuthSession } from "@/lib/api";
import { petCreateSchema } from "@/lib/validation";

export async function GET(request: Request) {
  const session = await requireAuthSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search")?.trim();

  const pets = await prisma.pet.findMany({
    where: {
      ownerId: session.user.id,
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { breed: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ pets });
}

export async function POST(request: Request) {
  const session = await requireAuthSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = petCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const pet = await prisma.pet.create({
    data: {
      ownerId: session.user.id,
      name: parsed.data.name,
      species: parsed.data.species,
      breed: parsed.data.breed,
      gender: parsed.data.gender,
      birthDate: parsed.data.birthDate ? new Date(parsed.data.birthDate) : null,
      weightKg: parsed.data.weightKg ?? null,
      photoUrl: parsed.data.photoUrl ?? null,
      notes: parsed.data.notes ?? null,
    },
  });

  return NextResponse.json({ pet }, { status: 201 });
}
