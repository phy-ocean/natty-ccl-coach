"use client";
import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Badge, StatusBadge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { ElapsedTimer, Countdown } from "@/components/ui/Timer";
import { AudioPlayer } from "@/components/exam/AudioPlayer";
import { RecordingPanel } from "@/components/exam/RecordingPanel";
import { cn } from "@/lib/cn";

type Segment = {
  id: string;
  orderIndex: number;
  sourceLanguage: string;
  sourceText: string;
  expectedInterpretation: string;
  keywords: string;
  topic: string;
  register: string;
  difficulty: string;
  audioFilePath: string | null;
};

type Dialogue = {
  id: string;
  orderIndex: number;
  title: string;
  topic: string;
  segments: Segment[];
};

type MockTest = {
  id: string;
  title: string;
  dialogues: Dialogue[];
};

type Phase =
  | "instructions"
  | "mic-check"
  | "dialogue-intro"
  | "playing-segment"
  | "chime"
  | "start-countdown"
  | "recording"
  | "review"
  | "uploading"
  | "complete";

type SegmentState = {
  segmentId: string;
  recordingId?: string;
  transcript?: string;
  score?: number;
  feedback?: string;
  uploadStatus: "pending" | "uploading" | "uploaded" | "failed";
  repeated: boolean;
};

