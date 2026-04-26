import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateDialogueScore, calculateTestScore } from "@/lib/scoring/rubric";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const attempt = await prisma.testAttempt.findUnique({
      where: { id },
      include: {
        mockTest: { include: { dialogues: { include: { segments: true } } } },
        recordings: { include: { transcript: true, segmentScores: true, segment: true } },
        dialogueScores: true,
      },
    });
    if (!attempt) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(attempt);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch attempt" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await req.json();

    if (body.action === "complete") {
      const attempt = await prisma.testAttempt.findUnique({
        where: { id },
        include: {
          mockTest: { include: { dialogues: { orderBy: { orderIndex: "asc" }, include: { segments: true } } } },
          recordings: { include: { segmentScores: true } },
          dialogueScores: true,
        },
      });
      if (!attempt) return NextResponse.json({ error: "Not found" }, { status: 404 });

      const dialogues = attempt.mockTest.dialogues;
      const dialogueScoreValues: number[] = [];

      for (const dialogue of dialogues) {
        const segScores = dialogue.segments.flatMap((seg) => {
          const rec = attempt.recordings.find((r) => r.segmentId === seg.id);
          if (!rec) return [{ segmentId: seg.id, estimatedScore: 0, maxScore: 5 }];
          return rec.segmentScores.map((ss) => ({
            segmentId: seg.id,
            estimatedScore: ss.estimatedScore,
            maxScore: ss.maxScore,
          }));
        });

        if (segScores.length === 0) continue;

        const dScore = calculateDialogueScore(segScores);
        dialogueScoreValues.push(dScore.estimatedScore);

        const existing = attempt.dialogueScores.find((ds) => ds.dialogueId === dialogue.id);
        if (existing) {
          await prisma.dialogueScore.update({
            where: { id: existing.id },
            data: {
              estimatedScore: dScore.estimatedScore,
              strongestSegments: JSON.stringify(dScore.strongestSegments),
              weakestSegments: JSON.stringify(dScore.weakestSegments),
              errorSummary: dScore.errorSummary,
              passRisk: dScore.passRisk,
            },
          });
        } else {
          await prisma.dialogueScore.create({
            data: {
              attemptId: id,
              dialogueId: dialogue.id,
              estimatedScore: dScore.estimatedScore,
              maxScore: 45,
              strongestSegments: JSON.stringify(dScore.strongestSegments),
              weakestSegments: JSON.stringify(dScore.weakestSegments),
              errorSummary: dScore.errorSummary,
              passRisk: dScore.passRisk,
            },
          });
        }
      }

      const d1 = dialogueScoreValues[0] ?? 0;
      const d2 = dialogueScoreValues[1] ?? 0;
      const testScore = calculateTestScore(d1, d2);

      const updated = await prisma.testAttempt.update({
        where: { id },
        data: {
          status: "complete",
          completedAt: new Date(),
          totalScore: testScore.totalScore,
          dialogue1Score: d1,
          dialogue2Score: d2,
          passed: testScore.passed,
        },
      });
      return NextResponse.json(updated);
    }

    if (body.repeatsUsed !== undefined) {
      const updated = await prisma.testAttempt.update({
        where: { id },
        data: { repeatsUsed: JSON.stringify(body.repeatsUsed) },
      });
      return NextResponse.json(updated);
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update attempt" }, { status: 500 });
  }
}
