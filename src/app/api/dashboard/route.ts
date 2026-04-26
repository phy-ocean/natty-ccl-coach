import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const attempts = await prisma.testAttempt.findMany({
      where: { status: "complete", userId: "default-user" },
      orderBy: { completedAt: "desc" },
      include: { dialogueScores: true, mockTest: { select: { title: true } } },
    });

    const recordings = await prisma.recording.count({ where: { attempt: { userId: "default-user" } } });
    const studyProgress = await prisma.studyProgress.findMany({
      where: { userId: "default-user" },
      orderBy: { day: "asc" },
    });
    const user = await prisma.userProfile.findUnique({ where: { id: "default-user" } });

    const scores = attempts.map((a) => a.totalScore ?? 0).filter((s) => s > 0);
    const avgScore = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    const bestScore = scores.length ? Math.max(...scores) : 0;
    const latestScore = scores[0] ?? 0;
    const targetScore = user?.targetScore ?? 85;

    const d1Scores = attempts.map((a) => a.dialogue1Score ?? 0).filter((s) => s > 0);
    const d2Scores = attempts.map((a) => a.dialogue2Score ?? 0).filter((s) => s > 0);
    const avgD1 = d1Scores.length ? d1Scores.reduce((a, b) => a + b, 0) / d1Scores.length : 0;
    const avgD2 = d2Scores.length ? d2Scores.reduce((a, b) => a + b, 0) / d2Scores.length : 0;

    const streak = studyProgress.filter((sp) => sp.completed).length;

    return NextResponse.json({
      avgScore: Math.round(avgScore * 10) / 10,
      bestScore,
      latestScore,
      targetScore,
      targetGap: Math.max(0, targetScore - latestScore),
      avgD1: Math.round(avgD1 * 10) / 10,
      avgD2: Math.round(avgD2 * 10) / 10,
      recordingCount: recordings,
      attemptCount: attempts.length,
      studyStreak: streak,
      recentAttempts: attempts.slice(0, 5),
      studyProgress,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to load dashboard" }, { status: 500 });
  }
}
