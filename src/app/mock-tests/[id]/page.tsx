import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { StartTestButton } from "./StartTestButton";

export default async function MockTestDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ mode?: string }>;
}) {
  const { id } = await params;
  const { mode } = await searchParams;

  const test = await prisma.mockTest.findUnique({
    where: { id },
    include: {
      dialogues: {
        orderBy: { orderIndex: "asc" },
        include: {
          segments: { orderBy: { orderIndex: "asc" } },
        },
      },
    },
  });

  if (!test) notFound();

  const isPractice = mode === "practice";

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <Link href="/mock-tests" className="text-sm text-blue-600 hover:underline mb-2 inline-block">
          ← Back to Mock Tests
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">{test.title}</h1>
        <p className="text-slate-500 mt-1">{test.description}</p>
      </div>

      {isPractice ? (
        <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-sm text-green-800">
          <strong>Practice Mode:</strong> You will see the expected answer and feedback after each
          segment. Great for targeted improvement.
        </div>
      ) : (
        <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-sm text-blue-800">
          <strong>Exam Mode:</strong> Simulates the real NAATI CCL test. Expected answers are hidden
          during the test. Full report shown at the end.
        </div>
      )}

      <Card>
        <CardHeader><CardTitle>Test Instructions</CardTitle></CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-slate-600 list-disc list-inside">
            <li>Ensure your microphone is working before starting (<Link href="/recording-test" className="text-blue-600 underline">Mic Test</Link>).</li>
            <li>Each dialogue has 8–12 short segments of up to 35 words each.</li>
            <li>After each segment plays, a chime sounds. Begin interpreting within 5 seconds.</li>
            <li>You may request one repeat per dialogue without penalty.</li>
            <li>The test is marked out of 90: 45 marks per dialogue.</li>
            <li>Passing requires 63+ overall and 29+ in each dialogue.</li>
            <li>Estimated scores are AI approximations — not official NAATI marks.</li>
          </ul>
        </CardContent>
      </Card>

      {test.dialogues.map((d) => (
        <Card key={d.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Dialogue {d.orderIndex}: {d.title}</CardTitle>
              <Badge variant="outline">{d.segments.length} segments</Badge>
            </div>
            <p className="text-sm text-slate-500 mt-1">Topic: {d.topic}</p>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 flex-wrap">
              {d.segments.map((seg) => (
                <span key={seg.id}
                  className={`px-2 py-0.5 rounded text-xs font-medium ${seg.sourceLanguage === "English" ? "bg-blue-50 text-blue-700" : "bg-orange-50 text-orange-700"}`}>
                  S{seg.orderIndex} {seg.sourceLanguage === "English" ? "EN→ML" : "ML→EN"}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      <div className="flex gap-3 pt-2">
        <StartTestButton mockTestId={test.id} mode={isPractice ? "practice" : "exam"} />
      </div>

      <p className="text-xs text-slate-400 text-center">
        This is an AI-estimated practice score. Only NAATI examiners can issue official scores.
      </p>
    </div>
  );
}
