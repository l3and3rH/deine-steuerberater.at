import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Ungültige Eingabe" }, { status: 400 });

  const { email, password, name } = parsed.data;
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return NextResponse.json({ error: "E-Mail bereits registriert" }, { status: 409 });

  const passwordHash = await bcrypt.hash(password, 12);
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Date.now();

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      profile: {
        create: { name, slug, paket: "BASIC" },
      },
    },
  });

  return NextResponse.json({ id: user.id }, { status: 201 });
}
