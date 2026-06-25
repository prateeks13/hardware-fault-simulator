"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Statement { text: string; }
interface TFPayload { passage?: string; statements: Statement[]; }

interface Props {
  exercise: { id: string; payload: Record<string, unknown>; maxScore: number };
  onResult: (r: { attemptId: string; score: number; accuracy: number; xpEarned: number; maxScore: number; correctAnswers: unknown; needsAiGrading: boolean }) => void;
}

const OPTIONS: { label: string; value: "true" | "false" | "not_given"; color: string }[] = [
  { label: "True",      value: "true",      color: "border-green-500 bg-green-50  dark:bg-green-950  text-green-800  dark:text-green-300" },
  { label: "False",     value: "false",     color: "border-red-500   bg-red-50    dark:bg-red-950    text-red-800    dark:text-red-300"   },
  { label: "Not Given", value: "not_given", color: "border-gray-500  bg-gray-50   dark:bg-gray-800   text-gray-800   dark:text-gray-300"  },
];

export function TrueFalseExercise({ exercise, onResult }: Props) {
  const payload   = exercise.payload as unknown as TFPayload;
  const [answers, setAnswers]  = useState<Record<number, "true" | "false" | "not_given">>({});
  const [loading, setLoading]  = useState(false);

  async function submit() {
    setLoading(true);
    const formatted = Object.entries(answers).map(([idx, answer]) => ({
      questionIndex: Number(idx), answer,
    }));
    const res = await fetch("/api/content/submit", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ exerciseId: exercise.id, answers: formatted }),
    });
    const data = await res.json();
    setLoading(false);
    onResult({ ...data, maxScore: exercise.maxScore });
  }

  const allAnswered = Object.keys(answers).length === payload.statements.length;

  return (
    <div className="space-y-6">
      {payload.passage && (
        <div className="rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-5 text-sm text-gray-700 dark:text-gray-300 leading-relaxed max-h-56 overflow-y-auto">
          {payload.passage}
        </div>
      )}

      <div className="space-y-4">
        {payload.statements.map((s, i) => (
          <div key={i} className="rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
            <p className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-3">{i + 1}. {s.text}</p>
            <div className="flex gap-2">
              {OPTIONS.map(({ label, value, color }) => (
                <button
                  key={value}
                  onClick={() => setAnswers({ ...answers, [i]: value })}
                  className={cn(
                    "flex-1 rounded-lg border-2 py-2 text-xs font-bold transition-all",
                    answers[i] === value ? color : "border-gray-200 dark:border-gray-700 text-gray-500 hover:border-gray-300"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <Button onClick={submit} loading={loading} disabled={!allAnswered} className="w-full">
        Submit answers
      </Button>
    </div>
  );
}
