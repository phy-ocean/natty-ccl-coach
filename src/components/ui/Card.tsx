import { cn } from "@/lib/cn";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
  onClick?: () => void;
}

export function Card({ children, className, id, onClick }: CardProps) {
  return (
    <div id={id} onClick={onClick} className={cn("bg-white rounded-xl border border-slate-200 shadow-sm", className)}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className, id }: CardProps) {
  return <div id={id} className={cn("px-6 py-4 border-b border-slate-100", className)}>{children}</div>;
}

export function CardContent({ children, className }: CardProps) {
  return <div className={cn("px-6 py-4", className)}>{children}</div>;
}

export function CardTitle({ children, className }: CardProps) {
  return <h3 className={cn("text-lg font-semibold text-slate-800", className)}>{children}</h3>;
}
