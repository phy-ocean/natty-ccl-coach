import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { readdir, stat } from "fs/promises";
import { join, resolve } from "path";

export async function GET() {
  try {
    const [attempts, vocabulary, studyProgress, userProfile] = await Promise.all([
      prisma.testAttempt.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          mockTest: { select: { title: true, id: true } },
          dialogueScores: true,
          recordings: {
            include: {
              transcript: true,
              segmentScores: true,
            },
          },
        },
      }),
      prisma.vocabularyTerm.findMany({ orderBy: { domain: "asc" } }),
      prisma.studyProgress.findMany({ orderBy: { day: "asc" } }),
      prisma.userProfile.findFirst(),
    ]);

    const uploadDir = resolve(process.cwd(), process.env.UPLOAD_DIR ?? "./uploads");
    let recordingFiles: string[] = [];
    try {
      const files = await readdir(uploadDir);
      const stats = await Promise.all(
        files.map(async (f) => {
          const s = await stat(join(uploadDir, f));
          return { name: f, sizeBytes: s.size, modifiedAt: s.mtime.toISOString() };
        })
      );
      recordingFiles = stats as unknown as string[];
    } catch {
      // uploads dir may be empty or not exist yet
    }

    const payload = {
      exportedAt: new Date().toISOString(),
      appVersion: process.env.npm_package_version ?? "unknown",
      userProfile,
      studyProgress,
      attempts,
      vocabulary,
      recordings: {
        uploadDir: process.env.UPLOAD_DIR ?? "./uploads",
        note: "Audio files are stored on the server. Download them separately (e.g. via scp or the Codespaces file explorer) before destroying the Codespace.",
        files: recordingFiles,
      },
    };

    return new NextResponse(JSON.stringify(payload, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="naati-export-${new Date().toISOString().slice(0, 10)}.json"`,
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}
