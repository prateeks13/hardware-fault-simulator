"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const FEATURES = [
  "Access to all 24 exercise types",
  "TEF & DELF mock tests",
  "AI-powered writing feedback",
  "Daily streak tracking",
  "XP and level progression",
  "Progress dashboard with charts",
  "CEFR placement test",
  "Audio playback & dictation",
  "Vocabulary SRS flashcards",
  "Mobile-friendly",
];

export default function PricingPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [yearly,   setYearly]   = useState(false);
  const [loading,  setLoading]  = useState<"MONTHLY" | "YEARLY" | null>(null);

  async function subscribe(plan: "MONTHLY" | "YEARLY") {
    if (!session) { router.push("/signup"); return; }
    setLoading(plan);
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan }),
    });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    else setLoading(null);
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 px-4 py-16">
      <div className="mx-auto max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white">Simple pricing</h1>
          <p className="mt-3 text-lg text-gray-500 dark:text-gray-400">7-day free trial. Cancel anytime.</p>

          {/* Toggle */}
          <div className="mt-8 inline-flex items-center gap-3 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-1">
            <button
              onClick={() => setYearly(false)}
              className={`rounded-full px-5 py-2 text-sm font-semibold transition-all ${!yearly ? "bg-brand-600 text-white shadow-sm" : "text-gray-600 dark:text-gray-400"}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setYearly(true)}
              className={`rounded-full px-5 py-2 text-sm font-semibold transition-all ${yearly ? "bg-brand-600 text-white shadow-sm" : "text-gray-600 dark:text-gray-400"}`}
            >
              Yearly <span className="ml-1 text-xs font-bold text-green-600 dark:text-green-400">Save $9</span>
            </button>
          </div>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Monthly */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className={`rounded-2xl border-2 bg-white dark:bg-gray-900 p-8 transition-all ${!yearly ? "border-brand-600 shadow-lg" : "border-gray-200 dark:border-gray-700"}`}
          >
            {!yearly && <div className="mb-3 inline-block rounded-full bg-brand-600 px-3 py-0.5 text-xs font-bold text-white">SELECTED</div>}
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Monthly</h2>
            <div className="mt-4 flex items-baseline gap-1">
              <span className="text-5xl font-extrabold text-gray-900 dark:text-white">$9</span>
              <span className="text-gray-500">/month</span>
            </div>
            <p className="mt-2 text-sm text-gray-500">Billed monthly. Cancel anytime.</p>
            <Button
              className="mt-6 w-full"
              variant={!yearly ? "primary" : "outline"}
              loading={loading === "MONTHLY"}
              onClick={() => subscribe("MONTHLY")}
            >
              Start 7-day free trial
            </Button>
            <ul className="mt-8 space-y-3">
              {FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <CheckCircle size={16} className="text-green-500 mt-0.5 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Yearly */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            className={`rounded-2xl border-2 bg-white dark:bg-gray-900 p-8 transition-all ${yearly ? "border-brand-600 shadow-lg" : "border-gray-200 dark:border-gray-700"}`}
          >
            {yearly && <div className="mb-3 inline-block rounded-full bg-brand-600 px-3 py-0.5 text-xs font-bold text-white">SELECTED</div>}
            <div className="flex items-start justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Yearly</h2>
              <span className="rounded-full bg-green-100 dark:bg-green-900/30 px-2.5 py-0.5 text-xs font-bold text-green-700 dark:text-green-400">Save $9</span>
            </div>
            <div className="mt-4 flex items-baseline gap-1">
              <span className="text-5xl font-extrabold text-gray-900 dark:text-white">$99</span>
              <span className="text-gray-500">/year</span>
            </div>
            <p className="mt-2 text-sm text-gray-500">$8.25/mo — billed annually.</p>
            <Button
              className="mt-6 w-full"
              variant={yearly ? "primary" : "outline"}
              loading={loading === "YEARLY"}
              onClick={() => subscribe("YEARLY")}
            >
              Start 7-day free trial
            </Button>
            <ul className="mt-8 space-y-3">
              {FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <CheckCircle size={16} className="text-green-500 mt-0.5 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        <p className="mt-8 text-center text-sm text-gray-400">
          All plans include a 7-day free trial. No credit card required to create an account.
          Payments are processed securely via Stripe.
        </p>
      </div>
    </div>
  );
}
