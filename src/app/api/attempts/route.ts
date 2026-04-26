import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { mockTestId, mode = "exam" } = await req.json();
    if (!mockTestId) return NextResponse.json({ error: "mockTestId required" }, { status: 400 });

    const attempt = await prisma.testAttempt.create({
      data: { mockTestId, mode, status: "in_progress", userId: "default-user" },
    });
    return NextResponse.json(attempt, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create attempt" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const attempts = await prisma.testAttempt.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        mockTest: { select: { title: true } },
        dialogueScores: true,
      },
    });
    return NextResponse.json(attempts);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch attempts" }, { status: 500 });
  }
}
