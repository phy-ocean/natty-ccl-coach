"use client";
import { useState, useTransition } from "react";

export function StudyDayToggle({ day, completed }: { day: number; completed: boolean }) {
  const [done, setDone] = useState(completed);
  const [isPending, startTransition] = useTransition();

  function toggle() {
    const next = !done;
    setDone(next);
    startTransition(async () => {
      await fetch("/api/user/study-progress", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ day, completed: next }),
      });
    });
  }

  return (
    <button
      onClick={toggle}
      disabled={isPending}
      className={`text-xs px-3 py-1 rounded-full border transition-colors ${done ? "bg-green-100 border-green-300 text-green-700 hover:bg-green-200" : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100"}`}
    >
      {done ? "✓ Done" : "Mark Done"}
    </button>
  );
}
