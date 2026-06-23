"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { BookOpen, Headphones, PenTool, Flame, Trophy, TrendingUp, CheckCircle, Star, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  { icon: BookOpen,    label: "Reading",   color: "text-blue-500",  bg: "bg-blue-50 dark:bg-blue-950",   desc: "Comprehension passages, mock tests, vocabulary SRS" },
  { icon: Headphones,  label: "Listening", color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-950", desc: "Dictation, audio drills, dialogue comprehension" },
  { icon: PenTool,     label: "Writing",   color: "text-green-500",  bg: "bg-green-50 dark:bg-green-950",  desc: "Essay tasks, grammar correction, conjugation drills" },
];

const benefits = [
  { icon: Trophy,     text: "TEF & DELF exam-aligned content" },
  { icon: Flame,      text: "Daily streaks that keep you accountable" },
  { icon: TrendingUp, text: "AI-powered grading for free-text answers" },
  { icon: Zap,        text: "Gamified XP and level progression" },
  { icon: Star,       text: "Spaced repetition vocabulary system" },
  { icon: CheckCircle,text: "CEFR placement test on first use" },
];

const FADE_UP = {
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0 },
};

export default function LandingPage() {
  return (
    <div className="overflow-hidden">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-brand-700 via-brand-600 to-purple-700 px-4 py-24 text-center text-white">
        {/* French flag stripe accents */}
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-french-blue via-french-white to-french-red opacity-80" />

        <motion.div
          initial="hidden"
          animate="show"
          variants={{ show: { transition: { staggerChildren: 0.12 } } }}
          className="mx-auto max-w-3xl"
        >
          <motion.div variants={FADE_UP} className="mb-4 text-6xl">🇫🇷</motion.div>
          <motion.h1 variants={FADE_UP} className="text-5xl font-extrabold leading-tight sm:text-6xl">
            Learn French.<br />Pass TEF & DELF.
          </motion.h1>
          <motion.p variants={FADE_UP} className="mt-6 text-xl text-brand-100 max-w-2xl mx-auto">
            A full learning platform with 24 exercise types, AI grading, daily streaks,
            and every skill you need for fluency — from A1 to C1.
          </motion.p>
          <motion.div variants={FADE_UP} className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="bg-white text-brand-700 hover:bg-brand-50 shadow-xl">
                Start learning free →
              </Button>
            </Link>
            <Link href="/pricing">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                See pricing
              </Button>
            </Link>
          </motion.div>
          <motion.p variants={FADE_UP} className="mt-5 text-sm text-brand-200">
            7-day free trial · No credit card required to sign up
          </motion.p>
        </motion.div>
      </section>

      {/* Skills grid */}
      <section className="bg-white dark:bg-gray-950 px-4 py-20">
        <div className="mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Three skills. Eight exercise types each.</h2>
            <p className="mt-3 text-gray-500 dark:text-gray-400">Comprehensive practice from grammar drills to full mock exams.</p>
          </motion.div>
          <div className="grid gap-6 md:grid-cols-3">
            {features.map(({ icon: Icon, label, color, bg, desc }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="rounded-2xl border border-gray-100 dark:border-gray-800 p-6 hover:shadow-lg transition-shadow"
              >
                <div className={`mb-4 inline-flex rounded-xl p-3 ${bg}`}>
                  <Icon className={`h-6 w-6 ${color}`} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{label}</h3>
                <p className="mt-2 text-gray-500 dark:text-gray-400 text-sm">{desc}</p>
                <p className="mt-3 text-xs font-semibold text-brand-600 dark:text-brand-400">8 exercise types →</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-gray-50 dark:bg-gray-900 px-4 py-20">
        <div className="mx-auto max-w-4xl">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12"
          >
            Everything you need to pass
          </motion.h2>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {benefits.map(({ icon: Icon, text }, i) => (
              <motion.div
                key={text}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="flex items-start gap-3 rounded-xl bg-white dark:bg-gray-800 p-4 shadow-sm"
              >
                <Icon className="h-5 w-5 text-brand-600 dark:text-brand-400 mt-0.5 shrink-0" />
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing teaser */}
      <section className="bg-white dark:bg-gray-950 px-4 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="mx-auto max-w-2xl"
        >
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Simple, transparent pricing</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            <div className="rounded-2xl border-2 border-gray-200 dark:border-gray-700 p-6">
              <p className="text-sm font-semibold text-gray-500">Monthly</p>
              <p className="mt-2 text-4xl font-extrabold text-gray-900 dark:text-white">$9<span className="text-lg font-normal text-gray-500">/mo</span></p>
              <Link href="/pricing" className="mt-6 block"><Button variant="outline" className="w-full">Start free trial</Button></Link>
            </div>
            <div className="rounded-2xl border-2 border-brand-600 bg-brand-50 dark:bg-brand-950 p-6 relative">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand-600 px-3 py-0.5 text-xs font-bold text-white">BEST VALUE</span>
              <p className="text-sm font-semibold text-brand-600 dark:text-brand-400">Yearly</p>
              <p className="mt-2 text-4xl font-extrabold text-gray-900 dark:text-white">$99<span className="text-lg font-normal text-gray-500">/yr</span></p>
              <p className="text-xs text-green-600 mt-1 font-semibold">Save $9 vs. monthly</p>
              <Link href="/pricing" className="mt-6 block"><Button className="w-full">Start free trial</Button></Link>
            </div>
          </div>
        </motion.div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-brand-600 to-purple-600 px-4 py-20 text-center text-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold">Ready to start your French journey?</h2>
          <p className="mt-3 text-brand-100">Join thousands of learners preparing for TEF and DELF.</p>
          <Link href="/signup" className="mt-8 inline-block">
            <Button size="lg" className="bg-white text-brand-700 hover:bg-brand-50 shadow-xl">
              Create free account →
            </Button>
          </Link>
        </motion.div>
      </section>
    </div>
  );
}
