import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import { ExercisePlayerWrapper } from "@/components/exercises/exercise-player-wrapper";

interface Props {
  params: Promise<{ skill: string; section: string; exerciseId: string }>;
}

export default async function ExercisePage({ params }: Props) {
  const { exerciseId } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/signin");

  const exercise = await db.exercise.findUnique({
    where: { id: exerciseId },
    select: {
      id: true, title: true, level: true, audioUrl: true,
      durationSeconds: true, payload: true, maxScore: true,
      xpReward: true, isFree: true,
      section: {
        include: {
          skill: true,
          exercises: {
            select: { id: true, title: true },
            orderBy: { createdAt: "asc" },
          },
        },
      },
    },
  });

  if (!exercise) notFound();

  // Check for existing attempt (most recent)
  const lastAttempt = await db.attempt.findFirst({
    where:   { userId: session.user.id, exerciseId },
    orderBy: { completedAt: "desc" },
  });

  return (
    <ExercisePlayerWrapper
      exercise={{
        id:              exercise.id,
        title:           exercise.title,
        level:           exercise.level,
        audioUrl:        exercise.audioUrl,
        durationSeconds: exercise.durationSeconds,
        payload:         exercise.payload as Record<string, unknown>,
        maxScore:        exercise.maxScore,
        xpReward:        exercise.xpReward,
        sectionType:     exercise.section.type,
        sectionTitle:    exercise.section.title,
        skillName:       exercise.section.skill.name,
        skillLabel:      exercise.section.skill.label,
      }}
      prevAttempt={lastAttempt ? {
        id:         lastAttempt.id,
        score:      lastAttempt.score,
        accuracy:   lastAttempt.accuracy,
        xpEarned:   lastAttempt.xpEarned,
        aiScore:    lastAttempt.aiScore,
        aiFeedback: lastAttempt.aiFeedback,
      } : null}
      siblingExercises={exercise.section.exercises.map((e) => ({ id: e.id, title: e.title }))}
    />
  );
}
