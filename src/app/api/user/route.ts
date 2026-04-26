import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const user = await prisma.userProfile.findUnique({
      where: { id: "default-user" },
      include: { studyProgress: { orderBy: { day: "asc" } } },
    });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
    return NextResponse.json(user);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const user = await prisma.userProfile.update({
      where: { id: "default-user" },
      data: {
        ...(body.name !== undefined ? { name: body.name } : {}),
        ...(body.targetScore !== undefined ? { targetScore: body.targetScore } : {}),
        ...(body.examDate !== undefined ? { examDate: new Date(body.examDate) } : {}),
      },
    });
    return NextResponse.json(user);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}