export function ExamSimulator({
  test,
  attemptId,
  mode,
}: {
  test: MockTest;
  attemptId: string;
  mode: string;
}) {
  const router = useRouter();
  const isPractice = mode === "practice";

  const allSegments = test.dialogues.flatMap((d) =>
    d.segments.map((s) => ({ ...s, dialogueId: d.id, dialogueIndex: d.orderIndex }))
  );

  const [currentSegmentIdx, setCurrentSegmentIdx] = useState(0);
  const [phase, setPhase] = useState<Phase>("instructions");
  const [segmentStates, setSegmentStates] = useState<Record<string, SegmentState>>({});
  const [repeatsUsed, setRepeatsUsed] = useState<Record<string, number>>({});
  const [showExpected, setShowExpected] = useState(false);
  const [startedWithinFive, setStartedWithinFive] = useState(true);
  const [chimeCount, setChimeCount] = useState(0);
  const [isFinishing, setIsFinishing] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const chimeRef = useRef<HTMLAudioElement | null>(null);
  const currentSegment = allSegments[currentSegmentIdx];
  const currentDialogue = test.dialogues.find((d) => d.id === currentSegment?.dialogueId);
  const dialogueRepeats = repeatsUsed[currentSegment?.dialogueId ?? ""] ?? 0;
  const canRepeat = dialogueRepeats < 1;

  function playChime() {
    chimeRef.current?.play().catch(() => {});
  }

  function handleSegmentAudioEnd() {
    setPhase("chime");
    playChime();
    setTimeout(() => setPhase("start-countdown"), 800);
  }

  function handleStartCountdownExpire() {
    setStartedWithinFive(false);
    setPhase("recording");
  }

  function handleStartRecording() {
    setStartedWithinFive(true);
    setPhase("recording");
  }

  function handleRepeat() {
    if (!currentSegment) return;
    const did = currentSegment.dialogueId;
    const updated = { ...repeatsUsed, [did]: (repeatsUsed[did] ?? 0) + 1 };
    setRepeatsUsed(updated);
    fetch(`/api/attempts/${attemptId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ repeatsUsed: updated }),
    }).catch(() => {});
    setPhase("playing-segment");
  }

  async function handleRecordingComplete(blob: Blob, durationMs: number) {
    if (!currentSegment) return;
    setPhase("uploading");

    const state: SegmentState = {
      segmentId: currentSegment.id,
      uploadStatus: "uploading",
      repeated: (repeatsUsed[currentSegment.dialogueId] ?? 0) > 0,
    };
    setSegmentStates((prev) => ({ ...prev, [currentSegment.id]: state }));

    try {
      const form = new FormData();
      form.append("audio", blob, "recording.webm");
      form.append("attemptId", attemptId);
      form.append("segmentId", currentSegment.id);
      form.append("sourceLanguage", currentSegment.sourceLanguage);
      form.append("targetLanguage", currentSegment.sourceLanguage === "English" ? "Malayalam" : "English");
      form.append("durationMs", String(durationMs));
      form.append("repeatedSegmentUsed", String(state.repeated));
      form.append("responseStartedWithinFiveSeconds", String(startedWithinFive));
      form.append("startedAt", new Date().toISOString());
      form.append("endedAt", new Date().toISOString());

      const res = await fetch("/api/recordings", { method: "POST", body: form });
      if (!res.ok) throw new Error("Upload failed");
      const { recordingId } = await res.json();

      setSegmentStates((prev) => ({
        ...prev,
        [currentSegment.id]: { ...state, recordingId, uploadStatus: "uploaded" },
      }));

      setPhase("review");
    } catch {
      setSegmentStates((prev) => ({
        ...prev,
        [currentSegment.id]: { ...state, uploadStatus: "failed" },
      }));
      setPhase("review");
    }
  }

  async function handleNext() {
    const nextIdx = currentSegmentIdx + 1;
    if (nextIdx >= allSegments.length) {
      await finishTest();
    } else {
      const nextSeg = allSegments[nextIdx];
      const prevDialogueId = currentSegment?.dialogueId;
      const nextDialogueId = nextSeg.dialogueId;
      setCurrentSegmentIdx(nextIdx);
      setShowExpected(false);
      setPhase(prevDialogueId !== nextDialogueId ? "dialogue-intro" : "playing-segment");
    }
  }

  async function finishTest() {
    setIsFinishing(true);
    try {
      await fetch(`/api/attempts/${attemptId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "complete" }),
      });
      router.push(`/attempts/${attemptId}/report`);
    } catch {
      setIsFinishing(false);
    }
  }

  function startDialogue() {
    setPhase("playing-segment");
  }

  if (phase === "instructions") {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">{test.title}</h1>
        <Card>
          <CardContent className="pt-6 space-y-4">
            <h2 className="font-semibold text-lg">Before you begin</h2>
            <ul className="space-y-2 text-sm text-slate-600 list-disc list-inside">
              <li>You will interpret 2 dialogues, each with 8–12 segments.</li>
              <li>After each segment plays, a chime sounds.</li>
              <li>Start interpreting within 5 seconds of the chime.</li>
              <li>You may request one repeat per dialogue without penalty.</li>
              <li>Ensure your microphone is working and environment is quiet.</li>
              <li>{isPractice ? "Practice mode: expected answers shown after each segment." : "Exam mode: expected answers hidden until the report."}</li>
            </ul>
            <div className="bg-amber-50 border border-amber-200 rounded p-3 text-sm text-amber-800">
              AI scores are estimates only. Not official NAATI scores.
            </div>
          </CardContent>
        </Card>
        <Button size="xl" className="w-full" onClick={() => setPhase("mic-check")}>
          Continue to Mic Check
        </Button>
      </div>
    );
  }

  if (phase === "mic-check") {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <h2 className="text-xl font-bold">Microphone Check</h2>
        <MicCheck />
        <Button size="xl" className="w-full" onClick={() => setPhase("dialogue-intro")}>
          My Mic is Working — Start Test
        </Button>
      </div>
    );
  }

  if (!currentSegment || !currentDialogue) return null;

  if (phase === "dialogue-intro") {
    const isFirst = currentDialogue.orderIndex === 1;
    return (
      <div className="max-w-2xl mx-auto space-y-6 text-center">
        <div className="py-8">
          <p className="text-slate-400 text-sm mb-2">
            {isFirst ? "First Dialogue" : "Second Dialogue"}
          </p>
          <h2 className="text-2xl font-bold">{currentDialogue.title}</h2>
          <p className="text-slate-500 mt-2">Topic: {currentDialogue.topic}</p>
          <p className="text-slate-400 text-sm mt-4">{currentDialogue.segments.length} segments</p>
        </div>
        <Button size="xl" className="w-full" onClick={startDialogue}>
          Begin Dialogue {currentDialogue.orderIndex}
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      {/* Audio elements */}
      <audio ref={chimeRef} src="/sounds/chime.mp3" preload="auto" />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-400">
            Dialogue {currentDialogue.orderIndex} · Segment {currentSegment.orderIndex} of {currentDialogue.segments.length}
          </p>
          <p className="text-sm font-medium text-slate-700">{currentDialogue.title}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={currentSegment.sourceLanguage === "English" ? "info" : "warning"}>
            {currentSegment.sourceLanguage === "English" ? "EN → ML" : "ML → EN"}
          </Badge>
          <StatusBadge status={phase === "uploading" ? "uploading" : phase === "recording" ? "recording" : phase === "review" ? "uploaded" : "in_progress"} />
        </div>
      </div>

      {/* Segment audio player */}
      {(phase === "playing-segment" || phase === "chime") && (
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-slate-400 mb-2">Segment audio</p>
            <AudioPlayer
              segmentId={currentSegment.id}
              audioFilePath={currentSegment.audioFilePath}
              sourceText={currentSegment.sourceText}
              sourceLanguage={currentSegment.sourceLanguage}
              onEnd={handleSegmentAudioEnd}
            />
          </CardContent>
        </Card>
      )}

      {/* Start countdown */}
      {phase === "start-countdown" && (
        <Card>
          <CardContent className="pt-6 text-center space-y-3">
            <p className="text-slate-500 text-sm">Chime sounded. Begin interpreting within:</p>
            <Countdown seconds={5} onExpire={handleStartCountdownExpire} warningThreshold={3} />
            <Button onClick={handleStartRecording} size="lg" className="w-full mt-2">
              Start Recording Now
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Recording */}
      {phase === "recording" && (
        <RecordingPanel
          segmentId={currentSegment.id}
          onComplete={handleRecordingComplete}
          targetLanguage={currentSegment.sourceLanguage === "English" ? "Malayalam" : "English"}
        />
      )}

      {/* Review */}
      {(phase === "review" || phase === "uploading") && (
        <SegmentReview
          segment={currentSegment}
          state={segmentStates[currentSegment.id]}
          isPractice={isPractice}
          showExpected={showExpected}
          onShowExpected={() => setShowExpected(true)}
          onRepeat={canRepeat && phase === "review" ? handleRepeat : undefined}
          repeatsUsed={dialogueRepeats}
          onNext={phase === "review" ? handleNext : undefined}
          isLastSegment={currentSegmentIdx === allSegments.length - 1}
          isFinishing={isFinishing}
        />
      )}

      {/* Repeat button during play */}
      {phase === "playing-segment" && (
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRepeat}
            disabled={!canRepeat}
          >
            {canRepeat ? "🔁 Repeat Segment (free)" : "🔁 Repeat (penalty applies)"}
          </Button>
          <p className="text-xs text-slate-400">
            {dialogueRepeats} repeat{dialogueRepeats !== 1 ? "s" : ""} used this dialogue
          </p>
        </div>
      )}

      {/* Progress bar */}
      <div className="w-full bg-slate-100 rounded-full h-1.5">
        <div
          className="bg-blue-500 h-1.5 rounded-full transition-all"
          style={{ width: `${((currentSegmentIdx + 1) / allSegments.length) * 100}%` }}
        />
      </div>
      <p className="text-center text-xs text-slate-400">
        Segment {currentSegmentIdx + 1} of {allSegments.length}
      </p>
    </div>
  );
}

