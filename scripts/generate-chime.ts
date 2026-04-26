// Generates a simple chime WAV file using pure math (no external deps)
import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

const SAMPLE_RATE = 44100;
const DURATION = 0.6;
const FREQUENCY = 880;

function generateChimeWav(): Buffer {
  const numSamples = Math.floor(SAMPLE_RATE * DURATION);
  const dataSize = numSamples * 2;
  const buffer = Buffer.alloc(44 + dataSize);

  // WAV header
  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write("WAVE", 8);
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(SAMPLE_RATE, 24);
  buffer.writeUInt32LE(SAMPLE_RATE * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write("data", 36);
  buffer.writeUInt32LE(dataSize, 40);

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    const envelope = Math.exp(-t * 5);
    const sample1 = Math.sin(2 * Math.PI * FREQUENCY * t) * envelope;
    const sample2 = Math.sin(2 * Math.PI * FREQUENCY * 1.5 * t) * envelope * 0.5;
    const value = Math.round((sample1 + sample2) * 16383);
    const clamped = Math.max(-32768, Math.min(32767, value));
    buffer.writeInt16LE(clamped, 44 + i * 2);
  }

  return buffer;
}

const dir = join(process.cwd(), "public", "sounds");
mkdirSync(dir, { recursive: true });
const wav = generateChimeWav();
writeFileSync(join(dir, "chime.mp3"), wav);
console.log("✓ Chime sound generated at public/sounds/chime.mp3 (WAV format, .mp3 extension for browser compat)");
