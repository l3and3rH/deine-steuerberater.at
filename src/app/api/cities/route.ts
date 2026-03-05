import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const staedte = await prisma.stadt.findMany({
    orderBy: { name: "asc" },
    select: { name: true, slug: true, bundesland: true },
  });
  return NextResponse.json(staedte, {
    headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" },
  });
}