function SegmentReview({
  segment,
  state,
  isPractice,
  showExpected,
  onShowExpected,
  onRepeat,
  repeatsUsed,
  onNext,
  isLastSegment,
  isFinishing,
}: {
  segment: Segment & { dialogueId: string; dialogueIndex: number };
  state?: SegmentState;
  isPractice: boolean;
  showExpected: boolean;
  onShowExpected: () => void;
  onRepeat?: () => void;
  repeatsUsed: number;
  onNext?: () => void;
  isLastSegment: boolean;
  isFinishing: boolean;
}) {
  const [manualTranscript, setManualTranscript] = useState("");
  const [submitStatus, setSubmitStatus] = useState<"idle" | "submitting" | "done" | "error">("idle");
  const [scoreResult, setScoreResult] = useState<{ estimatedScore: number; maxScore: number; examinerStyleFeedback: string; practiceDrill: string } | null>(null);

  async function handleManualSubmit() {
    if (!state?.recordingId || !manualTranscript.trim()) return;
    setSubmitStatus("submitting");
    try {
      await fetch(`/api/recordings/${state.recordingId}/transcript`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: manualTranscript }),
      });
      const scoreRes = await fetch(`/api/recordings/${state.recordingId}/score`, { method: "POST" });
      const result = await scoreRes.json();
      setScoreResult(result);
      setSubmitStatus("done");
    } catch {
      setSubmitStatus("error");
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-4 space-y-3">
          {state?.uploadStatus === "failed" && (
            <div className="text-sm text-red-600 bg-red-50 rounded p-2">Upload failed. Your recording may not have saved.</div>
          )}

          {state?.uploadStatus === "uploaded" && (
            <div className="text-sm text-green-600 bg-green-50 rounded p-2">✓ Recording uploaded successfully.</div>
          )}

          <div className="bg-blue-50 border border-blue-100 rounded p-3">
            <p className="text-xs text-slate-500 mb-1">Source segment ({segment.sourceLanguage})</p>
            <p className="text-sm text-slate-700">{segment.sourceText}</p>
          </div>

          {/* Manual transcript fallback */}
          {state?.recordingId && submitStatus !== "done" && (
            <div className="border border-slate-200 rounded p-3 space-y-2">
              <p className="text-xs text-slate-500">
                No auto-transcription configured. Type what you said to get AI scoring:
              </p>
              <textarea
                className="w-full border border-slate-200 rounded p-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
                rows={3}
                placeholder={`Your interpretation in ${segment.sourceLanguage === "English" ? "Malayalam" : "English"}...`}
                value={manualTranscript}
                onChange={(e) => setManualTranscript(e.target.value)}
              />
              <Button size="sm" onClick={handleManualSubmit} loading={submitStatus === "submitting"} disabled={!manualTranscript.trim()}>
                Submit for Scoring
              </Button>
              {submitStatus === "error" && <p className="text-xs text-red-600">Scoring failed. Please try again.</p>}
            </div>
          )}

          {scoreResult && (
            <div className="bg-green-50 border border-green-100 rounded p-3 space-y-1">
              <p className="text-sm font-semibold">Estimated score: {scoreResult.estimatedScore}/{scoreResult.maxScore} for this segment</p>
              <p className="text-xs text-slate-600">{scoreResult.examinerStyleFeedback}</p>
              {isPractice && <p className="text-xs text-blue-600 mt-1">Drill: {scoreResult.practiceDrill}</p>}
            </div>
          )}

          {isPractice && (
            <div>
              {!showExpected ? (
                <Button variant="outline" size="sm" onClick={onShowExpected}>
                  Show Expected Interpretation
                </Button>
              ) : (
                <div className="bg-slate-50 border border-slate-200 rounded p-3">
                  <p className="text-xs text-slate-400 mb-1">Expected interpretation</p>
                  <p className="text-sm text-slate-700">{segment.expectedInterpretation}</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex gap-3">
        {onRepeat && (
          <Button variant="outline" onClick={onRepeat} disabled={repeatsUsed >= 1}>
            {repeatsUsed === 0 ? "🔁 Repeat Segment (free)" : "🔁 Repeat (used)"}
          </Button>
        )}
        {onNext && (
          <Button size="lg" onClick={onNext} loading={isFinishing} className="flex-1">
            {isLastSegment ? "Finish Test & View Report" : "Next Segment →"}
          </Button>
        )}
      </div>
    </div>
  );
}

function MicCheck() {
  const [status, setStatus] = useState<"idle" | "checking" | "ok" | "denied">("idle");
  const [level, setLevel] = useState(0);
  const animRef = useRef<number | undefined>(undefined);
  const analyserRef = useRef<AnalyserNode | undefined>(undefined);

  async function checkMic() {
    setStatus("checking");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const ctx = new AudioContext();
      const analyser = ctx.createAnalyser();
      analyserRef.current = analyser;
      ctx.createMediaStreamSource(stream).connect(analyser);
      analyser.fftSize = 256;
      const data = new Uint8Array(analyser.frequencyBinCount);

      function tick() {
        analyser.getByteFrequencyData(data);
        const avg = data.reduce((a, b) => a + b, 0) / data.length;
        setLevel(Math.round((avg / 128) * 100));
        animRef.current = requestAnimationFrame(tick);
      }
      tick();
      setStatus("ok");
    } catch {
      setStatus("denied");
    }
  }

  useEffect(() => {
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, []);

  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        {status === "idle" && (
          <Button onClick={checkMic} size="lg" className="w-full">
            Test Microphone
          </Button>
        )}
        {status === "checking" && <p className="text-slate-500 text-sm">Requesting permission…</p>}
        {status === "denied" && (
          <div className="text-red-600 text-sm bg-red-50 rounded p-3">
            Microphone access denied. Please allow microphone access in your browser and refresh.
          </div>
        )}
        {status === "ok" && (
          <div className="space-y-3">
            <p className="text-green-600 text-sm font-medium">✓ Microphone detected</p>
            <div className="space-y-1">
              <p className="text-xs text-slate-400">Volume level (speak to test):</p>
              <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden">
                <div
                  className="h-full bg-green-400 rounded-full transition-all duration-75"
                  style={{ width: `${level}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
