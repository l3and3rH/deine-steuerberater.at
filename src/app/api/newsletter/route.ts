import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod/v4";

const schema = z.object({
  email: z.email("Ungültige E-Mail-Adresse"),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  try {
    await prisma.newsletter.create({ data: { email: parsed.data.email } });
  } catch (e: any) {
    if (e?.code === "P2002") {
      return NextResponse.json({ ok: true, message: "Bereits angemeldet" });
    }
    return NextResponse.json({ error: "Fehler beim Speichern" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, message: "Erfolgreich angemeldet" });
}
