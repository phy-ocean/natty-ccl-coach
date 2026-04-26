"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

const navLinks = [
  { href: "/", label: "Dashboard" },
  { href: "/mock-tests", label: "Mock Tests" },
  { href: "/practice", label: "Practice" },
  { href: "/study-plan", label: "Study Plan" },
  { href: "/study-material", label: "Study Material" },
  { href: "/vocabulary", label: "Vocabulary" },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-blue-600 text-2xl">🎯</span>
            <div className="hidden sm:block">
              <p className="text-sm font-bold text-slate-900 leading-tight">NAATI CCL</p>
              <p className="text-xs text-slate-500 leading-tight">Malayalam Coach</p>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  pathname === href
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                )}
              >
                {label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/recording-test"
              className="text-sm text-slate-500 hover:text-slate-800 px-3 py-2 rounded-lg hover:bg-slate-100"
            >
              Mic Test
            </Link>
            <Link
              href="/settings"
              className="text-sm text-slate-500 hover:text-slate-800 px-3 py-2 rounded-lg hover:bg-slate-100"
            >
              Settings
            </Link>
          </div>
        </div>

        {/* Mobile nav */}
        <div className="md:hidden flex gap-1 pb-2 overflow-x-auto">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors flex-shrink-0",
                pathname === href ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-100"
              )}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
