import type { TranscriptionResult } from "@/types";

export interface TranscriptionProvider {
  transcribeAudio(
    filePath: string,
    languageHint?: string
  ): Promise<TranscriptionResult>;
}

class AssemblyAIProvider implements TranscriptionProvider {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async transcribeAudio(filePath: string, _languageHint = "en"): Promise<TranscriptionResult> {
    const { readFileSync } = await import("fs");
    const audioData = readFileSync(filePath);

    const uploadRes = await fetch("https://api.assemblyai.com/v2/upload", {
      method: "POST",
      headers: { authorization: this.apiKey, "content-type": "application/octet-stream" },
      body: audioData,
    });
    const { upload_url } = (await uploadRes.json()) as { upload_url: string };

    const transcriptRes = await fetch("https://api.assemblyai.com/v2/transcript", {
      method: "POST",
      headers: { authorization: this.apiKey, "content-type": "application/json" },
      body: JSON.stringify({ audio_url: upload_url, language_code: "en" }),
    });
    const { id } = (await transcriptRes.json()) as { id: string };

    for (let i = 0; i < 30; i++) {
      await new Promise((r) => setTimeout(r, 3000));
      const pollRes = await fetch(`https://api.assemblyai.com/v2/transcript/${id}`, {
        headers: { authorization: this.apiKey },
      });
      const data = (await pollRes.json()) as {
        status: string;
        text?: string;
        confidence?: number;
        audio_duration?: number;
        words?: Array<{ text: string; start: number; end: number }>;
      };
      if (data.status === "completed") {
        return {
          text: data.text ?? "",
          confidence: data.confidence,
          duration: data.audio_duration,
          words: data.words?.map((w) => ({ word: w.text, start: w.start, end: w.end })),
        };
      }
      if (data.status === "error") throw new Error("AssemblyAI transcription error");
    }
    throw new Error("Transcription timed out");
  }
}

class OpenAIWhisperProvider implements TranscriptionProvider {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async transcribeAudio(filePath: string, _languageHint = "en"): Promise<TranscriptionResult> {
    const { readFileSync } = await import("fs");
    const { basename } = await import("path");

    const audioData = readFileSync(filePath);
    const filename = basename(filePath);

    const formData = new FormData();
    formData.append("file", new Blob([audioData]), filename);
    formData.append("model", "whisper-1");
    formData.append("response_format", "verbose_json");

    const res = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: { Authorization: `Bearer ${this.apiKey}` },
      body: formData,
    });

    const data = (await res.json()) as {
      text?: string;
      words?: Array<{ word: string; start: number; end: number }>;
      duration?: number;
    };
    return { text: data.text ?? "", words: data.words, duration: data.duration };
  }
}

export function getTranscriptionProvider(): TranscriptionProvider | null {
  const provider = process.env.TRANSCRIPTION_PROVIDER;
  const apiKey = process.env.TRANSCRIPTION_API_KEY;

  if (!provider || !apiKey) return null;

  switch (provider.toLowerCase()) {
    case "assemblyai":
      return new AssemblyAIProvider(apiKey);
    case "openai":
    case "whisper":
      return new OpenAIWhisperProvider(apiKey);
    default:
      return null;
  }
}
