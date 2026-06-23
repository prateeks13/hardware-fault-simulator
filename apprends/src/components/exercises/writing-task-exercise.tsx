"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Rubric } from "@/lib/ai-grader";

interface WritingPayload {
  prompt: string;
  context?: string;
  wordRange?: [number, number];
  rubric?: Rubric;
  translationText?: string;
}

interface GradeResult {
  aiScore: number;
  aiBreakdown: Record<string, number>;
  aiFeedback: string;
  corrections: { original: string; suggestion: string; reason: string }[];
  strengths: string[];
  next_steps: string[];
  level_estimate: string;
  xpEarned: number;
}

interface Props {
  exercise: { id: string; payload: Record<string, unknown>; maxScore: number };
  onResult: (r: { attemptId: string; score: number; accuracy: number; xpEarned: number; maxScore: number; correctAnswers: unknown; needsAiGrading: boolean }) => void;
}

export function WritingTaskExercise({ exercise, onResult }: Props) {
  const payload = exercise.payload as unknown as WritingPayload;
  const [text,      setText]      = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [grading,   setGrading]   = useState(false);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [grade,     setGrade]     = useState<GradeResult | null>(null);
  const [error,     setError]     = useState("");

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const [minW, maxW] = payload.wordRange ?? [0, Infinity];
  const wordOk = (!minW || wordCount >= minW) && (!maxW || wordCount <= maxW);

  async function handleSubmit() {
    setLoading(true);
    setError("");
    const res = await fetch("/api/content/submit", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ exerciseId: exercise.id, answers: { submission: text } }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error); return; }
    setAttemptId(data.attemptId);
    setSubmitted(true);

    // Auto-trigger AI grading
    await requestGrade(data.attemptId);
  }

  async function requestGrade(aId?: string) {
    setGrading(true);
    setError("");
    const res = await fetch("/api/grade", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        exerciseId: exercise.id,
        submission: text,
        attemptId: aId ?? attemptId,
      }),
    });
    const data = await res.json();
    setGrading(false);
    if (!res.ok) { setError(data.error ?? "Grading failed"); return; }
    setGrade(data as GradeResult);
    onResult({
      attemptId: data.attemptId,
      score: data.aiScore,
      accuracy: data.aiScore,
      xpEarned: data.xpEarned,
      maxScore: exercise.maxScore,
      correctAnswers: null,
      needsAiGrading: false,
    });
  }

  if (grade) {
    return <GradeDisplay grade={grade} rubric={payload.rubric} />;
  }

  return (
    <div className="space-y-6">
      {payload.context && (
        <div className="rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-5 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
          <p className="font-semibold text-gray-900 dark:text-white mb-2">Context:</p>
          <p>{payload.context}</p>
        </div>
      )}

      {payload.translationText && (
        <div className="rounded-xl bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 p-4">
          <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300 mb-1">Translate into French:</p>
          <p className="text-sm text-gray-800 dark:text-gray-200">{payload.translationText}</p>
        </div>
      )}

      <div className="rounded-xl bg-brand-50 dark:bg-brand-950 border border-brand-200 dark:border-brand-800 p-4">
        <p className="text-sm font-semibold text-brand-800 dark:text-brand-300">Your task:</p>
        <p className="text-sm text-gray-800 dark:text-gray-200 mt-1">{payload.prompt}</p>
        {payload.wordRange && (
          <p className="text-xs text-gray-500 mt-2">Target: {minW}–{maxW} words</p>
        )}
      </div>

      {payload.rubric && (
        <div className="rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-4">
          <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Graded on:</p>
          <div className="flex flex-wrap gap-2">
            {payload.rubric.criteria.map((c) => (
              <span key={c.id} className="rounded-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 px-2.5 py-0.5 text-xs text-gray-600 dark:text-gray-400">
                {c.label} <span className="text-gray-400">/{c.max}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      <div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={8}
          disabled={submitted}
          className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3 text-sm text-gray-800 dark:text-gray-200 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 resize-none disabled:opacity-60"
          placeholder="Write your response in French here..."
          maxLength={2000}
        />
        <div className="mt-1.5 flex justify-between text-xs text-gray-400">
          <span>{wordCount} words</span>
          {payload.wordRange && (
            <span className={wordOk ? "text-green-500" : "text-red-400"}>
              Target: {minW}–{maxW} words
            </span>
          )}
        </div>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      {!submitted && (
        <Button onClick={handleSubmit} loading={loading} disabled={!text.trim() || (!!payload.wordRange && !wordOk)} className="w-full">
          Submit for AI grading
        </Button>
      )}

      {submitted && grading && (
        <div className="text-center py-8">
          <div className="inline-flex items-center gap-3 text-brand-600">
            <div className="h-6 w-6 border-3 border-current border-t-transparent rounded-full animate-spin" />
            <span className="font-medium">AI examiner is grading your work...</span>
          </div>
        </div>
      )}
    </div>
  );
}

function GradeDisplay({ grade, rubric }: { grade: GradeResult; rubric?: Rubric }) {
  const scoreColor = grade.aiScore >= 75 ? "success" : grade.aiScore >= 50 ? "warning" : "danger";
  return (
    <div className="space-y-5 animate-fade-in">
      {/* Score header */}
      <div className="rounded-2xl bg-gradient-to-br from-brand-600 to-purple-600 p-6 text-white text-center">
        <p className="text-sm font-medium opacity-80">AI Grading Result</p>
        <p className="text-5xl font-extrabold mt-1">{grade.aiScore}<span className="text-2xl font-normal opacity-70">/100</span></p>
        <Badge variant={scoreColor} className="mt-3 text-sm px-3 py-1">{grade.level_estimate}</Badge>
        {grade.xpEarned > 0 && <p className="text-sm mt-2 opacity-80">+{grade.xpEarned} XP earned</p>}
      </div>

      {/* Criteria breakdown */}
      {rubric && (
        <div className="rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-4">
          <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Score breakdown</p>
          {rubric.criteria.map((c) => (
            <div key={c.id} className="flex items-center gap-3 mb-2">
              <span className="text-xs text-gray-500 w-36 shrink-0">{c.label}</span>
              <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand-500 rounded-full"
                  style={{ width: `${((grade.aiBreakdown[c.id] ?? 0) / c.max) * 100}%` }}
                />
              </div>
              <span className="text-xs font-bold text-gray-700 dark:text-gray-300 w-12 text-right">
                {grade.aiBreakdown[c.id] ?? 0}/{c.max}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Feedback */}
      <div className="rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-4">
        <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Examiner Feedback</p>
        <p className="text-sm text-gray-600 dark:text-gray-400">{grade.aiFeedback}</p>
      </div>

      {/* Strengths */}
      {grade.strengths.length > 0 && (
        <div className="rounded-xl bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 p-4">
          <p className="text-xs font-semibold text-green-700 dark:text-green-400 uppercase mb-2">💪 Strengths</p>
          <ul className="space-y-1">
            {grade.strengths.map((s, i) => <li key={i} className="text-sm text-green-800 dark:text-green-300">• {s}</li>)}
          </ul>
        </div>
      )}

      {/* Corrections */}
      {grade.corrections.length > 0 && (
        <div className="rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-4">
          <p className="text-xs font-semibold text-gray-500 uppercase mb-3">✏️ Corrections</p>
          {grade.corrections.slice(0, 5).map((c, i) => (
            <div key={i} className="mb-3 rounded-lg bg-red-50 dark:bg-red-950 border border-red-100 dark:border-red-900 p-3">
              <p className="text-xs text-red-500 line-through">{c.original}</p>
              <p className="text-sm font-medium text-green-700 dark:text-green-400 mt-0.5">→ {c.suggestion}</p>
              <p className="text-xs text-gray-500 mt-1">{c.reason}</p>
            </div>
          ))}
        </div>
      )}

      {/* Next steps */}
      {grade.next_steps.length > 0 && (
        <div className="rounded-xl bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 p-4">
          <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 uppercase mb-2">📚 Next steps</p>
          <ul className="space-y-1">
            {grade.next_steps.map((s, i) => <li key={i} className="text-sm text-blue-800 dark:text-blue-300">• {s}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}
