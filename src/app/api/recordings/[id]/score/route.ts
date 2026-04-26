import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { scoreSegment } from "@/lib/scoring/rubric";
import type { ScoringInput, Language } from "@/types";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const recording = await prisma.recording.findUnique({
      where: { id },
      include: {
        transcript: true,
        segment: true,
      },
    });

    if (!recording) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (!recording.transcript) {
      return NextResponse.json(
        { error: "No transcript available. Please provide a transcript before scoring." },
        { status: 422 }
      );
    }

    const attempt = await prisma.testAttempt.findUnique({
      where: { id: recording.attemptId },
    });

    const repeatsUsed: Record<string, number> = attempt?.repeatsUsed
      ? JSON.parse(attempt.repeatsUsed)
      : {};

    const segment = recording.segment;
    const keywords: string[] = segment.keywords ? JSON.parse(segment.keywords) : [];

    const input: ScoringInput = {
      segmentId: segment.id,
      transcript: recording.transcript.text,
      expectedInterpretation: segment.expectedInterpretation,
      sourceText: segment.sourceText,
      sourceLanguage: recording.sourceLanguage as Language,
      targetLanguage: recording.targetLanguage as Language,
      keywords,
      register: segment.register as "formal" | "semi-formal" | "informal",
      difficulty: segment.difficulty as "easy" | "medium" | "hard",
      scoringNotes: segment.scoringNotes,
      responseStartedWithinFiveSeconds: recording.responseStartedWithinFiveSeconds,
      repeatedSegmentUsed: recording.repeatedSegmentUsed,
      repeatsAlreadyUsed: repeatsUsed[segment.dialogueId] ?? 0,
      durationMs: recording.durationMs,
    };

    const result = scoreSegment(input);

    const segScore = await prisma.segmentScore.upsert({
      where: { id: `${id}-score`, recordingId: id } as { id: string },
      update: {
        estimatedScore: result.estimatedScore,
        maxScore: result.maxScore,
        deductions: JSON.stringify(result.deductions),
        missedKeyFacts: JSON.stringify(result.missedKeyFacts),
        incorrectFacts: JSON.stringify(result.incorrectFacts),
        unnecessaryAdditions: JSON.stringify(result.unnecessaryAdditions),
        betterAnswer: result.betterAnswer,
        examinerStyleFeedback: result.examinerStyleFeedback,
        practiceDrill: result.practiceDrill,
      },
      create: {
        recordingId: id,
        segmentId: segment.id,
        attemptId: recording.attemptId,
        estimatedScore: result.estimatedScore,
        maxScore: result.maxScore,
        deductions: JSON.stringify(result.deductions),
        missedKeyFacts: JSON.stringify(result.missedKeyFacts),
        incorrectFacts: JSON.stringify(result.incorrectFacts),
        unnecessaryAdditions: JSON.stringify(result.unnecessaryAdditions),
        betterAnswer: result.betterAnswer,
        examinerStyleFeedback: result.examinerStyleFeedback,
        practiceDrill: result.practiceDrill,
      },
    });

    return NextResponse.json({ ...result, dbId: segScore.id });
  } catch (error) {
    console.error("Scoring error:", error);
    return NextResponse.json({ error: "Scoring failed" }, { status: 500 });
  }
}
