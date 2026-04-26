import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Progress } from "@/components/ui/Progress";

export default async function ReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const attempt = await prisma.testAttempt.findUnique({
    where: { id },
    include: {
      mockTest: { include: { dialogues: { orderBy: { orderIndex: "asc" }, include: { segments: true } } } },
      recordings: {
        include: {
          transcript: true,
          segmentScores: true,
          segment: true,
        },
        orderBy: { createdAt: "asc" },
      },
      dialogueScores: { include: { dialogue: true } },
    },
  });

  if (!attempt) notFound();

  const d1Score = attempt.dialogue1Score ?? 0;
  const d2Score = attempt.dialogue2Score ?? 0;
  const total = attempt.totalScore ?? 0;
  const passed = attempt.passed ?? false;
  const targetScore = 85;
  const gap = Math.max(0, targetScore - total);

  let recommendation: string;
  if (total >= 80) recommendation = "Exam Ready";
  else if (total >= 63) recommendation = "Borderline — more practice needed";
  else recommendation = "Needs More Practice";

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/mock-tests" className="text-sm text-blue-600 hover:underline">← Mock Tests</Link>
          <h1 className="text-2xl font-bold mt-1">Test Report</h1>
          <p className="text-slate-500 text-sm">{attempt.mockTest.title}</p>
        </div>
        <div className="text-right">
          <p className="text-4xl font-bold text-slate-900">{total}/90</p>
          <Badge variant={passed ? "success" : "danger"} className="mt-1">
            {passed ? "✓ Pass" : "✗ Fail"}
          </Badge>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 text-xs text-amber-700">
        This is an AI-estimated practice score only. Only NAATI examiners can issue official scores.
      </div>

      {/* Score overview */}
      <Card>
        <CardHeader><CardTitle>Score Overview</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xs text-slate-400">Dialogue 1</p>
              <p className={`text-2xl font-bold ${d1Score >= 29 ? "text-green-700" : "text-red-600"}`}>{d1Score}/45</p>
              <p className="text-xs text-slate-400">Pass: 29+</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Dialogue 2</p>
              <p className={`text-2xl font-bold ${d2Score >= 29 ? "text-green-700" : "text-red-600"}`}>{d2Score}/45</p>
              <p className="text-xs text-slate-400">Pass: 29+</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Total</p>
              <p className={`text-2xl font-bold ${passed ? "text-green-700" : "text-red-600"}`}>{total}/90</p>
              <p className="text-xs text-slate-400">Pass: 63+</p>
            </div>
          </div>
          <Progress
            value={total}
            max={90}
            barClassName={passed ? "bg-green-500" : "bg-red-500"}
          />
          <div className="flex justify-between text-xs text-slate-400">
            <span>0</span>
            <span className="text-red-500">Pass: 63</span>
            <span className="text-blue-500">Target: {targetScore}</span>
            <span>90</span>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Badge variant={total >= 80 ? "success" : total >= 63 ? "warning" : "danger"}>
              {recommendation}
            </Badge>
            {gap > 0 && <p className="text-sm text-slate-500">{gap} points to reach target of {targetScore}/90</p>}
          </div>
        </CardContent>
      </Card>

      {/* Dialogue scores */}
      {attempt.dialogueScores.map((ds) => (
        <Card key={ds.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Dialogue {ds.dialogue.orderIndex}: {ds.dialogue.title}</CardTitle>
              <Badge variant={ds.estimatedScore >= 29 ? "success" : "danger"}>
                {ds.estimatedScore}/45
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {ds.passRisk && (
              <div className="text-sm text-red-600 bg-red-50 rounded p-2">
                ⚠ Pass risk — below 35 marks. Intensive practice on this dialogue recommended.
              </div>
            )}
            <p className="text-sm text-slate-600">{ds.errorSummary}</p>
          </CardContent>
        </Card>
      ))}

      {/* Segment-by-segment */}
      <Card>
        <CardHeader><CardTitle>Segment Breakdown</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-4">
            {attempt.recordings.map((rec) => {
              const score = rec.segmentScores[0];
              const deductions = score ? JSON.parse(score.deductions as string) : [];
              return (
                <div key={rec.id} className="border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <p className="text-xs text-slate-400">{rec.sourceLanguage} → {rec.targetLanguage}</p>
                      <p className="text-sm text-slate-700 font-medium">{rec.segment.sourceText.substring(0, 80)}…</p>
                    </div>
                    {score && (
                      <span className={`text-lg font-bold ${score.estimatedScore >= score.maxScore * 0.7 ? "text-green-700" : "text-red-600"}`}>
                        {score.estimatedScore}/{score.maxScore}
                      </span>
                    )}
                  </div>
                  {rec.transcript && (
                    <p className="text-xs text-slate-500 italic mb-1">
                      Your response: &ldquo;{rec.transcript.text.substring(0, 100)}&rdquo;
                    </p>
                  )}
                  {score?.examinerStyleFeedback && (
                    <p className="text-xs text-slate-600">{score.examinerStyleFeedback}</p>
                  )}
                  {deductions.length > 0 && (
                    <div className="flex gap-1 flex-wrap mt-1">
                      {deductions.map((d: { category: string; points: number; severity: string }, i: number) => (
                        <span key={i} className="text-xs bg-red-50 text-red-600 px-1.5 py-0.5 rounded">
                          -{d.points} {d.category}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
            {attempt.recordings.length === 0 && (
              <p className="text-sm text-slate-400 text-center py-4">No recordings found for this attempt.</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Top actions */}
      <Card>
        <CardHeader><CardTitle>Top Actions to Improve</CardTitle></CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-slate-600 list-disc list-inside">
            {d1Score < 35 && <li>Dialogue 1 is at pass-risk. Run targeted practice on {attempt.mockTest.dialogues[0]?.topic ?? ""} segments.</li>}
            {d2Score < 35 && <li>Dialogue 2 is at pass-risk. Run targeted practice on {attempt.mockTest.dialogues[1]?.topic ?? ""} segments.</li>}
            <li>Drill numbers and names daily — these are the most penalised errors.</li>
            <li>Practise the 5-second start drill before each recording session.</li>
            <li>Review the vocabulary bank for weak domains.</li>
            <li>Run at least 2 more full mock tests before exam day.</li>
          </ul>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Link href="/mock-tests" className="flex-1 text-center px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">
          Take Another Test
        </Link>
        <Link href="/practice" className="flex-1 text-center px-6 py-3 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200">
          Practice Mode
        </Link>
      </div>
    </div>
  );
}
