import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

function EnvStatus({ label, envKey, value }: { label: string; envKey: string; value: string | undefined }) {
  const isSet = !!value && value.trim().length > 0;
  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
      <div>
        <p className="text-sm font-medium text-slate-700">{label}</p>
        <p className="text-xs text-slate-400 font-mono">{envKey}</p>
      </div>
      <Badge variant={isSet ? "success" : "outline"}>{isSet ? "Configured" : "Not set"}</Badge>
    </div>
  );
}

export default function SettingsPage() {
  const transcriptionProvider = process.env.TRANSCRIPTION_PROVIDER;
  const transcriptionKey = process.env.TRANSCRIPTION_API_KEY;
  const scoringProvider = process.env.SCORING_PROVIDER;
  const ttsProvider = process.env.TTS_PROVIDER;
  const uploadDir = process.env.UPLOAD_DIR ?? "./uploads";
  const dbUrl = process.env.DATABASE_URL;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-slate-500 mt-1">API key status and system configuration.</p>
      </div>

      <Card>
        <CardHeader><CardTitle>Transcription Provider</CardTitle></CardHeader>
        <CardContent>
          <EnvStatus label="Transcription Provider" envKey="TRANSCRIPTION_PROVIDER" value={transcriptionProvider} />
          <EnvStatus label="Transcription API Key" envKey="TRANSCRIPTION_API_KEY" value={transcriptionKey} />
          {!transcriptionProvider && (
            <div className="mt-3 bg-amber-50 border border-amber-200 rounded p-3 text-sm text-amber-800">
              No transcription provider configured. Automatic audio transcription is disabled.
              You will be prompted to enter your interpretation manually for demo scoring.
              Set <code>TRANSCRIPTION_PROVIDER=assemblyai</code> or <code>openai</code> in .env to enable.
            </div>
          )}
          {transcriptionProvider && (
            <p className="text-sm text-green-700 mt-3">
              ✓ Using: <strong>{transcriptionProvider}</strong>
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Text-to-Speech (Mock Audio)</CardTitle></CardHeader>
        <CardContent>
          <EnvStatus label="TTS Provider" envKey="TTS_PROVIDER" value={ttsProvider} />
          {!ttsProvider && (
            <div className="mt-3 bg-blue-50 border border-blue-100 rounded p-3 text-sm text-blue-800">
              No TTS provider configured. Mock test segments use browser SpeechSynthesis for demo playback.
              Run <code>npm run generate-audio</code> after setting TTS_PROVIDER to generate real audio files.
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Storage</CardTitle></CardHeader>
        <CardContent>
          <EnvStatus label="Database URL" envKey="DATABASE_URL" value={dbUrl} />
          <div className="py-2 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-700">Upload Directory</p>
              <p className="text-xs text-slate-400 font-mono">{uploadDir}</p>
            </div>
            <Badge variant="success">Local storage</Badge>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Recordings are stored locally. They are not uploaded to any third party unless you configure an API provider and explicitly start scoring.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Privacy</CardTitle></CardHeader>
        <CardContent className="space-y-3 text-sm text-slate-600">
          <p>Your recordings are private practice data stored locally on this machine.</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Recordings are saved to <code>{uploadDir}</code> on the server.</li>
            <li>No recordings are sent to third parties without your explicit configuration.</li>
            <li>This app does not implement proctoring or surveillance.</li>
            <li>You can delete all recordings by clearing the uploads directory.</li>
          </ul>
          <div className="border border-slate-200 rounded p-3 bg-slate-50">
            <p className="font-medium mb-1">To delete all recordings:</p>
            <p className="font-mono text-xs">rm -rf {uploadDir}/*</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Environment Configuration</CardTitle></CardHeader>
        <CardContent className="text-sm text-slate-600 space-y-2">
          <p>Edit <code>.env</code> in the project root to configure providers:</p>
          <pre className="bg-slate-900 text-slate-100 rounded p-3 text-xs overflow-x-auto">{`DATABASE_URL="file:./dev.db"
TRANSCRIPTION_PROVIDER="assemblyai"  # or "openai"
TRANSCRIPTION_API_KEY="your_key_here"
TTS_PROVIDER=""
TTS_API_KEY=""
UPLOAD_DIR="./uploads"
NEXT_PUBLIC_APP_NAME="NAATI CCL Malayalam Coach"`}</pre>
          <p className="text-xs text-slate-400">Restart the server after changing environment variables.</p>
        </CardContent>
      </Card>
    </div>
  );
}
