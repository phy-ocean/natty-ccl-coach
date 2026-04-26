"use client";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";

function getSupportedMimeType(): string {
  const types = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg;codecs=opus", "audio/ogg"];
  for (const t of types) {
    if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(t)) return t;
  }
  return "";
}

type Phase = "idle" | "checking" | "live" | "recording" | "done" | "error";

export function RecordingTestClient() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [level, setLevel] = useState(0);
  const [mimeType, setMimeType] = useState("");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploadResult, setUploadResult] = useState<string | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);

  const streamRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const animRef = useRef<number | undefined>(undefined);
  const blobRef = useRef<Blob | null>(null);

  useEffect(() => {
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  async function startMicCheck() {
    setPhase("checking");
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

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

      const mt = getSupportedMimeType();
      setMimeType(mt);
      setPhase("live");
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg.includes("NotAllowed") ? "Microphone permission denied. Check browser settings." : `Error: ${msg}`);
      setPhase("error");
    }
  }

  function startRecording() {
    const stream = streamRef.current;
    if (!stream) return;
    chunksRef.current = [];
    const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
    recorderRef.current = recorder;
    recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: mimeType || "audio/webm" });
      blobRef.current = blob;
      setAudioUrl(URL.createObjectURL(blob));
      setPhase("done");
    };
    recorder.start(250);
    setPhase("recording");
  }

  function stopRecording() {
    recorderRef.current?.stop();
  }

  async function testUpload() {
    if (!blobRef.current) return;
    setUploadLoading(true);
    setUploadResult(null);
    try {
      // Create a dummy attempt for test
      const ar = await fetch("/api/attempts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mockTestId: "test", mode: "practice" }),
      });

      if (!ar.ok) {
        setUploadResult("Upload test: endpoint responded (no real test ID in test mode).");
        return;
      }

      setUploadResult("✓ Upload endpoint is reachable.");
    } catch {
      setUploadResult("✗ Could not reach upload endpoint.");
    } finally {
      setUploadLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-5 space-y-4">
          {phase === "idle" && (
            <Button size="xl" className="w-full" onClick={startMicCheck}>
              Test Microphone
            </Button>
          )}

          {phase === "checking" && <p className="text-slate-500 text-sm text-center">Requesting microphone permission…</p>}

          {phase === "error" && (
            <div className="space-y-3">
              <div className="bg-red-50 border border-red-200 rounded p-3 text-sm text-red-700">{error}</div>
              <Button variant="outline" onClick={() => setPhase("idle")}>Try Again</Button>
            </div>
          )}

          {(phase === "live" || phase === "recording" || phase === "done") && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-green-600 font-medium">✓ Microphone detected</span>
                  <span className="text-xs text-slate-400">MIME: {mimeType || "browser default"}</span>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-slate-400">Volume level (speak to see it move):</p>
                  <div className="w-full bg-slate-100 rounded-full h-5 overflow-hidden">
                    <div
                      className="h-full bg-green-400 rounded-full transition-all duration-75"
                      style={{ width: `${level}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-400 text-right">{level}%</p>
                </div>
              </div>

              {phase === "live" && (
                <Button size="lg" variant="danger" onClick={startRecording} className="w-full">
                  Start Test Recording
                </Button>
              )}

              {phase === "recording" && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-red-600 text-sm font-medium">
                    <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                    Recording… speak a few words
                  </div>
                  <Button variant="outline" onClick={stopRecording} className="w-full">
                    Stop Recording
                  </Button>
                </div>
              )}

              {phase === "done" && audioUrl && (
                <div className="space-y-3">
                  <p className="text-green-600 text-sm font-medium">✓ Recording captured. Play it back:</p>
                  <audio controls src={audioUrl} className="w-full" />
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setPhase("live")} className="flex-1">
                      Record Again
                    </Button>
                    <Button onClick={testUpload} loading={uploadLoading} className="flex-1">
                      Test Upload
                    </Button>
                  </div>
                  {uploadResult && (
                    <p className={`text-sm ${uploadResult.startsWith("✓") ? "text-green-600" : "text-red-600"}`}>
                      {uploadResult}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
