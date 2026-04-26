"use client";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { RecordingPanel } from "@/components/exam/RecordingPanel";
import { AudioPlayer } from "@/components/exam/AudioPlayer";

type Segment = {
  id: string;
  orderIndex: number;
  sourceLanguage: string;
  sourceText: string;
  expectedInterpretation: string;
  keywords: string;
  audioFilePath: string | null;
  difficulty: string;
};

type Dialogue = { id: string; orderIndex: number; title: string; segments: Segment[] };
type MockTest = { id: string; title: string; dialogues: Dialogue[] };

type Phase = "select" | "playing" | "recording" | "scoring" | "result";

export function PracticeClient({ tests }: { tests: MockTest[] }) {
  const [selectedTest, setSelectedTest] = useState<MockTest | null>(null);
  const [selectedDialogue, setSelectedDialogue] = useState<Dialogue | null>(null);
  const [selectedSegment, setSelectedSegment] = useState<Segment | null>(null);
  const [phase, setPhase] = useState<Phase>("select");
  const [recordingId, setRecordingId] = useState<string | null>(null);
  const [manualText, setManualText] = useState("");
  const [scoreResult, setScoreResult] = useState<{
    estimatedScore: number; maxScore: number;
    examinerStyleFeedback: string; practiceDrill: string;
    missedKeyFacts: string[]; deductions: Array<{ category: string; points: number; explanation: string }>;
  } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function reset() {
    setPhase("select");
    setRecordingId(null);
    setManualText("");
    setScoreResult(null);
  }

  async function handleRecordingComplete(blob: Blob, durationMs: number) {
    if (!selectedSegment) return;
    setPhase("scoring");

    const attemptRes = await fetch("/api/attempts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mockTestId: selectedTest!.id, mode: "practice" }),
    });
    const attempt = await attemptRes.json();

    const form = new FormData();
    form.append("audio", blob, "recording.webm");
    form.append("attemptId", attempt.id);
    form.append("segmentId", selectedSegment.id);
    form.append("sourceLanguage", selectedSegment.sourceLanguage);
    form.append("targetLanguage", selectedSegment.sourceLanguage === "English" ? "Malayalam" : "English");
    form.append("durationMs", String(durationMs));
    form.append("repeatedSegmentUsed", "false");
    form.append("responseStartedWithinFiveSeconds", "true");
    form.append("startedAt", new Date().toISOString());
    form.append("endedAt", new Date().toISOString());

    const uploadRes = await fetch("/api/recordings", { method: "POST", body: form });
    const { recordingId: rid } = await uploadRes.json();
    setRecordingId(rid);
    setPhase("result");
  }

  async function handleManualScore() {
    if (!recordingId || !manualText.trim()) return;
    setSubmitting(true);
    try {
      await fetch(`/api/recordings/${recordingId}/transcript`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: manualText }),
      });
      const scoreRes = await fetch(`/api/recordings/${recordingId}/score`, { method: "POST" });
      const result = await scoreRes.json();
      setScoreResult(result);
    } finally {
      setSubmitting(false);
    }
  }

  if (phase === "select") {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {tests.map((t) => (
            <button
              key={t.id}
              onClick={() => { setSelectedTest(t); setSelectedDialogue(null); setSelectedSegment(null); }}
              className={`text-left px-3 py-2 rounded-lg border text-sm ${selectedTest?.id === t.id ? "border-blue-400 bg-blue-50" : "border-slate-200 hover:border-slate-300"}`}
            >
              {t.title}
            </button>
          ))}
        </div>

        {selectedTest && (
          <div>
            <p className="text-xs text-slate-400 mb-2 uppercase font-semibold">Select Dialogue</p>
            <div className="grid grid-cols-2 gap-2">
              {selectedTest.dialogues.map((d) => (
                <button
                  key={d.id}
                  onClick={() => { setSelectedDialogue(d); setSelectedSegment(null); }}
                  className={`text-left px-3 py-2 rounded-lg border text-sm ${selectedDialogue?.id === d.id ? "border-blue-400 bg-blue-50" : "border-slate-200 hover:border-slate-300"}`}
                >
                  D{d.orderIndex}: {d.title}
                </button>
              ))}
            </div>
          </div>
        )}

        {selectedDialogue && (
          <div>
            <p className="text-xs text-slate-400 mb-2 uppercase font-semibold">Select Segment</p>
            <div className="flex gap-2 flex-wrap">
              {selectedDialogue.segments.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSelectedSegment(s)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-medium ${selectedSegment?.id === s.id ? "border-blue-400 bg-blue-50 text-blue-700" : "border-slate-200 hover:border-slate-300"} ${s.sourceLanguage === "English" ? "text-blue-600" : "text-orange-600"}`}
                >
                  S{s.orderIndex} {s.sourceLanguage === "English" ? "EN→ML" : "ML→EN"} · {s.difficulty}
                </button>
              ))}
            </div>
          </div>
        )}

        {selectedSegment && (
          <div className="space-y-3">
            <div className="bg-blue-50 border border-blue-100 rounded p-3">
              <p className="text-xs text-slate-400 mb-1">Segment ({selectedSegment.sourceLanguage}):</p>
              <p className="text-sm text-slate-700">{selectedSegment.sourceText}</p>
            </div>
            <Button size="lg" className="w-full" onClick={() => setPhase("playing")}>
              Start Practice Session
            </Button>
          </div>
        )}
      </div>
    );
  }

  if (!selectedSegment) return null;

  if (phase === "playing") {
    return (
      <div className="space-y-4">
        <div className="bg-blue-50 border border-blue-100 rounded p-3">
          <p className="text-xs text-slate-400 mb-1">Segment ({selectedSegment.sourceLanguage}):</p>
          <p className="text-sm text-slate-700">{selectedSegment.sourceText}</p>
        </div>
        <AudioPlayer
          segmentId={selectedSegment.id}
          audioFilePath={selectedSegment.audioFilePath}
          sourceText={selectedSegment.sourceText}
          sourceLanguage={selectedSegment.sourceLanguage}
          onEnd={() => setPhase("recording")}
        />
      </div>
    );
  }

  if (phase === "recording") {
    return (
      <RecordingPanel
        segmentId={selectedSegment.id}
        onComplete={handleRecordingComplete}
        targetLanguage={selectedSegment.sourceLanguage === "English" ? "Malayalam" : "English"}
      />
    );
  }

  if (phase === "scoring") {
    return <div className="text-center py-8 text-slate-400">Uploading recording…</div>;
  }

  if (phase === "result") {
    return (
      <div className="space-y-4">
        <div className="bg-blue-50 border border-blue-100 rounded p-3">
          <p className="text-xs text-slate-400 mb-1">Source segment ({selectedSegment.sourceLanguage}):</p>
          <p className="text-sm text-slate-700">{selectedSegment.sourceText}</p>
        </div>

        <div className="bg-green-50 border border-green-100 rounded p-3">
          <p className="text-xs text-slate-400 mb-1">Expected interpretation:</p>
          <p className="text-sm text-slate-700">{selectedSegment.expectedInterpretation}</p>
        </div>

        {!scoreResult && (
          <div className="space-y-2">
            <p className="text-xs text-slate-500">Enter what you said to get AI scoring:</p>
            <textarea
              className="w-full border border-slate-200 rounded p-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
              rows={3}
              placeholder="Type your interpretation here…"
              value={manualText}
              onChange={(e) => setManualText(e.target.value)}
            />
            <Button size="sm" onClick={handleManualScore} loading={submitting} disabled={!manualText.trim()}>
              Get Score & Feedback
            </Button>
          </div>
        )}

        {scoreResult && (
          <Card>
            <CardContent className="pt-4 space-y-3">
              <div className="flex items-center gap-3">
                <p className="text-2xl font-bold">{scoreResult.estimatedScore}/{scoreResult.maxScore}</p>
                <Badge variant={scoreResult.estimatedScore >= scoreResult.maxScore * 0.7 ? "success" : "warning"}>
                  {Math.round((scoreResult.estimatedScore / scoreResult.maxScore) * 100)}%
                </Badge>
              </div>
              <p className="text-sm text-slate-600">{scoreResult.examinerStyleFeedback}</p>
              {scoreResult.missedKeyFacts.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-red-600">Missed key facts:</p>
                  <ul className="text-xs text-red-600 list-disc list-inside">
                    {scoreResult.missedKeyFacts.map((f, i) => <li key={i}>{f}</li>)}
                  </ul>
                </div>
              )}
              {scoreResult.deductions.length > 0 && (
                <div className="flex gap-1 flex-wrap">
                  {scoreResult.deductions.map((d, i) => (
                    <span key={i} className="text-xs bg-red-50 text-red-600 px-1.5 py-0.5 rounded">-{d.points} {d.category}</span>
                  ))}
                </div>
              )}
              <div className="bg-blue-50 rounded p-2">
                <p className="text-xs font-semibold text-blue-700">Practice drill:</p>
                <p className="text-xs text-blue-600">{scoreResult.practiceDrill}</p>
              </div>
              <p className="text-xs text-slate-400">AI-estimated score only.</p>
            </CardContent>
          </Card>
        )}

        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setPhase("playing")} className="flex-1">
            Retry Same Segment
          </Button>
          <Button onClick={reset} variant="secondary" className="flex-1">
            New Segment
          </Button>
        </div>
      </div>
    );
  }

  return null;
}
