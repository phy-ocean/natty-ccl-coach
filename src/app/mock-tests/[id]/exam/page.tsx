import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ExamSimulator } from "./ExamSimulator";

export default async function ExamPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ attemptId?: string; mode?: string }>;
}) {
  const { id } = await params;
  const { attemptId, mode } = await searchParams;

  if (!attemptId) redirect(`/mock-tests/${id}`);

  const [test, attempt] = await Promise.all([
    prisma.mockTest.findUnique({
      where: { id },
      include: {
        dialogues: {
          orderBy: { orderIndex: "asc" },
          include: { segments: { orderBy: { orderIndex: "asc" } } },
        },
      },
    }),
    prisma.testAttempt.findUnique({ where: { id: attemptId } }),
  ]);

  if (!test || !attempt) notFound();
  if (attempt.status === "complete") redirect(`/attempts/${attemptId}/report`);

  return (
    <ExamSimulator
      test={JSON.parse(JSON.stringify(test))}
      attemptId={attemptId}
      mode={mode ?? "exam"}
    />
  );
}
