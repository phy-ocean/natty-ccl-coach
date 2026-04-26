"use client";
import { cn } from "@/lib/cn";

type BadgeVariant = "default" | "success" | "warning" | "danger" | "info" | "outline";

const variants: Record<BadgeVariant, string> = {
  default: "bg-slate-100 text-slate-700",
  success: "bg-green-100 text-green-700",
  warning: "bg-amber-100 text-amber-700",
  danger: "bg-red-100 text-red-700",
  info: "bg-blue-100 text-blue-700",
  outline: "border border-slate-300 text-slate-600",
};

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium", variants[variant], className)}>
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; variant: BadgeVariant }> = {
    not_started: { label: "Not Started", variant: "outline" },
    in_progress: { label: "In Progress", variant: "info" },
    recording: { label: "Recording", variant: "danger" },
    uploaded: { label: "Uploaded", variant: "success" },
    transcribing: { label: "Transcribing", variant: "warning" },
    manual: { label: "Manual", variant: "warning" },
    scoring: { label: "Scoring", variant: "warning" },
    complete: { label: "Complete", variant: "success" },
    failed: { label: "Failed", variant: "danger" },
    abandoned: { label: "Abandoned", variant: "default" },
  };
  const { label, variant } = map[status] ?? { label: status, variant: "default" as BadgeVariant };
  return <Badge variant={variant}>{label}</Badge>;
}
