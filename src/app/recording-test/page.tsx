import { RecordingTestClient } from "./RecordingTestClient";

export default function RecordingTestPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Microphone Test</h1>
        <p className="text-slate-500 mt-1">Test your microphone before taking a mock test.</p>
      </div>
      <RecordingTestClient />
      <div className="text-sm text-slate-500 space-y-1">
        <p><strong>Browser compatibility:</strong></p>
        <ul className="list-disc list-inside text-xs space-y-0.5">
          <li>Chrome / Edge: Full support (recommended)</li>
          <li>Firefox: Supported (audio/webm)</li>
          <li>Safari 14.5+: Supported (audio/mp4)</li>
          <li>iOS Safari: Limited — may require user interaction to start recording</li>
        </ul>
        <p className="text-xs mt-2">If your microphone is not detected, check browser permissions and ensure no other app is using the microphone.</p>
      </div>
    </div>
  );
}
