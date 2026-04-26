import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({
      status: "ok",
      db: "ok",
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version ?? "unknown",
    });
  } catch {
    return NextResponse.json(
      { status: "error", db: "unreachable", timestamp: new Date().toISOString() },
      { status: 503 }
    );
  }
}
