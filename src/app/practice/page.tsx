import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { PracticeClient } from "./PracticeClient";

export default async function PracticePage() {
  const tests = await prisma.mockTest.findMany({
    orderBy: { orderIndex: "asc" },
    include: {
      dialogues: {
        orderBy: { orderIndex: "asc" },
        include: { segments: { orderBy: { orderIndex: "asc" } } },
      },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Practice Mode</h1>
        <p className="text-slate-500 mt-1">Practise one segment at a time with immediate feedback and model answers.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { href: "/practice/drills#numbers", label: "Numbers & Names Drill", icon: "🔢" },
          { href: "/practice/drills#five-second", label: "5-Second Start Drill", icon: "⏱" },
          { href: "/practice/drills#memory", label: "Memory Drill", icon: "🧠" },
          { href: "/practice/drills#shadowing", label: "Shadowing Mode", icon: "🎤" },
        ].map(({ href, label, icon }) => (
          <Link key={href} href={href}
            className="flex flex-col items-center justify-center p-3 bg-white rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-colors gap-2 text-center">
            <span className="text-2xl">{icon}</span>
            <span className="text-xs font-medium text-slate-700">{label}</span>
          </Link>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle>Segment Practice</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-slate-500 mb-4">Select a test and segment to practise. After recording, you&apos;ll see the transcript, expected interpretation, estimated score, and examiner-style feedback.</p>
          <PracticeClient tests={JSON.parse(JSON.stringify(tests))} />
        </CardContent>
      </Card>
    </div>
  );
}
