import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { DashboardClient } from "./dashboard-client";
import { isActiveSubscription, xpToLevel } from "@/lib/utils";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/signin");

  const [progress, achievements, sub, recentAttempts] = await Promise.all([
    db.progress.findMany({
      where:   { userId: session.user.id },
      include: { skill: true },
      orderBy: { skill: { name: "asc" } },
    }),
    db.userAchievement.findMany({
      where:   { userId: session.user.id },
      include: { achievement: true },
      orderBy: { earnedAt: "desc" },
      take:    6,
    }),
    db.subscription.findUnique({ where: { userId: session.user.id } }),
    db.attempt.findMany({
      where:   { userId: session.user.id },
      include: { exercise: { include: { section: { include: { skill: true } } } } },
      orderBy: { completedAt: "desc" },
      take:    5,
    }),
  ]);

  const totalXp    = progress.reduce((s, p) => s + p.xp, 0);
  const maxStreak  = Math.max(...progress.map((p) => p.streakCount), 0);
  const levelInfo  = xpToLevel(totalXp);

  const hasActiveSub = isActiveSubscription(sub?.status);

  return (
    <DashboardClient
      user={{ name: session.user.name, email: session.user.email, image: session.user.image }}
      progress={progress.map((p) => ({
        skillName: p.skill.name,
        skillLabel: p.skill.label,
        skillEmoji: p.skill.emoji,
        xp: p.xp,
        level: p.level,
        streakCount: p.streakCount,
        totalAttempts: p.totalAttempts,
        lastActiveDate: p.lastActiveDate?.toISOString() ?? null,
      }))}
      achievements={achievements.map((a) => ({
        title: a.achievement.title,
        description: a.achievement.description,
        emoji: a.achievement.emoji,
        earnedAt: a.earnedAt.toISOString(),
      }))}
      totalXp={totalXp}
      maxStreak={maxStreak}
      levelInfo={levelInfo}
      hasActiveSub={hasActiveSub}
      subStatus={sub?.status ?? null}
      subPeriodEnd={sub?.currentPeriodEnd?.toISOString() ?? null}
      recentAttempts={recentAttempts.map((a) => ({
        id: a.id,
        exerciseTitle: a.exercise.title,
        skillName: a.exercise.section.skill.name,
        score: a.score,
        accuracy: a.accuracy,
        xpEarned: a.xpEarned,
        completedAt: a.completedAt.toISOString(),
      }))}
    />
  );
}
