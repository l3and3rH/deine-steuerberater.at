import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod/v4";

const reviewSchema = z.object({
  profileId: z.string().min(1),
  authorName: z.string().min(2).max(100),
  authorEmail: z.email(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = reviewSchema.parse(body);

    const profile = await prisma.steuerberaterProfile.findUnique({ where: { id: data.profileId } });
    if (!profile) return NextResponse.json({ error: "Profil nicht gefunden" }, { status: 404 });

    const review = await prisma.review.create({ data });
    return NextResponse.json(review, { status: 201 });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: "Ungültige Daten", details: e.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Interner Fehler" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const profileId = req.nextUrl.searchParams.get("profileId");
  if (!profileId) return NextResponse.json({ error: "profileId fehlt" }, { status: 400 });

  const reviews = await prisma.review.findMany({
    where: { profileId },
    orderBy: { createdAt: "desc" },
  });

  const avg = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  return NextResponse.json({ reviews, average: Math.round(avg * 10) / 10, count: reviews.length });
}
