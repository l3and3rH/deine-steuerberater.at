import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim();
  if (!q || q.length < 2) return NextResponse.json({ cities: [], profiles: [] });

  const lower = q.toLowerCase();

  const [cities, profiles] = await Promise.all([
    prisma.stadt.findMany({
      where: { name: { contains: q, mode: "insensitive" } },
      select: { name: true, slug: true, bundesland: true },
      take: 4,
    }),
    prisma.steuerberaterProfile.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { plz: { startsWith: q } },
          { tags: { hasSome: [q] } },
        ],
      },
      select: {
        name: true,
        slug: true,
        plz: true,
        tags: true,
        paket: true,
        staedte: {
          select: { stadt: { select: { slug: true, name: true } } },
          take: 1,
        },
      },
      take: 6,
    }),
  ]);

  return NextResponse.json({
    cities,
    profiles: profiles.map((p) => ({
      name: p.name,
      slug: p.slug,
      plz: p.plz,
      tags: p.tags.slice(0, 3),
      paket: p.paket,
      stadtSlug: p.staedte[0]?.stadt.slug ?? null,
      stadtName: p.staedte[0]?.stadt.name ?? null,
    })),
  });
}
