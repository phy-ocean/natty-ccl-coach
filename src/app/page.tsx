import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Progress } from "@/components/ui/Progress";
import { Badge } from "@/components/ui/Badge";

async function getDashboardData() {
  const [user, attempts, recordings, studyProgress, mockTestCount] = await Promise.all([
    prisma.userProfile.findUnique({ where: { id: "default-user" } }),
    prisma.testAttempt.findMany({
      where: { userId: "default-user", status: "complete" },
      orderBy: { completedAt: "desc" },
      take: 5,
      include: { mockTest: { select: { title: true } } },
    }),
    prisma.recording.count({ where: { attempt: { userId: "default-user" } } }),
    prisma.studyProgress.findMany({ where: { userId: "default-user" }, orderBy: { day: "asc" } }),
    prisma.mockTest.count(),
  ]);

  const scores = attempts.map((a) => a.totalScore ?? 0).filter((s) => s > 0);
  const avgScore = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
  const bestScore = scores.length ? Math.max(...scores) : 0;
  const latestScore = scores[0] ?? 0;
  const targetScore = user?.targetScore ?? 85;

  return { user, attempts, recordings, studyProgress, mockTestCount, avgScore, bestScore, latestScore, targetScore };
}

export default async function DashboardPage() {
  const { user, attempts, recordings, studyProgress, mockTestCount, avgScore, bestScore, latestScore, targetScore } =
    await getDashboardData();

  const daysCompleted = studyProgress.filter((sp) => sp.completed).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Welcome back, {user?.name ?? "Candidate"}
          </h1>
          <p className="text-slate-500 mt-1">
            Target: {targetScore}/90 · {mockTestCount} mock tests available
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/mock-tests" className="px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors">
            Start Mock Test
          </Link>
          <Link href="/practice" className="px-5 py-2.5 bg-slate-100 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-200 transition-colors">
            Practice Mode
          </Link>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-800">
        <strong>Unofficial preparation tool.</strong> Not affiliated with or endorsed by NAATI. All scores are AI estimates only. Only NAATI examiners can issue official scores.
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Latest Score", value: latestScore > 0 ? `${latestScore}/90` : "—", sub: "Most recent test" },
          { label: "Best Score", value: bestScore > 0 ? `${bestScore}/90` : "—", sub: "All-time best" },
          { label: "Average Score", value: avgScore > 0 ? `${Math.round(avgScore * 10) / 10}/90` : "—", sub: "Across all tests" },
          { label: "Target Gap", value: latestScore > 0 ? `${Math.max(0, targetScore - latestScore)} pts` : "—", sub: `Target: ${targetScore}/90` },
        ].map(({ label, value, sub }) => (
          <Card key={label}>
            <CardContent className="pt-4">
              <p className="text-xs text-slate-500">{label}</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
              <p className="text-xs text-slate-400 mt-1">{sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {latestScore > 0 && (
        <Card>
          <CardHeader><CardTitle>Progress Toward {targetScore}/90</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Progress value={latestScore} max={90} barClassName={latestScore >= 63 ? "bg-green-500" : "bg-amber-500"} />
              <div className="flex justify-between text-xs text-slate-500">
                <span>0</span>
                <span className="text-red-500">Pass: 63</span>
                <span className="text-blue-500">Target: {targetScore}</span>
                <span>90</span>
              </div>
              <div className="flex gap-2 flex-wrap">
                {latestScore >= targetScore && <Badge variant="success">Target reached!</Badge>}
                {latestScore >= 63 && latestScore < targetScore && <Badge variant="warning">Passing — keep improving</Badge>}
                {latestScore < 63 && <Badge variant="danger">Below pass threshold</Badge>}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card><CardContent className="pt-4"><p className="text-xs text-slate-500">Recordings Made</p><p className="text-3xl font-bold text-slate-900 mt-1">{recordings}</p></CardContent></Card>
        <Card><CardContent className="pt-4"><p className="text-xs text-slate-500">Study Days Done</p><p className="text-3xl font-bold text-slate-900 mt-1">{daysCompleted}<span className="text-lg text-slate-400">/7</span></p></CardContent></Card>
        <Card><CardContent className="pt-4"><p className="text-xs text-slate-500">Mock Tests Completed</p><p className="text-3xl font-bold text-slate-900 mt-1">{attempts.length}</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle>7-Day Study Plan</CardTitle></CardHeader>
        <CardContent>
          <div className="flex gap-2 flex-wrap">
            {studyProgress.map((sp) => (
              <Link key={sp.day} href={`/study-plan#day-${sp.day}`}
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${sp.completed ? "bg-green-100 text-green-700 border border-green-300" : "bg-slate-100 text-slate-500 border border-slate-200 hover:bg-blue-50"}`}>
                {sp.day}
              </Link>
            ))}
          </div>
          <p className="text-xs text-slate-400 mt-3">{daysCompleted} of 7 days completed. <Link href="/study-plan" className="text-blue-600 underline">View full plan →</Link></p>
        </CardContent>
      </Card>

      {attempts.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Recent Test Attempts</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {attempts.map((a) => (
                <div key={a.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-slate-700">{a.mockTest.title}</p>
                    <p className="text-xs text-slate-400">{a.completedAt ? new Date(a.completedAt).toLocaleDateString() : "—"}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-slate-900">{a.totalScore ?? "—"}/90</span>
                    {a.passed !== null && <Badge variant={a.passed ? "success" : "danger"}>{a.passed ? "Pass" : "Fail"}</Badge>}
                    <Link href={`/attempts/${a.id}/report`} className="text-xs text-blue-600 hover:underline">Report →</Link>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { href: "/mock-tests", label: "6 Mock Tests", icon: "📋" },
          { href: "/study-material", label: "Study Material", icon: "📚" },
          { href: "/vocabulary", label: "Vocab Bank (68+ terms)", icon: "🔤" },
          { href: "/official-resources", label: "NAATI Resources", icon: "🔗" },
        ].map(({ href, label, icon }) => (
          <Link key={href} href={href}
            className="flex flex-col items-center justify-center p-4 bg-white rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-colors gap-2">
            <span className="text-2xl">{icon}</span>
            <span className="text-sm font-medium text-slate-700 text-center">{label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
