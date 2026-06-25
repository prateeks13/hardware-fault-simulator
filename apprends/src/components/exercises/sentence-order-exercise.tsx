"use client";
import { useState } from "react";
import { motion, Reorder } from "framer-motion";
import { Button } from "@/components/ui/button";
import { GripVertical } from "lucide-react";

interface OrderPayload { sentences: string[]; }

interface Props {
  exercise: { id: string; payload: Record<string, unknown>; maxScore: number };
  onResult: (r: { attemptId: string; score: number; accuracy: number; xpEarned: number; maxScore: number; correctAnswers: unknown; needsAiGrading: boolean }) => void;
}

export function SentenceOrderExercise({ exercise, onResult }: Props) {
  const payload = exercise.payload as unknown as OrderPayload;
  const [items, setItems] = useState(() => payload.sentences.map((s, i) => ({ id: i, text: s })));
  const [loading, setLoading] = useState(false);

  async function submit() {
    setLoading(true);
    const res = await fetch("/api/content/submit", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        exerciseId: exercise.id,
        answers: { order: items.map((it) => it.id) },
      }),
    });
    const data = await res.json();
    setLoading(false);
    onResult({ ...data, maxScore: exercise.maxScore });
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Drag and drop the sentences into the correct order.
      </p>

      <Reorder.Group axis="y" values={items} onReorder={setItems} className="space-y-2">
        {items.map((item) => (
          <Reorder.Item key={item.id} value={item}>
            <motion.div
              className="flex items-center gap-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3 cursor-grab active:cursor-grabbing hover:border-brand-300 dark:hover:border-brand-600 transition-colors"
              whileHover={{ scale: 1.01 }}
              whileDrag={{ scale: 1.03, boxShadow: "0 10px 30px rgba(0,0,0,0.1)" }}
            >
              <GripVertical size={16} className="text-gray-400 shrink-0" />
              <p className="text-sm text-gray-800 dark:text-gray-200">{item.text}</p>
            </motion.div>
          </Reorder.Item>
        ))}
      </Reorder.Group>

      <Button onClick={submit} loading={loading} className="w-full">
        Submit order
      </Button>
    </div>
  );
}
