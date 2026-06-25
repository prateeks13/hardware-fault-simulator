export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { z } from "zod";
import { db } from "@/lib/db";
import { xpToLevel } from "@/lib/utils";

const submitSchema = z.object({
  exerciseId: z.string(),
  answers:    z.unknown(),
});

type McqAnswer    = { questionIndex: number; selected: string };
type TFAnswer     = { questionIndex: number; answer: "true" | "false" | "not_given" };
type ClozeAnswer  = { blankIndex: number; answer: string };
type OrderAnswer  = { order: number[] };
type JumbleAnswer = { sentence: string };
type ConjugAnswer = { verbIndex: number; answer: string };

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const parsed = submitSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

  const { exerciseId, answers } = parsed.data;

  const exercise = await db.exercise.findUnique({
    where: { id: exerciseId },
    include: { section: { include: { skill: true } } },
  });
  if (!exercise) return NextResponse.json({ error: "Exercise not found" }, { status: 404 });

  // Grade based on exercise type
  const sectionType = exercise.section.type;
  const answerKey   = exercise.answerKey as Record<string, unknown>;
  let score   = 0;
  let accuracy = 0;

  const isAiGraded = ["WRITING_TASK", "GUIDED_PARAGRAPH", "TRANSLATION", "DICTATION"].includes(sectionType);

  if (!isAiGraded) {
    ({ score, accuracy } = grade(sectionType, answers, answerKey, exercise.maxScore));
  }

  const xpEarned = isAiGraded ? 0 : Math.round((accuracy / 100) * exercise.xpReward);

  const attempt = await db.attempt.create({
    data: {
      userId:     session.user.id,
      exerciseId,
      answers:    answers as never,
      score,
      accuracy,
      xpEarned:   isAiGraded ? 0 : xpEarned,
    },
  });

  // Update progress (XP + streak)
  if (!isAiGraded && xpEarned > 0) {
    await updateProgress(session.user.id, exercise.section.skillId, xpEarned);
  }

  return NextResponse.json({
    attemptId: attempt.id,
    score,
    accuracy,
    xpEarned,
    maxScore: exercise.maxScore,
    needsAiGrading: isAiGraded,
    // Correct answers revealed after submission
    correctAnswers: isAiGraded ? null : answerKey,
  });
}

function grade(
  sectionType: string,
  answers: unknown,
  answerKey: Record<string, unknown>,
  maxScore: number
): { score: number; accuracy: number } {
  switch (sectionType) {
    case "MCQ_MOCK_TEST":
    case "LISTENING_MOCK_TEST":
    case "AUDIO_TRUE_FALSE": {
      const ans = answers as McqAnswer[];
      const correct = answerKey.answers as string[];
      const hits = ans.filter((a) => correct[a.questionIndex] === a.selected).length;
      const accuracy = Math.round((hits / correct.length) * 100);
      return { score: Math.round((accuracy / 100) * maxScore), accuracy };
    }
    case "TRUE_FALSE_NOT_GIVEN": {
      const ans = answers as TFAnswer[];
      const correct = answerKey.answers as string[];
      const hits = ans.filter((a) => correct[a.questionIndex] === a.answer).length;
      const accuracy = Math.round((hits / correct.length) * 100);
      return { score: Math.round((accuracy / 100) * maxScore), accuracy };
    }
    case "CLOZE_FILL_BLANK":
    case "FILL_GAP_AUDIO":
    case "SPELLING_ACCENTS": {
      const ans = answers as ClozeAnswer[];
      const correct = answerKey.answers as string[];
      const hits = ans.filter(
        (a) => correct[a.blankIndex]?.toLowerCase().trim() === a.answer.toLowerCase().trim()
      ).length;
      const accuracy = Math.round((hits / correct.length) * 100);
      return { score: Math.round((accuracy / 100) * maxScore), accuracy };
    }
    case "SENTENCE_ORDERING": {
      const ans = answers as OrderAnswer;
      const correct = answerKey.order as number[];
      const hits = ans.order.filter((v, i) => correct[i] === v).length;
      const accuracy = Math.round((hits / correct.length) * 100);
      return { score: Math.round((accuracy / 100) * maxScore), accuracy };
    }
    case "JUMBLE_WORDS": {
      const ans = answers as JumbleAnswer;
      const correct = (answerKey.sentence as string).toLowerCase().trim();
      const submitted = ans.sentence.toLowerCase().trim();
      const accuracy = correct === submitted ? 100 : 0;
      return { score: accuracy === 100 ? maxScore : 0, accuracy };
    }
    case "VERB_CONJUGATION": {
      const ans = answers as ConjugAnswer[];
      const correct = answerKey.answers as string[];
      const hits = ans.filter(
        (a) => correct[a.verbIndex]?.toLowerCase().trim() === a.answer.toLowerCase().trim()
      ).length;
      const accuracy = Math.round((hits / correct.length) * 100);
      return { score: Math.round((accuracy / 100) * maxScore), accuracy };
    }
    default:
      return { score: 0, accuracy: 0 };
  }
}

async function updateProgress(userId: string, skillId: string, xpEarned: number) {
  const today = new Date().toISOString().slice(0, 10);
  const prog  = await db.progress.findUnique({ where: { userId_skillId: { userId, skillId } } });
  if (!prog) return;

  const lastDate = prog.lastActiveDate?.toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);

  let newStreak = prog.streakCount;
  if (lastDate !== today) {
    newStreak = lastDate === yesterday ? prog.streakCount + 1 : 1;
  }

  const newXp    = prog.xp + xpEarned;
  const newLevel = xpToLevel(newXp).level;

  await db.progress.update({
    where: { userId_skillId: { userId, skillId } },
    data:  {
      xp:            newXp,
      level:         newLevel,
      streakCount:   newStreak,
      longestStreak: Math.max(prog.longestStreak, newStreak),
      lastActiveDate: new Date(),
      totalAttempts: { increment: 1 },
    },
  });
}
