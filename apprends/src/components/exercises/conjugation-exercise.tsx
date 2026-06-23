"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface ConjugPayload {
  instructions: string;
  items: { verb: string; pronoun: string; tense: string }[];
}

interface Props {
  exercise: { id: string; payload: Record<string, unknown>; maxScore: number };
  onResult: (r: { attemptId: string; score: number; accuracy: number; xpEarned: number; maxScore: number; correctAnswers: unknown; needsAiGrading: boolean }) => void;
}

export function ConjugationExercise({ exercise, onResult }: Props) {
  const payload  = exercise.payload as unknown as ConjugPayload;
  const [answers, setAnswers]  = useState<string[]>(Array(payload.items.length).fill(""));
  const [loading, setLoading]  = useState(false);

  async function submit() {
    setLoading(true);
    const formatted = answers.map((answer, verbIndex) => ({ verbIndex, answer }));
    const res = await fetch("/api/content/submit", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ exerciseId: exercise.id, answers: formatted }),
    });
    const data = await res.json();
    setLoading(false);
    onResult({ ...data, maxScore: exercise.maxScore });
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-600 dark:text-gray-400">{payload.instructions}</p>

      <div className="space-y-3">
        {payload.items.map((item, i) => (
          <div key={i} className="flex items-center gap-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-4">
            <div className="flex-1">
              <p className="text-xs text-gray-500 mb-1">{item.tense}</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                <span className="text-brand-600 dark:text-brand-400">{item.pronoun}</span>{" "}
                <span className="text-gray-400">[{item.verb}]</span>
              </p>
            </div>
            <input
              value={answers[i]}
              onChange={(e) => {
                const next = [...answers];
                next[i] = e.target.value;
                setAnswers(next);
              }}
              className="w-36 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-center text-brand-700 dark:text-brand-300 outline-none focus:border-brand-500"
              placeholder="conjugated form"
              aria-label={`Conjugate ${item.verb}`}
            />
          </div>
        ))}
      </div>

      <Button onClick={submit} loading={loading} disabled={answers.some((a) => !a.trim())} className="w-full">
        Check conjugations
      </Button>
    </div>
  );
}
