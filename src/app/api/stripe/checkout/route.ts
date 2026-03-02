import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2024-06-20" });

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 });

  const userId = (session.user as any).id;
  const profile = await prisma.steuerberaterProfile.findUnique({ where: { userId } });
  if (!profile) return NextResponse.json({ error: "Profil nicht gefunden" }, { status: 404 });

  // Create or retrieve Stripe customer
  let customerId = profile.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: session.user?.email!,
      metadata: { profileId: profile.id },
    });
    customerId = customer.id;
    await prisma.steuerberaterProfile.update({
      where: { id: profile.id },
      data: { stripeCustomerId: customerId },
    });
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [{ price: process.env.STRIPE_PRICE_GOLD!, quantity: 1 }],
    success_url: `${process.env.NEXTAUTH_URL}/dashboard?upgraded=1`,
    cancel_url: `${process.env.NEXTAUTH_URL}/dashboard/upgrade`,
    metadata: { profileId: profile.id },
  });

  return NextResponse.json({ url: checkoutSession.url });
}
