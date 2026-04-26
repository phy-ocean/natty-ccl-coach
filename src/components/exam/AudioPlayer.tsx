"use client";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/Button";

interface AudioPlayerProps {
  segmentId: string;
  audioFilePath: string | null;
  sourceText: string;
  sourceLanguage: string;
  onEnd: () => void;
}

export function AudioPlayer({ segmentId, audioFilePath, sourceText, sourceLanguage, onEnd }: AudioPlayerProps) {
  const [status, setStatus] = useState<"ready" | "playing" | "done" | "tts_unsupported">("ready");
  const [ttsAvailable, setTtsAvailable] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    setTtsAvailable("speechSynthesis" in window);
  }, []);

  function playAudioFile() {
    if (!audioFilePath) return;
    const audio = new Audio(audioFilePath);
    audioRef.current = audio;
    audio.onended = () => {
      setStatus("done");
      onEnd();
    };
    audio.onerror = () => {
      setStatus("done");
      onEnd();
    };
    audio.play().catch(() => {
      setStatus("done");
      onEnd();
    });
    setStatus("playing");
  }

  function playTTS() {
    if (!ttsAvailable) {
      setStatus("done");
      onEnd();
      return;
    }

    speechSynthesis.cancel();
    const voices = speechSynthesis.getVoices();

    let voice: SpeechSynthesisVoice | undefined;
    if (sourceLanguage === "Malayalam") {
      voice = voices.find((v) => v.lang.startsWith("ml"));
    } else {
      voice = voices.find((v) => v.lang.startsWith("en"));
    }

    const utterance = new SpeechSynthesisUtterance(sourceText);
    utterance.rate = 0.9;
    if (voice) utterance.voice = voice;
    utterance.onend = () => {
      setStatus("done");
      onEnd();
    };
    utterance.onerror = () => {
      setStatus("done");
      onEnd();
    };
    utteranceRef.current = utterance;
    speechSynthesis.speak(utterance);
    setStatus("playing");
  }

  function handlePlay() {
    if (audioFilePath) {
      playAudioFile();
    } else {
      playTTS();
    }
  }

  function handleStop() {
    audioRef.current?.pause();
    speechSynthesis.cancel();
    setStatus("done");
    onEnd();
  }

  const mlVoiceWarning =
    !audioFilePath && sourceLanguage === "Malayalam" && ttsAvailable
      ? (() => {
          const voices = typeof window !== "undefined" ? speechSynthesis.getVoices() : [];
          return !voices.find((v) => v.lang.startsWith("ml"));
        })()
      : false;

  return (
    <div className="space-y-3">
      {!audioFilePath && (
        <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded p-2">
          {mlVoiceWarning
            ? "⚠ No Malayalam TTS voice found on this device. The text will be shown for you to read aloud. Upload your own audio per segment in Settings."
            : "Demo mode: using browser TTS. For a realistic experience, generate audio with npm run generate-audio."}
        </div>
      )}

      {(status === "ready" || status === "done") && (
        <Button onClick={handlePlay} size="lg" className="w-full" variant={status === "done" ? "outline" : "primary"}>
          {status === "done" ? "▶ Play Again" : "▶ Play Segment"}
        </Button>
      )}

      {status === "playing" && (
        <div className="flex gap-2">
          <div className="flex-1 flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
            <span className="inline-block w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
            <span className="text-sm text-blue-700 font-medium">Playing segment…</span>
          </div>
          <Button variant="outline" onClick={handleStop}>Stop</Button>
        </div>
      )}

      {/* Show text if no audio and ml warning */}
      {!audioFilePath && mlVoiceWarning && (
        <div className="bg-slate-50 border border-slate-200 rounded p-3">
          <p className="text-xs text-slate-400 mb-1">Segment text (read aloud then click Play to start recording timer):</p>
          <p className="text-sm text-slate-700">{sourceText}</p>
        </div>
      )}

      {status === "done" && (
        <p className="text-xs text-slate-400 text-center">Chime will sound. Begin your interpretation.</p>
      )}
    </div>
  );
}
