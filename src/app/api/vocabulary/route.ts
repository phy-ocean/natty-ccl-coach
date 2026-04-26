import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const domain = searchParams.get("domain");
  const q = searchParams.get("q");
  const page = parseInt(searchParams.get("page") ?? "1", 10);
  const limit = parseInt(searchParams.get("limit") ?? "50", 10);
  const skip = (page - 1) * limit;

  try {
    const where = {
      ...(domain ? { domain } : {}),
      ...(q
        ? {
            OR: [
              { english: { contains: q } },
              { malayalam: { contains: q } },
              { romanisation: { contains: q } },
            ],
          }
        : {}),
    };

    const [terms, total] = await Promise.all([
      prisma.vocabularyTerm.findMany({ where, skip, take: limit, orderBy: { domain: "asc" } }),
      prisma.vocabularyTerm.count({ where }),
    ]);

    return NextResponse.json({ terms, total, page, limit });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch vocabulary" }, { status: 500 });
  }
}
