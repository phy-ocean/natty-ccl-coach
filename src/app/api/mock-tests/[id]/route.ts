import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
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
    if (!test) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(test);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch test" }, { status: 500 });
  }
}
