"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { Flame, Star, BookOpen, Headphones, PenTool, TrendingUp, Trophy, Lock } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress-bar";
import { RadialBarChart, RadialBar, Legend, ResponsiveContainer } from "recharts";
import { getLevelLabel, xpToLevel, formatDate } from "@/lib/utils";

interface SkillProgress {
  skillName: string; skillLabel: string; skillEmoji: string;
  xp: number; level: number; streakCount: number; totalAttempts: number;
  lastActiveDate: string | null;
}
interface AchievementData { title: string; description: string; emoji: string; earnedAt: string; }
interface RecentAttempt {
  id: string; exerciseTitle: string; skillName: string;
  score: number; accuracy: number; xpEarned: number; completedAt: string;
}

const SKILL_ICONS: Record<string, React.ElementType> = {
  READING: BookOpen, LISTENING: Headphones, WRITING: PenTool,
};
const SKILL_COLORS: Record<string, string> = {
  READING: "#3b82f6", LISTENING: "#a855f7", WRITING: "#22c55e",
};
const SKILL_HREFS: Record<string, string> = {
  READING: "/learn/reading", LISTENING: "/learn/listening", WRITING: "/learn/writing",
};

interface Props {
  user: { name?: string | null; email?: string | null; image?: string | null };
  progress: SkillProgress[];
  achievements: AchievementData[];
  totalXp: number;
  maxStreak: number;
  levelInfo: ReturnType<typeof xpToLevel>;
  hasActiveSub: boolean;
  subStatus: string | null;
  subPeriodEnd: string | null;
  recentAttempts: RecentAttempt[];
}

