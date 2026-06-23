"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Play, RotateCcw } from "lucide-react";

interface DictationPayload { audioUrl: string; plays?: number; }

interface Props {
  exercise: { id: string; payload: Record<string, unknown>; audioUrl: string | null; maxScore: number };
  onResult: (r: { attemptId: string; score: number; accuracy: number; xpEarned: number; maxScore: number; correctAnswers: unknown; needsAiGrading: boolean }) => void;
}

export function DictationExercise({ exercise, onResult }: Props) {
  const payload = exercise.payload as unknown as DictationPayload;
  const audioSrc = exercise.audioUrl ?? payload.audioUrl;
  const [text,    setText]    = useState("");
  const [loading, setLoading] = useState(false);
  const [plays,   setPlays]   = useState(0);
  const maxPlays = payload.plays ?? 3;

  async function submit() {
    setLoading(true);
    const res = await fetch("/api/content/submit", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ exerciseId: exercise.id, answers: { submission: text } }),
    });
    const data = await res.json();
    setLoading(false);
    onResult({ ...data, maxScore: exercise.maxScore });
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 p-4">
        <p className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-3">
          Listen and type exactly what you hear. You can play the audio up to {maxPlays} times.
        </p>
        <div className="flex items-center gap-3">
          {audioSrc ? (
            <audio
              controls
              src={audioSrc}
              onPlay={() => setPlays((p) => p + 1)}
              className="flex-1 rounded-lg"
              aria-label="Dictation audio"
            />
          ) : (
            <p className="text-sm text-gray-400">No audio available for this exercise.</p>
          )}
          <span className="text-xs text-blue-600 dark:text-blue-400 font-bold shrink-0">
            {plays}/{maxPlays} plays
          </span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Your transcription:
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3 text-sm text-gray-800 dark:text-gray-200 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 resize-none"
          placeholder="Type what you hear..."
          aria-label="Dictation answer"
        />
        <p className="text-xs text-gray-400 mt-1">Pay attention to accents: é, è, ê, à, û, ç...</p>
      </div>

      <Button onClick={submit} loading={loading} disabled={!text.trim()} className="w-full">
        Submit dictation
      </Button>
    </div>
  );
}
