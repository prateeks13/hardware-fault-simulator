"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { User, CreditCard, Shield, Calendar } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

interface UserData { name: string | null; email: string; image: string | null; createdAt: string; }
interface SubData { plan: string; status: string; currentPeriodEnd: string | null; isActive: boolean; }

export function AccountClient({ user, subscription }: { user: UserData; subscription: SubData | null }) {
  const [portalLoading, setPortalLoading] = useState(false);

  async function openPortal() {
    setPortalLoading(true);
    const res = await fetch("/api/stripe/portal", { method: "POST" });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    setPortalLoading(false);
  }

  const statusColor: "success" | "warning" | "danger" | "default" =
    subscription?.status === "ACTIVE"   ? "success"
    : subscription?.status === "TRIALING" ? "info" as "default"
    : subscription?.status === "PAST_DUE" ? "warning"
    : "danger";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 px-4 py-8">
      <div className="mx-auto max-w-2xl space-y-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Account Settings</h1>

        {/* Profile */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <div className="flex items-center gap-4 mb-4">
              <div className="h-10 w-10 rounded-full bg-brand-600 flex items-center justify-center text-white">
                <User size={20} />
              </div>
              <h2 className="font-bold text-gray-900 dark:text-white">Profile</h2>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Name</span>
                <span className="text-gray-900 dark:text-white font-medium">{user.name ?? "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Email</span>
                <span className="text-gray-900 dark:text-white font-medium">{user.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Member since</span>
                <span className="text-gray-900 dark:text-white">{formatDate(user.createdAt)}</span>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Subscription */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <div className="flex items-center gap-4 mb-4">
              <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-950 flex items-center justify-center">
                <CreditCard size={20} className="text-purple-600 dark:text-purple-400" />
              </div>
              <h2 className="font-bold text-gray-900 dark:text-white">Subscription</h2>
            </div>

            {subscription ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Plan</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white capitalize">
                    {subscription.plan.toLowerCase()} · <Badge variant={statusColor}>{subscription.status}</Badge>
                  </span>
                </div>
                {subscription.currentPeriodEnd && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      {subscription.isActive ? "Renews on" : "Access until"}
                    </span>
                    <span className="text-sm text-gray-900 dark:text-white">{formatDate(subscription.currentPeriodEnd)}</span>
                  </div>
                )}
                <Button
                  onClick={openPortal}
                  loading={portalLoading}
                  variant="outline"
                  className="w-full mt-2"
                >
                  Manage subscription on Stripe
                </Button>
              </div>
            ) : (
              <div>
                <p className="text-sm text-gray-500 mb-4">You don&apos;t have an active subscription.</p>
                <Link href="/pricing">
                  <Button className="w-full">Start free trial →</Button>
                </Link>
              </div>
            )}
          </Card>
        </motion.div>

        {/* Security */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Card>
            <div className="flex items-center gap-4 mb-4">
              <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-950 flex items-center justify-center">
                <Shield size={20} className="text-green-600 dark:text-green-400" />
              </div>
              <h2 className="font-bold text-gray-900 dark:text-white">Security</h2>
            </div>
            <Link href="/reset-password">
              <Button variant="outline" size="sm">Change password</Button>
            </Link>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
