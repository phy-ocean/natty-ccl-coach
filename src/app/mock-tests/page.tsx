import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export default async function MockTestsPage() {
  const tests = await prisma.mockTest.findMany({
    orderBy: { orderIndex: "asc" },
    include: {
      dialogues: { include: { segments: { select: { id: true } } } },
      attempts: {
        where: { status: "complete" },
        select: { totalScore: true, passed: true },
        orderBy: { completedAt: "desc" },
        take: 1,
      },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Mock Tests</h1>
        <p className="text-slate-500 mt-1">
          6 full mock tests · 2 dialogues each · 8–12 segments per dialogue
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-sm text-blue-800">
        Each test simulates the NAATI CCL format: 2 pre-recorded dialogues, chime sounds, 5-second
        start window, and estimated scoring after completion.
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tests.map((test) => {
          const bestAttempt = test.attempts[0];
          const totalSegments = test.dialogues.reduce((s, d) => s + d.segments.length, 0);

          return (
            <Card key={test.id} className="hover:border-blue-300 transition-colors">
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base">{test.title}</CardTitle>
                  {bestAttempt && (
                    <Badge variant={bestAttempt.passed ? "success" : "danger"}>
                      {bestAttempt.totalScore}/90
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-slate-500 mt-1">{test.description}</p>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
                  <span>📁 {test.dialogues.length} dialogues</span>
                  <span>🎯 {totalSegments} segments</span>
                  {bestAttempt ? (
                    <span className="text-green-600">✓ Attempted</span>
                  ) : (
                    <span>○ Not attempted</span>
                  )}
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/mock-tests/${test.id}`}
                    className="flex-1 text-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    Start Test
                  </Link>
                  <Link
                    href={`/mock-tests/${test.id}?mode=practice`}
                    className="flex-1 text-center px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors"
                  >
                    Practice Mode
                  </Link>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="text-sm text-slate-500 text-center">
        Scores are AI-estimated practice scores only. Not official NAATI scores.
      </div>
    </div>
  );
}
