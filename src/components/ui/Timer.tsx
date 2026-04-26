"use client";
import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

interface CountdownProps {
  seconds: number;
  onExpire?: () => void;
  className?: string;
  warningThreshold?: number;
}

export function Countdown({ seconds, onExpire, className, warningThreshold = 3 }: CountdownProps) {
  const [remaining, setRemaining] = useState(seconds);

  useEffect(() => {
    setRemaining(seconds);
  }, [seconds]);

  useEffect(() => {
    if (remaining <= 0) {
      onExpire?.();
      return;
    }
    const t = setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => clearTimeout(t);
  }, [remaining, onExpire]);

  return (
    <span
      className={cn(
        "tabular-nums font-mono font-bold text-2xl",
        remaining <= warningThreshold ? "text-red-600 animate-pulse" : "text-slate-800",
        className
      )}
    >
      {remaining}s
    </span>
  );
}

interface ElapsedTimerProps {
  running: boolean;
  className?: string;
}

export function ElapsedTimer({ running, className }: ElapsedTimerProps) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(t);
  }, [running]);

  useEffect(() => {
    if (!running) setElapsed(0);
  }, [running]);

  const mins = Math.floor(elapsed / 60).toString().padStart(2, "0");
  const secs = (elapsed % 60).toString().padStart(2, "0");

  return (
    <span className={cn("tabular-nums font-mono text-lg text-slate-600", className)}>
      {mins}:{secs}
    </span>
  );
}
