import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NAATI CCL Malayalam Coach",
  description:
    "Private preparation tool for NAATI CCL Malayalam test — not affiliated with or endorsed by NAATI.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full`}>
      <body className="min-h-full bg-slate-50 text-slate-900 antialiased">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">{children}</main>
        <footer className="border-t border-slate-200 mt-16 py-6 text-center text-xs text-slate-400">
          <p>
            NAATI CCL Malayalam Coach — Private preparation tool. Not affiliated with, endorsed by, or a
            replacement for official NAATI assessment.
          </p>
          <p className="mt-1">
            AI scores are estimates only. Only NAATI examiners can issue official scores.
          </p>
        </footer>
      </body>
    </html>
  );
}
