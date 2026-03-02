import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  kontaktEmail: z.string().email(),
  nachricht: z.string().min(10).max(2000),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Ungültige Eingabe" }, { status: 400 });

  await prisma.sEOAnfrage.create({ data: parsed.data });
  return NextResponse.json({ ok: true });
}
