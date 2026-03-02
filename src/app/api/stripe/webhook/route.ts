import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2024-06-20" });

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  async function updateProfile(subscriptionId: string, paket: "GOLD" | "BASIC", aktivBis?: Date) {
    const sub = await stripe.subscriptions.retrieve(subscriptionId);
    const customerId = sub.customer as string;
    const profile = await prisma.steuerberaterProfile.findFirst({ where: { stripeCustomerId: customerId } });
    if (!profile) return;

    await prisma.steuerberaterProfile.update({
      where: { id: profile.id },
      data: {
        paket,
        paketAktivBis: aktivBis,
        stripeSubscriptionId: paket === "BASIC" ? null : subscriptionId,
      },
    });

    // Revalidate all city pages for this profile
    const staedte = await prisma.steuerberaterStadt.findMany({
      where: { steuerberaterId: profile.id },
      include: { stadt: true },
    });
    for (const s of staedte) {
      await fetch(`${process.env.NEXTAUTH_URL}/api/revalidate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.REVALIDATE_SECRET}`,
        },
        body: JSON.stringify({ path: `/steuerberater/${s.stadt.slug}` }),
      });
    }
  }

  switch (event.type) {
    case "customer.subscription.created":
    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      if (sub.status === "active") {
        const aktivBis = new Date(sub.current_period_end * 1000);
        await updateProfile(sub.id, "GOLD", aktivBis);
      }
      break;
    }
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      await updateProfile(sub.id, "BASIC");
      break;
    }
    case "invoice.payment_failed": {
      // Grace period: don't downgrade immediately, Stripe retries
      break;
    }
  }

  return NextResponse.json({ received: true });
}
