import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  beschreibung: z.string().max(500).optional(),
  telefon: z.string().optional(),
  website: z.string().url().optional().or(z.literal("")),
  tags: z.array(z.string()).max(10),
});

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Ungültige Eingabe" }, { status: 400 });

  const userId = (session.user as any).id;
  await prisma.steuerberaterProfile.update({
    where: { userId },
    data: parsed.data,
  });

  return NextResponse.json({ ok: true });
}
