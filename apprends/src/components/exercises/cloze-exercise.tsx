"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface ClozePayload {
  text: string;       // blanks encoded as {{BLANK_0}}, {{BLANK_1}}, etc.
  blanks: number;
  audioUrl?: string;
  hint?: string;
}

interface Props {
  exercise: { id: string; payload: Record<string, unknown>; audioUrl: string | null; maxScore: number };
  onResult: (r: { attemptId: string; score: number; accuracy: number; xpEarned: number; maxScore: number; correctAnswers: unknown; needsAiGrading: boolean }) => void;
}

export function ClozeExercise({ exercise, onResult }: Props) {
  const payload  = exercise.payload as unknown as ClozePayload;
  const count    = payload.blanks ?? 1;
  const [answers, setAnswers] = useState<string[]>(Array(count).fill(""));
  const [loading, setLoading] = useState(false);

  // Render text with inline inputs
  const parts = payload.text.split(/\{\{BLANK_\d+\}\}/);

  async function submit() {
    setLoading(true);
    const formatted = answers.map((answer, blankIndex) => ({ blankIndex, answer }));
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
      {(exercise.audioUrl || payload.audioUrl) && (
        <audio controls src={exercise.audioUrl ?? payload.audioUrl} className="w-full rounded-xl" />
      )}

      {payload.hint && (
        <p className="text-xs text-gray-500 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg px-3 py-2">
          💡 {payload.hint}
        </p>
      )}

      <div className="rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-6 leading-loose text-gray-800 dark:text-gray-200">
        {parts.map((part, i) => (
          <span key={i}>
            <span className="text-sm">{part}</span>
            {i < count && (
              <input
                value={answers[i]}
                onChange={(e) => {
                  const next = [...answers];
                  next[i] = e.target.value;
                  setAnswers(next);
                }}
                className="mx-1 inline-block w-28 rounded border-b-2 border-brand-500 bg-transparent px-2 py-0.5 text-sm text-brand-700 dark:text-brand-300 outline-none focus:border-brand-700"
                placeholder="..."
                aria-label={`Blank ${i + 1}`}
              />
            )}
          </span>
        ))}
      </div>

      <Button onClick={submit} loading={loading} disabled={answers.some((a) => !a.trim())} className="w-full">
        Check answers
      </Button>
    </div>
  );
}
