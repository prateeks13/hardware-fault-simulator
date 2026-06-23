"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Timer } from "./timer";
import { cn } from "@/lib/utils";

interface Question {
  text: string;
  options: string[];
}

interface McqPayload {
  passage?: string;
  audioUrl?: string;
  questions: Question[];
  timeLimit?: number;
}

interface Props {
  exercise: {
    id: string; payload: Record<string, unknown>; audioUrl: string | null; maxScore: number;
  };
  onResult: (r: { attemptId: string; score: number; accuracy: number; xpEarned: number; maxScore: number; correctAnswers: unknown; needsAiGrading: boolean }) => void;
}

export function McqExercise({ exercise, onResult }: Props) {
  const payload   = exercise.payload as unknown as McqPayload;
  const [answers, setAnswers]   = useState<Record<number, string>>({});
  const [current, setCurrent]   = useState(0);
  const [loading,  setLoading]  = useState(false);
  const [expired,  setExpired]  = useState(false);

  const q = payload.questions[current];

  async function submit() {
    setLoading(true);
    const formatted = Object.entries(answers).map(([idx, selected]) => ({
      questionIndex: Number(idx),
      selected,
    }));
    const res = await fetch("/api/content/submit", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ exerciseId: exercise.id, answers: formatted }),
    });
    const data = await res.json();
    setLoading(false);
    onResult({ ...data, maxScore: exercise.maxScore });
  }

  const allAnswered = Object.keys(answers).length === payload.questions.length;

  return (
    <div className="space-y-6">
      {payload.passage && (
        <div className="rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-5 text-sm text-gray-700 dark:text-gray-300 leading-relaxed max-h-60 overflow-y-auto">
          {payload.passage}
        </div>
      )}

      {(exercise.audioUrl || payload.audioUrl) && (
        <audio
          controls
          src={exercise.audioUrl ?? payload.audioUrl}
          className="w-full rounded-xl"
          aria-label="Exercise audio"
        />
      )}

      {payload.timeLimit && (
        <Timer seconds={payload.timeLimit} onExpire={() => { setExpired(true); submit(); }} />
      )}

      {/* Progress dots */}
      <div className="flex gap-2">
        {payload.questions.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={cn(
              "h-2.5 flex-1 rounded-full transition-all",
              i === current ? "bg-brand-600" : answers[i] ? "bg-green-400" : "bg-gray-200 dark:bg-gray-700"
            )}
            aria-label={`Question ${i + 1}`}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          <p className="text-sm text-gray-500 mb-3">Question {current + 1} of {payload.questions.length}</p>
          <p className="text-base font-semibold text-gray-900 dark:text-white mb-4">{q.text}</p>

          <div className="space-y-3">
            {q.options.map((opt) => (
              <button
                key={opt}
                onClick={() => setAnswers({ ...answers, [current]: opt })}
                className={cn(
                  "w-full text-left rounded-xl border-2 px-4 py-3 text-sm font-medium transition-all",
                  answers[current] === opt
                    ? "border-brand-600 bg-brand-50 dark:bg-brand-950 text-brand-800 dark:text-brand-300"
                    : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300"
                )}
              >
                {opt}
              </button>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="flex items-center justify-between gap-4 pt-2">
        <Button variant="ghost" size="sm" onClick={() => setCurrent(Math.max(0, current - 1))} disabled={current === 0}>
          ← Previous
        </Button>
        {current < payload.questions.length - 1 ? (
          <Button onClick={() => setCurrent(current + 1)} disabled={!answers[current]}>
            Next →
          </Button>
        ) : (
          <Button onClick={submit} loading={loading} disabled={!allAnswered || expired}>
            Submit answers
          </Button>
        )}
      </div>
    </div>
  );
}