export function DashboardClient({
  user, progress, achievements, totalXp, maxStreak, levelInfo, hasActiveSub, subStatus, subPeriodEnd, recentAttempts,
}: Props) {
  const chartData = progress.map((p) => ({
    name: p.skillLabel,
    xp:   p.xp,
    fill: SKILL_COLORS[p.skillName],
  }));

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 px-4 py-8">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Bonjour, {user.name?.split(" ")[0] ?? "Learner"} 👋
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            {hasActiveSub
              ? "Your subscription is active. Keep learning!"
              : `Subscription: ${subStatus ?? "None"} — `}
            {!hasActiveSub && (
              <Link href="/pricing" className="text-brand-600 font-semibold hover:underline">Upgrade to unlock all content →</Link>
            )}
          </p>
        </motion.div>

        {/* Stats row */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Total XP",      value: totalXp.toLocaleString(), icon: Star,        color: "text-yellow-500" },
            { label: "Global Level",  value: `${levelInfo.level} – ${getLevelLabel(levelInfo.level)}`, icon: TrendingUp, color: "text-brand-500" },
            { label: "Best Streak",   value: `${maxStreak} 🔥`,        icon: Flame,       color: "text-orange-500" },
            { label: "Achievements",  value: achievements.length,       icon: Trophy,      color: "text-purple-500" },
          ].map(({ label, value, icon: Icon, color }, i) => (
            <motion.div key={label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
              <Card>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{label}</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
                  </div>
                  <Icon className={`h-8 w-8 ${color} opacity-80`} />
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* XP level bar */}
        <Card>
          <div className="flex items-center justify-between mb-3">
            <span className="font-semibold text-gray-900 dark:text-white">Level {levelInfo.level} — {getLevelLabel(levelInfo.level)}</span>
            <span className="text-sm text-gray-500">{levelInfo.xpInLevel} / {levelInfo.xpForNext} XP</span>
          </div>
          <ProgressBar value={levelInfo.xpInLevel} max={levelInfo.xpForNext} color="brand" />
          <p className="text-xs text-gray-400 mt-2">{levelInfo.xpForNext - levelInfo.xpInLevel} XP to next level</p>
        </Card>

        {/* Skills */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Skills Progress</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {progress.map((p) => {
              const Icon = SKILL_ICONS[p.skillName] ?? BookOpen;
              const lvl  = xpToLevel(p.xp);
              return (
                <motion.div key={p.skillName} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <Link href={hasActiveSub ? SKILL_HREFS[p.skillName] : "/pricing"}>
                    <Card hover className="relative">
                      {!hasActiveSub && (
                        <div className="absolute inset-0 rounded-2xl bg-white/70 dark:bg-gray-900/70 flex items-center justify-center z-10 backdrop-blur-sm">
                          <Lock className="text-gray-400" />
                        </div>
                      )}
                      <div className="flex items-center gap-3 mb-4">
                        <div className="rounded-xl p-2.5" style={{ backgroundColor: SKILL_COLORS[p.skillName] + "20" }}>
                          <Icon size={20} style={{ color: SKILL_COLORS[p.skillName] }} />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 dark:text-white">{p.skillLabel}</p>
                          <p className="text-xs text-gray-500">Level {p.level} · {p.xp} XP</p>
                        </div>
                        {p.streakCount > 0 && (
                          <div className="ml-auto flex items-center gap-1 text-orange-500 text-sm font-bold">
                            <Flame size={14} /> {p.streakCount}
                          </div>
                        )}
                      </div>
                      <ProgressBar value={lvl.xpInLevel} max={lvl.xpForNext} color="brand" showPercent />
                      <div className="mt-3 flex justify-between text-xs text-gray-400">
                        <span>{p.totalAttempts} exercises</span>
                        <span>{p.lastActiveDate ? formatDate(p.lastActiveDate) : "Not started"}</span>
                      </div>
                    </Card>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Charts + achievements row */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Radial chart */}
          <Card>
            <CardHeader><CardTitle>XP by Skill</CardTitle></CardHeader>
            <ResponsiveContainer width="100%" height={200}>
              <RadialBarChart cx="50%" cy="50%" innerRadius="30%" outerRadius="80%" data={chartData}>
                <RadialBar dataKey="xp" label={{ position: "insideStart", fill: "#fff", fontSize: 10 }} />
                <Legend iconSize={10} layout="horizontal" verticalAlign="bottom" />
              </RadialBarChart>
            </ResponsiveContainer>
          </Card>

          {/* Achievements */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Achievements</CardTitle>
                <Trophy className="text-yellow-500" size={18} />
              </div>
            </CardHeader>
            {achievements.length === 0 ? (
              <p className="text-sm text-gray-400">Complete exercises to earn badges!</p>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {achievements.map((a) => (
                  <div key={a.title} className="flex items-start gap-2 rounded-xl bg-gray-50 dark:bg-gray-800 p-3">
                    <span className="text-2xl">{a.emoji}</span>
                    <div>
                      <p className="text-xs font-bold text-gray-800 dark:text-gray-200">{a.title}</p>
                      <p className="text-xs text-gray-400">{a.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Recent activity */}
        {recentAttempts.length > 0 && (
          <Card>
            <CardHeader><CardTitle>Recent Activity</CardTitle></CardHeader>
            <div className="space-y-3">
              {recentAttempts.map((a) => (
                <div key={a.id} className="flex items-center justify-between py-2 border-b border-gray-50 dark:border-gray-800 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{a.exerciseTitle}</p>
                    <p className="text-xs text-gray-400">{a.skillName} · {formatDate(a.completedAt)}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant={a.accuracy >= 80 ? "success" : a.accuracy >= 50 ? "warning" : "danger"}>
                      {a.accuracy}%
                    </Badge>
                    {a.xpEarned > 0 && <p className="text-xs text-yellow-600 mt-1">+{a.xpEarned} XP</p>}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* CTA if no subscription */}
        {!hasActiveSub && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl bg-gradient-to-r from-brand-600 to-purple-600 p-6 text-white text-center"
          >
            <h3 className="text-xl font-bold">Unlock your full learning potential</h3>
            <p className="text-brand-100 mt-1 text-sm">Access all 24 exercise types, AI grading, and mock exams.</p>
            <Link href="/pricing">
              <Button className="mt-4 bg-white text-brand-700 hover:bg-brand-50">
                Start free trial →
              </Button>
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
}
