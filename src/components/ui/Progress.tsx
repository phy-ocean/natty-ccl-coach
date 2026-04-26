import { cn } from "@/lib/cn";

interface ProgressProps {
  value: number;
  max?: number;
  className?: string;
  barClassName?: string;
  showLabel?: boolean;
}

export function Progress({ value, max = 100, className, barClassName, showLabel }: ProgressProps) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className={cn("relative w-full bg-slate-100 rounded-full h-2 overflow-hidden", className)}>
      <div
        className={cn("h-full rounded-full transition-all duration-500", barClassName ?? "bg-blue-500")}
        style={{ width: `${pct}%` }}
      />
      {showLabel && (
        <span className="absolute right-0 -top-5 text-xs text-slate-500">{Math.round(pct)}%</span>
      )}
    </div>
  );
}
