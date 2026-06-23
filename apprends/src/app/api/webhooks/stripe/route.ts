export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig  = req.headers.get("stripe-signature");

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("[webhook] Signature verification failed:", err);
    return NextResponse.json({ error: "Signature mismatch" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode !== "subscription") break;
        const stripeSubId = session.subscription as string;
        const customerId  = session.customer as string;
        // Metadata is stored on the subscription itself
        const stripeSub = await stripe.subscriptions.retrieve(stripeSubId);
        const plan = (stripeSub.metadata?.plan as "MONTHLY" | "YEARLY") ?? "MONTHLY";
        const userId = stripeSub.metadata?.userId;

        if (userId) {
          await db.subscription.upsert({
            where:  { userId },
            update: {
              stripeCustomerId:     customerId,
              stripeSubscriptionId: stripeSubId,
              plan,
              status:          mapStatus(stripeSub.status),
              currentPeriodEnd: new Date(stripeSub.current_period_end * 1000),
            },
            create: {
              userId,
              stripeCustomerId:     customerId,
              stripeSubscriptionId: stripeSubId,
              plan,
              status:          mapStatus(stripeSub.status),
              currentPeriodEnd: new Date(stripeSub.current_period_end * 1000),
            },
          });
        }
        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const existing = await db.subscription.findUnique({
          where: { stripeSubscriptionId: sub.id },
        });
        if (existing) {
          await db.subscription.update({
            where: { stripeSubscriptionId: sub.id },
            data:  {
              status:          mapStatus(sub.status),
              currentPeriodEnd: new Date(sub.current_period_end * 1000),
            },
          });
        }
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        await db.subscription.updateMany({
          where: { stripeSubscriptionId: sub.id },
          data:  { status: "CANCELED", currentPeriodEnd: new Date() },
        });
        break;
      }

      default:
        console.info(`[webhook] Unhandled event type: ${event.type}`);
    }
  } catch (err) {
    console.error("[webhook] Handler error:", err);
    return NextResponse.json({ error: "Handler error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

function mapStatus(stripeStatus: string): "ACTIVE" | "INACTIVE" | "TRIALING" | "PAST_DUE" | "CANCELED" {
  switch (stripeStatus) {
    case "active":   return "ACTIVE";
    case "trialing": return "TRIALING";
    case "past_due": return "PAST_DUE";
    case "canceled":
    case "unpaid":   return "CANCELED";
    default:         return "INACTIVE";
  }
}
