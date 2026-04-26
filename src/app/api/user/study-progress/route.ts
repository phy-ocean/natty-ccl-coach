import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request) {
  try {
    const { day, completed, notes } = await req.json();
    const updated = await prisma.studyProgress.updateMany({
      where: { userId: "default-user", day },
      data: {
        completed,
        notes: notes ?? "",
        completedAt: completed ? new Date() : null,
      },
    });
    return NextResponse.json({ updated: updated.count });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
