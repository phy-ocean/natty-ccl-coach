import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { v4 as uuidv4 } from "uuid";
import { getTranscriptionProvider } from "@/lib/providers/transcription";
import { scoreSegment } from "@/lib/scoring/rubric";
import type { ScoringInput, Language } from "@/types";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const audioBlob = formData.get("audio") as Blob | null;
    const attemptId = formData.get("attemptId") as string;
    const segmentId = formData.get("segmentId") as string;
    const sourceLanguage = formData.get("sourceLanguage") as string;
    const targetLanguage = formData.get("targetLanguage") as string;
    const durationMs = parseInt(formData.get("durationMs") as string ?? "0", 10);
    const repeatedSegmentUsed = formData.get("repeatedSegmentUsed") === "true";
    const responseStartedWithinFiveSeconds = formData.get("responseStartedWithinFiveSeconds") !== "false";
    const startedAt = formData.get("startedAt") as string;
    const endedAt = formData.get("endedAt") as string;

    if (!attemptId || !segmentId) {
      return NextResponse.json({ error: "attemptId and segmentId required" }, { status: 400 });
    }

    let filePath: string | null = null;
    let mimeType = "audio/webm";

    if (audioBlob && audioBlob.size > 0) {
      const uploadDir = process.env.UPLOAD_DIR ?? "./uploads";
      const absoluteUploadDir = join(process.cwd(), uploadDir);
      await mkdir(absoluteUploadDir, { recursive: true });

      const ext = audioBlob.type.includes("mp4") ? "mp4" : "webm";
      const filename = `${uuidv4()}.${ext}`;
      filePath = join(uploadDir, filename);
      const absolutePath = join(absoluteUploadDir, filename);
      mimeType = audioBlob.type || "audio/webm";

      const buffer = Buffer.from(await audioBlob.arrayBuffer());
      await writeFile(absolutePath, buffer);
    }

    const recording = await prisma.recording.create({
      data: {
        attemptId,
        segmentId,
        filePath,
        mimeType,
        durationMs,
        sourceLanguage,
        targetLanguage,
        repeatedSegmentUsed,
        responseStartedWithinFiveSeconds,
        startedAt: startedAt ? new Date(startedAt) : new Date(),
        endedAt: endedAt ? new Date(endedAt) : new Date(),
        uploadStatus: "uploaded",
        transcriptionStatus: "pending",
      },
    });

    return NextResponse.json({ recordingId: recording.id, filePath }, { status: 201 });
  } catch (error) {
    console.error("Recording upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
