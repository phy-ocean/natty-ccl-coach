"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

export function StartTestButton({ mockTestId, mode }: { mockTestId: string; mode: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleStart() {
    setLoading(true);
    try {
      const res = await fetch("/api/attempts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mockTestId, mode }),
      });
      if (!res.ok) throw new Error("Failed to create attempt");
      const attempt = await res.json();
      router.push(`/mock-tests/${mockTestId}/exam?attemptId=${attempt.id}&mode=${mode}`);
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  }

  return (
    <Button size="xl" loading={loading} onClick={handleStart} className="flex-1">
      {mode === "practice" ? "Start Practice Session" : "Start Exam Simulation"}
    </Button>
  );
}
