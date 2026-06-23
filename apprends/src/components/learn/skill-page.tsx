import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Lock, CheckCircle, Circle } from "lucide-react";
import type { SkillName } from "@prisma/client";

const SECTION_ICONS: Record<string, string> = {
  MCQ_MOCK_TEST:          "📝", TRUE_FALSE_NOT_GIVEN: "✅",
  CLOZE_FILL_BLANK:       "🔤", ARTICLE_COMPREHENSION: "📰",
  SENTENCE_ORDERING:      "🔀", GRAMMAR_IN_CONTEXT:    "📖",
  SKIMMING_SCANNING:      "⏱️", VOCABULARY_FLASHCARDS: "🃏",
  LISTENING_MOCK_TEST:    "🎧", DICTATION:             "✍️",
  AUDIO_TRUE_FALSE:       "🔊", FILL_GAP_AUDIO:        "🎵",
  MATCH_AUDIO:            "🎯", SPEED_DRILLS:          "⚡",
  DIALOGUE_COMPREHENSION: "💬", SHADOWING:             "🎤",
  WRITING_TASK:           "📄", JUMBLE_WORDS:          "🧩",
  SENTENCE_CONSTRUCTION:  "🏗️", GUIDED_PARAGRAPH:      "🖊️",
  GRAMMAR_CORRECTION:     "🔧", TRANSLATION:           "🌐",
  VERB_CONJUGATION:       "🔄", SPELLING_ACCENTS:      "é",
};

const CEFR_BADGE: Record<string, "info" | "success" | "warning" | "danger"> = {
  A1: "success", A2: "success", B1: "info", B2: "info", C1: "warning", C2: "danger",
};

export async function SkillPage({ skillName }: { skillName: string }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/signin");

  const skill = await db.skill.findUnique({
    where: { name: skillName as SkillName },
    include: {
      sections: {
        include: {
          exercises: {
            select: { id: true, title: true, level: true, xpReward: true, isFree: true, durationSeconds: true },
            orderBy: { createdAt: "asc" },
          },
        },
        orderBy: { order: "asc" },
      },
    },
  });

  if (!skill) redirect("/dashboard");

  const progress = await db.progress.findUnique({
    where: { userId_skillId: { userId: session.user.id, skillId: skill.id } },
  });

  const attemptedIds = new Set(
    (await db.attempt.findMany({
      where:  { userId: session.user.id, exercise: { section: { skillId: skill.id } } },
      select: { exerciseId: true },
    })).map((a) => a.exerciseId)
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 px-4 py-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-4xl">{skill.emoji}</span>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">{skill.label}</h1>
          </div>
          {progress && (
            <div className="mt-4 rounded-xl bg-white dark:bg-gray-900 p-4 border border-gray-100 dark:border-gray-800">
              <div className="flex items-center justify-between mb-2 text-sm">
                <span className="font-medium text-gray-700 dark:text-gray-300">Level {progress.level} · {progress.xp} XP</span>
                <span className="text-orange-500 font-bold">🔥 {progress.streakCount} day streak</span>
              </div>
              <ProgressBar value={progress.xp % (progress.level * 100)} max={progress.level * 100} color="brand" />
            </div>
          )}
        </div>

        {/* Sections */}
        <div className="space-y-6">
          {skill.sections.map((section, i) => (
            <Card key={section.id} className="overflow-hidden">
              <div className="flex items-start gap-3 mb-4">
                <span className="text-2xl">{SECTION_ICONS[section.type] ?? "📌"}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-bold text-gray-900 dark:text-white">{section.title}</h2>
                    <span className="text-xs text-gray-400">Section {i + 1}</span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{section.description}</p>
                </div>
              </div>

              {section.exercises.length === 0 ? (
                <p className="text-sm text-gray-400 ml-9">Coming soon...</p>
              ) : (
                <div className="ml-9 space-y-2">
                  {section.exercises.map((ex) => {
                    const done = attemptedIds.has(ex.id);
                    return (
                      <Link
                        key={ex.id}
                        href={`/learn/${skillName.toLowerCase()}/${section.type.toLowerCase()}/${ex.id}`}
                        className="flex items-center gap-3 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-3 hover:border-brand-300 hover:shadow-sm transition-all group"
                      >
                        {done
                          ? <CheckCircle size={18} className="text-green-500 shrink-0" />
                          : <Circle size={18} className="text-gray-300 dark:text-gray-600 shrink-0" />}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{ex.title}</p>
                          <p className="text-xs text-gray-400">{ex.durationSeconds ? `${Math.round(ex.durationSeconds / 60)} min` : "Self-paced"} · +{ex.xpReward} XP</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {ex.isFree && <Badge variant="success">Free</Badge>}
                          <Badge variant={CEFR_BADGE[ex.level] ?? "default"}>{ex.level}</Badge>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
