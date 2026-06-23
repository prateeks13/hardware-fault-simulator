export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { z } from "zod";
import { stripe, STRIPE_PRICES } from "@/lib/stripe";
import { db } from "@/lib/db";

const checkoutSchema = z.object({
  plan: z.enum(["MONTHLY", "YEARLY"]),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid plan" }, { status: 400 });

  const { plan } = parsed.data;
  const priceId  = STRIPE_PRICES[plan];

  // Get or create Stripe customer
  let sub = await db.subscription.findUnique({ where: { userId: session.user.id } });
  let customerId = sub?.stripeCustomerId;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: session.user.email,
      name:  session.user.name ?? undefined,
      metadata: { userId: session.user.id },
    });
    customerId = customer.id;
    await db.subscription.upsert({
      where:  { userId: session.user.id },
      update: { stripeCustomerId: customerId },
      create: { userId: session.user.id, stripeCustomerId: customerId },
    });
  }

  const origin = req.headers.get("origin") ?? process.env.NEXTAUTH_URL ?? "http://localhost:3000";

  const checkoutSession = await stripe.checkout.sessions.create({
    customer:            customerId,
    payment_method_types: ["card"],
    line_items:          [{ price: priceId, quantity: 1 }],
    mode:                "subscription",
    success_url:         `${origin}/dashboard?checkout=success`,
    cancel_url:          `${origin}/pricing?checkout=cancelled`,
    subscription_data: {
      trial_period_days: 7,
      metadata: { userId: session.user.id, plan },  // stored on the Stripe Subscription object
    },
  });

  return NextResponse.json({ url: checkoutSession.url });
}
