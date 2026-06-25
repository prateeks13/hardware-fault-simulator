"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface JumblePayload { words: string[]; hint?: string; }

interface Props {
  exercise: { id: string; payload: Record<string, unknown>; maxScore: number };
  onResult: (r: { attemptId: string; score: number; accuracy: number; xpEarned: number; maxScore: number; correctAnswers: unknown; needsAiGrading: boolean }) => void;
}

export function JumbleWordsExercise({ exercise, onResult }: Props) {
  const payload = exercise.payload as unknown as JumblePayload;
  const [bank,     setBank]    = useState(payload.words.map((w, i) => ({ id: i, word: w })));
  const [sentence, setSentence] = useState<{ id: number; word: string }[]>([]);
  const [loading,  setLoading]  = useState(false);

  function pickWord(item: { id: number; word: string }) {
    setBank((b) => b.filter((w) => w.id !== item.id));
    setSentence((s) => [...s, item]);
  }

  function returnWord(item: { id: number; word: string }) {
    setSentence((s) => s.filter((w) => w.id !== item.id));
    setBank((b) => [...b, item]);
  }

  async function submit() {
    setLoading(true);
    const text = sentence.map((w) => w.word).join(" ");
    const res = await fetch("/api/content/submit", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ exerciseId: exercise.id, answers: { sentence: text } }),
    });
    const data = await res.json();
    setLoading(false);
    onResult({ ...data, maxScore: exercise.maxScore });
  }

  return (
    <div className="space-y-6">
      {payload.hint && (
        <p className="text-sm text-gray-500 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg px-3 py-2">
          💡 {payload.hint}
        </p>
      )}

      {/* Answer area */}
      <div className="min-h-16 rounded-xl border-2 border-dashed border-brand-300 dark:border-brand-700 bg-brand-50 dark:bg-brand-950 p-4 flex flex-wrap gap-2">
        {sentence.length === 0 && (
          <p className="text-sm text-gray-400 self-center">Click words to build your sentence...</p>
        )}
        {sentence.map((item) => (
          <motion.button
            key={item.id}
            layout
            onClick={() => returnWord(item)}
            className="rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-700 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {item.word}
          </motion.button>
        ))}
      </div>

      {/* Word bank */}
      <div className="flex flex-wrap gap-2 rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-4">
        {bank.map((item) => (
          <motion.button
            key={item.id}
            layout
            onClick={() => pickWord(item)}
            className="rounded-lg border-2 border-gray-200 dark:border-gray-700 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:border-brand-400 hover:text-brand-700 dark:hover:border-brand-500 dark:hover:text-brand-400 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {item.word}
          </motion.button>
        ))}
        {bank.length === 0 && <p className="text-sm text-gray-400">All words used!</p>}
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={() => { setSentence([]); setBank(payload.words.map((w, i) => ({ id: i, word: w }))); }}>
          Reset
        </Button>
        <Button className="flex-1" onClick={submit} loading={loading} disabled={bank.length > 0}>
          Submit sentence
        </Button>
      </div>
    </div>
  );
}
