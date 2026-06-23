export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sub = await db.subscription.findUnique({ where: { userId: session.user.id } });
  if (!sub?.stripeCustomerId) return NextResponse.json({ error: "No subscription found" }, { status: 404 });

  const origin = req.headers.get("origin") ?? process.env.NEXTAUTH_URL ?? "http://localhost:3000";

  const portal = await stripe.billingPortal.sessions.create({
    customer:   sub.stripeCustomerId,
    return_url: `${origin}/account`,
  });

  return NextResponse.json({ url: portal.url });
}
