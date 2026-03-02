import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const profiles = await prisma.steuerberaterProfile.findMany({
    orderBy: { createdAt: "desc" },
    include: { staedte: { include: { stadt: true } } },
  });
  return NextResponse.json(profiles);
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id, verified } = await req.json();
  await prisma.steuerberaterProfile.update({ where: { id }, data: { verified } });
  return NextResponse.json({ ok: true });
}
