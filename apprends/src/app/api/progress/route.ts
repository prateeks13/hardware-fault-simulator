export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const progress = await db.progress.findMany({
    where:   { userId: session.user.id },
    include: { skill: true },
    orderBy: { skill: { name: "asc" } },
  });

  const achievements = await db.userAchievement.findMany({
    where:   { userId: session.user.id },
    include: { achievement: true },
    orderBy: { earnedAt: "desc" },
  });

  const recentAttempts = await db.attempt.findMany({
    where:   { userId: session.user.id },
    include: { exercise: { include: { section: { include: { skill: true } } } } },
    orderBy: { completedAt: "desc" },
    take:    10,
  });

  return NextResponse.json({ progress, achievements, recentAttempts });
}
