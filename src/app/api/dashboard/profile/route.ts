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

  const userId = session.user.id;
  const profile = await prisma.steuerberaterProfile.findUnique({ where: { userId } });
  if (!profile) return NextResponse.json({ error: "Profil nicht gefunden" }, { status: 404 });

  const updateData: { telefon?: string; website?: string; beschreibung?: string; tags?: string[] } = {
    telefon: parsed.data.telefon,
    website: parsed.data.website,
  };

  // Premium-only fields — enforce server-side regardless of what the client sends
  if (profile.paket !== "BASIC") {
    updateData.beschreibung = parsed.data.beschreibung;
    updateData.tags = parsed.data.tags;
  }

  await prisma.steuerberaterProfile.update({ where: { userId }, data: updateData });

  return NextResponse.json({ ok: true });
}
