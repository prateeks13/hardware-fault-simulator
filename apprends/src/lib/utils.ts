import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function xpToLevel(xp: number): { level: number; progress: number; xpInLevel: number; xpForNext: number } {
  // Each level requires level * 100 XP (level 1 = 100 XP, level 2 = 200 XP, etc.)
  let level = 1;
  let accumulated = 0;
  while (true) {
    const needed = level * 100;
    if (accumulated + needed > xp) {
      return {
        level,
        progress: Math.floor(((xp - accumulated) / needed) * 100),
        xpInLevel: xp - accumulated,
        xpForNext: needed,
      };
    }
    accumulated += needed;
    level++;
  }
}

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function sanitizeSubmission(text: string, maxLength = 2000): string {
  return text.slice(0, maxLength).replace(/<[^>]*>/g, "");
}

export const SKILL_LABELS: Record<string, string> = {
  READING:   "Reading",
  LISTENING: "Listening",
  WRITING:   "Writing",
};

export const CEFR_ORDER = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;

export const LEVEL_LABELS: Record<number, string> = {
  1: "Débutant",
  5: "Apprenti",
  10: "Intermédiaire",
  15: "Avancé",
  20: "Expert",
  25: "Maître",
};

export function getLevelLabel(level: number): string {
  const keys = Object.keys(LEVEL_LABELS)
    .map(Number)
    .sort((a, b) => b - a);
  for (const k of keys) {
    if (level >= k) return LEVEL_LABELS[k];
  }
  return "Débutant";
}

export const DAILY_AI_GRADING_LIMIT = 10;

export function todayString(): string {
  return new Date().toISOString().slice(0, 10);
}

export function isActiveSubscription(status: string | null | undefined): boolean {
  return status === "ACTIVE" || status === "TRIALING";
}
