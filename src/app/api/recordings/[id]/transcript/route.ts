import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTranscriptionProvider } from "@/lib/providers/transcription";
import { join } from "path";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await req.json();
    const manualText: string | undefined = body.text;

    const recording = await prisma.recording.findUnique({
      where: { id },
      include: { segment: true },
    });
    if (!recording) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Manual transcript path
    if (manualText !== undefined) {
      const transcript = await prisma.transcript.upsert({
        where: { recordingId: id },
        update: { text: manualText, isManual: true, provider: "manual" },
        create: { recordingId: id, text: manualText, isManual: true, provider: "manual" },
      });
      await prisma.recording.update({
        where: { id },
        data: { transcriptionStatus: "manual" },
      });
      return NextResponse.json(transcript);
    }

    // Auto transcription path
    const provider = getTranscriptionProvider();
    if (!provider) {
      return NextResponse.json(
        {
          error: "no_provider",
          message:
            "Audio transcription provider not configured. Enter transcript manually for demo scoring.",
        },
        { status: 422 }
      );
    }

    if (!recording.filePath) {
      return NextResponse.json({ error: "No audio file for this recording" }, { status: 422 });
    }

    await prisma.recording.update({ where: { id }, data: { transcriptionStatus: "transcribing" } });

    const absolutePath = join(process.cwd(), recording.filePath);
    const result = await provider.transcribeAudio(absolutePath, recording.sourceLanguage);

    const transcript = await prisma.transcript.upsert({
      where: { recordingId: id },
      update: { text: result.text, confidence: result.confidence, isManual: false, provider: process.env.TRANSCRIPTION_PROVIDER ?? "auto" },
      create: { recordingId: id, text: result.text, confidence: result.confidence, isManual: false, provider: process.env.TRANSCRIPTION_PROVIDER ?? "auto" },
    });

    await prisma.recording.update({ where: { id }, data: { transcriptionStatus: "complete" } });

    return NextResponse.json(transcript);
  } catch (error) {
    console.error("Transcription error:", error);
    await prisma.recording.update({ where: { id }, data: { transcriptionStatus: "failed" } }).catch(() => {});
    return NextResponse.json({ error: "Transcription failed" }, { status: 500 });
  }
}
