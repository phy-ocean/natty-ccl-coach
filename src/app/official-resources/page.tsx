import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

export default function OfficialResourcesPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Official NAATI Resources</h1>
        <p className="text-slate-500 mt-1">
          Links to official NAATI materials. This app is not affiliated with or endorsed by NAATI.
        </p>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-800">
        <strong>Important:</strong> This app is an unofficial private preparation tool. It is not
        affiliated with, endorsed by, or a replacement for official NAATI assessment. Always refer to
        NAATI&apos;s official website for authoritative information.
      </div>

      <Card>
        <CardHeader><CardTitle>Official NAATI CCL Pages</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {[
            {
              title: "CCL Overview",
              url: "https://www.naati.com.au/migration-assessments/ccl/",
              description: "Official overview of the Community Language component of the NAATI Credentialled Community Language test.",
            },
            {
              title: "Candidate Instructions",
              url: "https://www.naati.com.au/resources/candidate-instructions-ccl/",
              description: "Official candidate instructions including test format, scoring, and preparation advice.",
            },
            {
              title: "Downloadable CCL Practice Materials — Malayalam",
              url: "https://www.naati.com.au/migration-assessments/ccl/downloadable-ccl-practice-materials-by-language/",
              description: "Official practice materials by language. Look for Malayalam in the list.",
            },
            {
              title: "Online CCL Practice Test",
              url: "https://www.naati.com.au/ccl-practice-test/",
              description: "NAATI&apos;s official online practice test environment. Use this to familiarise yourself with the real platform before your exam.",
            },
          ].map(({ title, url, description }) => (
            <div key={url} className="border border-slate-100 rounded-lg p-4 hover:border-blue-200 transition-colors">
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-blue-700 hover:underline text-sm"
              >
                {title} ↗
              </a>
              <p className="text-sm text-slate-500 mt-1">{description}</p>
              <p className="text-xs text-slate-300 mt-1 font-mono">{url}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>What to Do on Exam Day</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm text-slate-600">
          <ul className="list-disc list-inside space-y-1">
            <li>Log in to the official NAATI test platform at least 15 minutes early.</li>
            <li>Ensure your microphone is connected and tested.</li>
            <li>Use a stable internet connection — wired is preferred.</li>
            <li>Ensure your environment is quiet with no background noise.</li>
            <li>Have your photo ID ready.</li>
            <li>Close all unnecessary browser tabs and applications.</li>
            <li>Remember: only one repeat per dialogue without penalty.</li>
            <li>Begin interpreting within 5 seconds of the chime.</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>About This App</CardTitle></CardHeader>
        <CardContent className="text-sm text-slate-600 space-y-2">
          <p>
            NAATI CCL Malayalam Coach is a private, unofficial preparation tool. It is designed to
            help candidates practise for the NAATI CCL test through mock tests, segment practice,
            vocabulary study, and AI-estimated scoring.
          </p>
          <p className="font-medium text-amber-700">
            This app does not provide official NAATI scores, is not endorsed by NAATI, and cannot
            guarantee any exam outcome. Only NAATI examiners can issue official scores.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
