import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { AccountClient } from "./account-client";
import { isActiveSubscription, formatDate } from "@/lib/utils";

export const metadata = { title: "Account" };

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/signin");

  const [user, sub] = await Promise.all([
    db.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, name: true, email: true, image: true, createdAt: true },
    }),
    db.subscription.findUnique({ where: { userId: session.user.id } }),
  ]);

  return (
    <AccountClient
      user={{
        name:      user?.name ?? null,
        email:     user?.email ?? "",
        image:     user?.image ?? null,
        createdAt: user?.createdAt.toISOString() ?? "",
      }}
      subscription={sub ? {
        plan:            sub.plan,
        status:          sub.status,
        currentPeriodEnd: sub.currentPeriodEnd?.toISOString() ?? null,
        isActive:        isActiveSubscription(sub.status),
      } : null}
    />
  );
}
