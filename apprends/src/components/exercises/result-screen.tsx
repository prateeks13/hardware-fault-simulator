"use client";
import { useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RotateCcw, ChevronRight, Home } from "lucide-react";
import confetti from "canvas-confetti";

interface Result {
  attemptId: string; score: number; accuracy: number; xpEarned: number;
  maxScore: number; correctAnswers: string[] | Record<string, string> | string | null | undefined; needsAiGrading: boolean;
}

interface Props {
  result:       Result;
  exerciseId:   string;
  sectionType:  string;
  skillPath:    string;
  nextExercise: { id: string; title: string } | null;
}

export function ResultScreen({ result, skillPath, nextExercise }: Props) {
  useEffect(() => {
    if (result.accuracy >= 80) {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    }
  }, [result.accuracy]);

  const grade = result.accuracy >= 90 ? { label: "Excellent!", color: "success" }
              : result.accuracy >= 75 ? { label: "Good job!",  color: "success" }
              : result.accuracy >= 50 ? { label: "Keep going!", color: "warning" }
              : { label: "Practice more", color: "danger" };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-6"
    >
      {/* Score card */}
      <div className="rounded-2xl bg-gradient-to-br from-brand-600 to-purple-700 p-8 text-white text-center">
        <p className="text-sm font-medium opacity-80 mb-1">Your result</p>
        <p className="text-6xl font-extrabold">{result.accuracy}%</p>
        <Badge variant={grade.color as "success" | "warning" | "danger"} className="mt-3 text-sm px-4 py-1">
          {grade.label}
        </Badge>
        {result.xpEarned > 0 && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-3 text-lg font-bold text-yellow-300"
          >
            +{result.xpEarned} XP
          </motion.p>
        )}
        <p className="mt-2 text-sm opacity-70">
          Score: {result.score} / {result.maxScore}
        </p>
      </div>

      {/* Correct answers reveal */}
      {result.correctAnswers != null && (
        <div className="rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-5">
          <p className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Answer Key</p>
          <AnswerKey answers={result.correctAnswers} />
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Link href={skillPath} className="flex-1">
          <Button variant="outline" className="w-full"><Home size={16} /> Back to skill</Button>
        </Link>
        <Button variant="secondary" className="flex-1" onClick={() => window.location.reload()}>
          <RotateCcw size={16} /> Try again
        </Button>
        {nextExercise && (
          <Link href={`${skillPath}/${nextExercise.id}`} className="flex-1">
            <Button className="w-full">Next exercise <ChevronRight size={16} /></Button>
          </Link>
        )}
      </div>
    </motion.div>
  );
}

function AnswerKey({ answers }: { answers: string[] | Record<string, string> | string | null | undefined }) {
  if (answers == null) return null;
  if (Array.isArray(answers)) {
    return (
      <ol className="space-y-1 list-decimal list-inside">
        {answers.map((a, i) => (
          <li key={i} className="text-sm text-gray-700 dark:text-gray-300">{a}</li>
        ))}
      </ol>
    );
  }
  if (typeof answers === "object") {
    return (
      <div className="space-y-1">
        {Object.entries(answers).map(([k, v]) => (
          <div key={k} className="text-sm flex gap-2">
            <span className="text-gray-400 font-medium capitalize">{k}:</span>
            <span className="text-gray-700 dark:text-gray-300">{v}</span>
          </div>
        ))}
      </div>
    );
  }
  return <p className="text-sm text-gray-600 dark:text-gray-400">{answers}</p>;
}
