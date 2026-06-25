"use client";
import { useState } from "react";
import { McqExercise }         from "./mcq-exercise";
import { TrueFalseExercise }   from "./true-false-exercise";
import { ClozeExercise }       from "./cloze-exercise";
import { SentenceOrderExercise } from "./sentence-order-exercise";
import { JumbleWordsExercise } from "./jumble-words-exercise";
import { DictationExercise }   from "./dictation-exercise";
import { WritingTaskExercise } from "./writing-task-exercise";
import { ConjugationExercise } from "./conjugation-exercise";
import { FlashcardExercise }   from "./flashcard-exercise";
import { ResultScreen }        from "./result-screen";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

const AI_GRADED_TYPES = ["WRITING_TASK", "GUIDED_PARAGRAPH", "TRANSLATION", "DICTATION"];

interface Exercise {
  id: string; title: string; level: string; audioUrl: string | null;
  durationSeconds: number | null; payload: Record<string, unknown>;
  maxScore: number; xpReward: number; sectionType: string;
  sectionTitle: string; skillName: string; skillLabel: string;
}
interface PrevAttempt {
  id: string; score: number; accuracy: number; xpEarned: number;
  aiScore: number | null; aiFeedback: string | null;
}
interface SiblingExercise { id: string; title: string; }

interface Props {
  exercise:         Exercise;
  prevAttempt:      PrevAttempt | null;
  siblingExercises: SiblingExercise[];
}

export function ExercisePlayerWrapper({ exercise, prevAttempt, siblingExercises }: Props) {
  const [result, setResult] = useState<null | {
    attemptId: string; score: number; accuracy: number; xpEarned: number;
    maxScore: number; correctAnswers: unknown; needsAiGrading: boolean;
  }>(null);

  const isAiGraded = AI_GRADED_TYPES.includes(exercise.sectionType);
  const siblingIdx = siblingExercises.findIndex((s) => s.id === exercise.id);
  const prevEx     = siblingIdx > 0                           ? siblingExercises[siblingIdx - 1] : null;
  const nextEx     = siblingIdx < siblingExercises.length - 1 ? siblingExercises[siblingIdx + 1] : null;
  const skillPath  = `/learn/${exercise.skillName.toLowerCase()}`;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 px-4 py-6">
      <div className="mx-auto max-w-3xl">
        {/* Breadcrumb / nav */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Link href={skillPath} className="hover:text-brand-600 hover:underline">{exercise.skillLabel}</Link>
            <span>/</span>
            <span className="text-gray-700 dark:text-gray-300 font-medium">{exercise.sectionTitle}</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="info">{exercise.level}</Badge>
            <Badge>+{exercise.xpReward} XP</Badge>
          </div>
        </div>

        {/* Previous attempt banner */}
        {prevAttempt && !result && (
          <div className="mb-4 rounded-xl bg-brand-50 dark:bg-brand-950 border border-brand-200 dark:border-brand-800 px-4 py-3 text-sm text-brand-800 dark:text-brand-300">
            Previous attempt: {prevAttempt.accuracy}% accuracy · {prevAttempt.xpEarned} XP earned. Retry to improve!
          </div>
        )}

        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{exercise.title}</h1>

        {result ? (
          <ResultScreen
            result={{
              ...result,
              correctAnswers: result.correctAnswers as string[] | Record<string, string> | string | null | undefined,
            }}
            exerciseId={exercise.id}
            sectionType={exercise.sectionType}
            skillPath={skillPath}
            nextExercise={nextEx}
          />
        ) : (
          <ExerciseBody exercise={exercise} isAiGraded={isAiGraded} onResult={setResult} />
        )}

        {/* Sibling navigation */}
        <div className="mt-8 flex items-center justify-between">
          {prevEx ? (
            <Link href={`${skillPath}/${exercise.sectionType.toLowerCase()}/${prevEx.id}`} className="flex items-center gap-1 text-sm text-gray-500 hover:text-brand-600">
              <ChevronLeft size={16} /> Previous
            </Link>
          ) : <div />}
          {nextEx && (
            <Link href={`${skillPath}/${exercise.sectionType.toLowerCase()}/${nextEx.id}`} className="flex items-center gap-1 text-sm text-gray-500 hover:text-brand-600">
              Next <ChevronRight size={16} />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

function ExerciseBody({ exercise, isAiGraded, onResult }: {
  exercise: Exercise;
  isAiGraded: boolean;
  onResult: (r: { attemptId: string; score: number; accuracy: number; xpEarned: number; maxScore: number; correctAnswers: unknown; needsAiGrading: boolean }) => void;
}) {
  const p = exercise.payload;

  switch (exercise.sectionType) {
    case "MCQ_MOCK_TEST":
    case "LISTENING_MOCK_TEST":
    case "ARTICLE_COMPREHENSION":
    case "GRAMMAR_IN_CONTEXT":
    case "AUDIO_TRUE_FALSE":
    case "MATCH_AUDIO":
    case "DIALOGUE_COMPREHENSION":
    case "SPEED_DRILLS":
      return <McqExercise exercise={exercise} onResult={onResult} />;

    case "TRUE_FALSE_NOT_GIVEN":
      return <TrueFalseExercise exercise={exercise} onResult={onResult} />;

    case "CLOZE_FILL_BLANK":
    case "FILL_GAP_AUDIO":
    case "SPELLING_ACCENTS":
      return <ClozeExercise exercise={exercise} onResult={onResult} />;

    case "SENTENCE_ORDERING":
      return <SentenceOrderExercise exercise={exercise} onResult={onResult} />;

    case "JUMBLE_WORDS":
    case "SENTENCE_CONSTRUCTION":
      return <JumbleWordsExercise exercise={exercise} onResult={onResult} />;

    case "DICTATION":
      return <DictationExercise exercise={exercise} onResult={onResult} />;

    case "WRITING_TASK":
    case "GUIDED_PARAGRAPH":
    case "TRANSLATION":
    case "GRAMMAR_CORRECTION":
      return <WritingTaskExercise exercise={exercise} onResult={onResult} />;

    case "VERB_CONJUGATION":
      return <ConjugationExercise exercise={exercise} onResult={onResult} />;

    case "VOCABULARY_FLASHCARDS":
      return <FlashcardExercise exercise={exercise} />;

    default:
      return (
        <div className="rounded-xl bg-yellow-50 dark:bg-yellow-950 p-6 text-yellow-800 dark:text-yellow-300">
          Exercise type <code>{exercise.sectionType}</code> player coming soon.
        </div>
      );
  }
}
