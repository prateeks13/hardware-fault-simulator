"use client";
import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { cn, formatDuration } from "@/lib/utils";

export function Timer({ seconds, onExpire }: { seconds: number; onExpire: () => void }) {
  const [remaining, setRemaining] = useState(seconds);

  useEffect(() => {
    if (remaining <= 0) { onExpire(); return; }
    const t = setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => clearTimeout(t);
  }, [remaining, onExpire]);

  const pct = (remaining / seconds) * 100;
  return (
    <div className={cn("flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold", remaining <= 30 ? "bg-red-50 dark:bg-red-950 text-red-600" : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300")}>
      <Clock size={14} className={remaining <= 30 ? "animate-pulse" : ""} />
      {formatDuration(remaining)}
      <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all", remaining <= 30 ? "bg-red-500" : "bg-brand-500")}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
