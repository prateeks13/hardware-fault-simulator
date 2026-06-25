export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { z } from "zod";
import { db } from "@/lib/db";
import { gradeSubmission, type Rubric } from "@/lib/ai-grader";
import { todayString, DAILY_AI_GRADING_LIMIT, xpToLevel } from "@/lib/utils";

const gradeSchema = z.object({
  exerciseId: z.string(),
  submission: z.string().min(10).max(2000),
  attemptId:  z.string().optional(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = session.user.id;

  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const parsed = gradeSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });

  const { exerciseId, submission, attemptId } = parsed.data;

  // Check daily quota
  const today = todayString();
  const quota = await db.aiGradingQuota.findUnique({ where: { userId } });
  if (quota && quota.date === today && quota.count >= DAILY_AI_GRADING_LIMIT) {
    return NextResponse.json({ error: "Daily grading limit reached. Try again tomorrow." }, { status: 429 });
  }

  // Load exercise (server-side only — rubric & referenceAnswer stay here)
  const exercise = await db.exercise.findUnique({
    where: { id: exerciseId },
    select: { rubric: true, referenceAnswer: true, level: true, xpReward: true, sectionId: true, section: { select: { skillId: true } } },
  });
  if (!exercise?.rubric) return NextResponse.json({ error: "Exercise not found or not AI-gradable" }, { status: 404 });

  // Check for cached result (same exercise + same userId + already graded attempt)
  if (attemptId) {
    const cached = await db.attempt.findUnique({ where: { id: attemptId } });
    if (cached?.aiScore !== null && cached?.userId === userId) {
      return NextResponse.json({
        aiScore: cached.aiScore,
        aiBreakdown: cached.aiBreakdown,
        aiFeedback: cached.aiFeedback,
        cached: true,
      });
    }
  }

  // Call AI grader
  let result;
  try {
    result = await gradeSubmission(
      exercise.rubric as unknown as Rubric,
      exercise.referenceAnswer,
      submission,
      exercise.level
    );
  } catch (err) {
    console.error("[grade] AI grading failed:", err);
    return NextResponse.json({ error: "Grading service unavailable. Please try again." }, { status: 503 });
  }

  // Persist result to Attempt
  const skillId = exercise.section?.skillId;
  const xpEarned = Math.round((result.total / 100) * exercise.xpReward);

  let savedAttempt;
  if (attemptId) {
    savedAttempt = await db.attempt.update({
      where: { id: attemptId },
      data: {
        aiScore:     result.total,
        aiBreakdown: result.scores as never,
        aiFeedback:  result.feedback,
        gradedAt:    new Date(),
        xpEarned,
        accuracy:    result.total,
      },
    });
  } else {
    savedAttempt = await db.attempt.create({
      data: {
        userId,
        exerciseId,
        answers:    { submission } as never,
        score:      result.total,
        accuracy:   result.total,
        aiScore:    result.total,
        aiBreakdown: result.scores as never,
        aiFeedback:  result.feedback,
        gradedAt:   new Date(),
        xpEarned,
      },
    });
  }

  // Update XP
  if (xpEarned > 0 && skillId) {
    const prog = await db.progress.findUnique({ where: { userId_skillId: { userId, skillId } } });
    if (prog) {
      const newXp    = prog.xp + xpEarned;
      const newLevel = xpToLevel(newXp).level;
      const today2   = new Date().toISOString().slice(0, 10);
      const lastDate = prog.lastActiveDate?.toISOString().slice(0, 10);
      const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
      const newStreak = lastDate === today2
        ? prog.streakCount
        : lastDate === yesterday
          ? prog.streakCount + 1
          : 1;

      await db.progress.update({
        where: { userId_skillId: { userId, skillId } },
        data: {
          xp: newXp, level: newLevel, streakCount: newStreak,
          longestStreak: Math.max(prog.longestStreak, newStreak),
          lastActiveDate: new Date(), totalAttempts: { increment: 1 },
        },
      });
    }
  }

  // Update daily quota
  await db.aiGradingQuota.upsert({
    where:  { userId },
    update: { count: quota?.date === today ? { increment: 1 } : 1, date: today },
    create: { userId, date: today, count: 1 },
  });

  return NextResponse.json({
    attemptId:   savedAttempt.id,
    aiScore:     result.total,
    aiBreakdown: result.scores,
    aiFeedback:  result.feedback,
    corrections: result.corrections,
    strengths:   result.strengths,
    next_steps:  result.next_steps,
    level_estimate: result.level_estimate,
    xpEarned,
    cached: false,
  });
}
