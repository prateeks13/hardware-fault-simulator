"use client";
import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number;
  max?: number;
  className?: string;
  color?: "brand" | "green" | "yellow" | "red";
  label?: string;
  showPercent?: boolean;
}

export function ProgressBar({ value, max = 100, className, color = "brand", label, showPercent }: ProgressBarProps) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  const colors = {
    brand:  "bg-brand-500",
    green:  "bg-green-500",
    yellow: "bg-yellow-500",
    red:    "bg-red-500",
  };
  return (
    <div className={cn("w-full", className)}>
      {(label || showPercent) && (
        <div className="mb-1 flex justify-between text-xs text-gray-500 dark:text-gray-400">
          {label && <span>{label}</span>}
          {showPercent && <span>{pct}%</span>}
        </div>
      )}
      <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
        <div
          className={cn("h-2 rounded-full transition-all duration-500", colors[color])}
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
}
