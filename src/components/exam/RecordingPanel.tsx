"use client";
import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/Button";
import { ElapsedTimer } from "@/components/ui/Timer";

function getSupportedMimeType(): string {
  const types = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/mp4",
    "audio/ogg;codecs=opus",
    "audio/ogg",
  ];
  for (const type of types) {
    if (MediaRecorder.isTypeSupported(type)) return type;
  }
  return "";
}

interface RecordingPanelProps {
  segmentId: string;
  onComplete: (blob: Blob, durationMs: number) => void;
  targetLanguage: string;
}

type RecordPhase = "recording" | "stopped" | "playback";

export function RecordingPanel({ segmentId, onComplete, targetLanguage }: RecordingPanelProps) {
  const [phase, setPhase] = useState<RecordPhase>("recording");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const blobRef = useRef<Blob | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const streamRef = useRef<MediaStream | null>(null);

  // Auto-start recording on mount
  const startRecording = useCallback(async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mimeType = getSupportedMimeType();
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];
      startTimeRef.current = Date.now();

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        // Flush any remaining data
        const finalChunks = [...chunksRef.current];
        const blob = new Blob(finalChunks, { type: mimeType || "audio/webm" });
        blobRef.current = blob;
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        setPhase("stopped");
        stream.getTracks().forEach((t) => t.stop());
      };

      // Request data every 250ms to avoid losing the final chunk
      recorder.start(250);
      setPhase("recording");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      if (msg.includes("Permission") || msg.includes("NotAllowed")) {
        setError("Microphone permission denied. Please allow microphone access and try again.");
      } else {
        setError(`Recording failed: ${msg}`);
      }
    }
  }, []);

  // Auto-start on first render
  const hasStarted = useRef(false);
  if (!hasStarted.current) {
    hasStarted.current = true;
    startRecording();
  }

  function stopRecording() {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== "inactive") {
      recorder.stop();
    }
  }

  function handleSubmit() {
    if (!blobRef.current) return;
    const durationMs = Date.now() - startTimeRef.current;
    setIsUploading(true);
    onComplete(blobRef.current, durationMs);
  }

  function handleReRecord() {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    blobRef.current = null;
    setPhase("recording");
    startRecording();
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-3">
        <p className="text-red-700 text-sm font-medium">Recording Error</p>
        <p className="text-red-600 text-sm">{error}</p>
        <Button onClick={() => { setError(null); startRecording(); }} variant="outline">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-700">
              {phase === "recording" ? "Recording…" : phase === "stopped" ? "Recording complete" : "Reviewing"}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              Interpret into: <strong>{targetLanguage}</strong>
            </p>
          </div>
          {phase === "recording" && (
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              <ElapsedTimer running={phase === "recording"} />
            </div>
          )}
        </div>

        {phase === "recording" && (
          <Button
            variant="danger"
            size="xl"
            className="w-full"
            onClick={stopRecording}
          >
            ⏹ Finish Response
          </Button>
        )}

        {phase === "stopped" && audioUrl && (
          <div className="space-y-3">
            <div>
              <p className="text-xs text-slate-400 mb-1.5">Play back your recording:</p>
              <audio controls src={audioUrl} className="w-full" />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleReRecord} className="flex-1">
                Re-record
              </Button>
              <Button onClick={handleSubmit} loading={isUploading} className="flex-1" size="lg">
                Submit Response
              </Button>
            </div>
          </div>
        )}
      </div>

      <p className="text-xs text-slate-400 text-center">
        Browser compatibility: Works in Chrome, Firefox, Edge, Safari 14.5+. Use Chrome for best results.
      </p>
    </div>
  );
}
