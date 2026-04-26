import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const tests = await prisma.mockTest.findMany({
      orderBy: { orderIndex: "asc" },
      include: {
        dialogues: {
          orderBy: { orderIndex: "asc" },
          include: {
            segments: { orderBy: { orderIndex: "asc" }, select: { id: true, orderIndex: true, sourceLanguage: true, wordCount: true } },
          },
        },
        attempts: { select: { id: true, status: true, totalScore: true, completedAt: true }, orderBy: { createdAt: "desc" }, take: 1 },
      },
    });
    return NextResponse.json(tests);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch mock tests" }, { status: 500 });
  }
}
