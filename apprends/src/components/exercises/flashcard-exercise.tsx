"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress-bar";
import { ThumbsUp, ThumbsDown, RotateCcw } from "lucide-react";

interface Flashcard { front: string; back: string; example?: string; }
interface FlashcardPayload { cards: Flashcard[]; }

interface Props {
  exercise: { id: string; payload: Record<string, unknown> };
}

export function FlashcardExercise({ exercise }: Props) {
  const payload = exercise.payload as unknown as FlashcardPayload;
  const [index,   setIndex]   = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known,   setKnown]   = useState<Set<number>>(new Set());
  const [done,    setDone]    = useState(false);

  const card = payload.cards[index];

  function respond(ok: boolean) {
    if (ok) setKnown((s) => { const n = new Set(s); n.add(index); return n; });
    setFlipped(false);
    if (index + 1 < payload.cards.length) {
      setTimeout(() => setIndex((i) => i + 1), 200);
    } else {
      setDone(true);
    }
  }

  function restart() {
    setIndex(0); setFlipped(false); setKnown(new Set()); setDone(false);
  }

  if (done) {
    const pct = Math.round((known.size / payload.cards.length) * 100);
    return (
      <div className="text-center py-10">
        <div className="text-6xl mb-4">{pct >= 80 ? "🎉" : pct >= 50 ? "👍" : "📚"}</div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Session complete!</h3>
        <p className="text-gray-500 mt-2">{known.size} / {payload.cards.length} cards known ({pct}%)</p>
        <Button onClick={restart} className="mt-6"><RotateCcw size={14} /> Study again</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ProgressBar value={index} max={payload.cards.length} showPercent label={`Card ${index + 1} of ${payload.cards.length}`} />

      <div
        onClick={() => setFlipped(!flipped)}
        className="cursor-pointer"
        style={{ perspective: 1000 }}
        role="button"
        aria-label={flipped ? "Show front" : "Show translation"}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={flipped ? "back" : "front"}
            initial={{ rotateY: 90, opacity: 0 }}
            animate={{ rotateY: 0,  opacity: 1 }}
            exit={{ rotateY: -90,   opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="min-h-44 rounded-2xl bg-white dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-800 flex flex-col items-center justify-center p-8 select-none"
          >
            {!flipped ? (
              <>
                <p className="text-xs text-gray-400 mb-4">Click to reveal translation</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white text-center">{card.front}</p>
              </>
            ) : (
              <>
                <p className="text-xs text-gray-400 mb-4">{card.front}</p>
                <p className="text-2xl font-bold text-brand-600 dark:text-brand-400 text-center">{card.back}</p>
                {card.example && <p className="text-sm text-gray-400 mt-4 italic text-center">{card.example}</p>}
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {flipped && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-4">
          <Button variant="danger" className="flex-1" onClick={() => respond(false)}>
            <ThumbsDown size={16} /> Still learning
          </Button>
          <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={() => respond(true)}>
            <ThumbsUp size={16} /> Got it!
          </Button>
        </motion.div>
      )}
    </div>
  );
}
