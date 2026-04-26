import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

export default function DrillsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Practice Drills</h1>
        <p className="text-slate-500 mt-1">Targeted exercises to build specific CCL skills.</p>
      </div>

      {/* Numbers drill */}
      <Card id="numbers">
        <CardHeader><CardTitle>🔢 Numbers & Names Drill</CardTitle></CardHeader>
        <CardContent className="space-y-3 text-sm text-slate-600">
          <p><strong>Goal:</strong> Achieve 100% accuracy on numbers, dates, amounts, and proper names — the most-penalised error category in CCL.</p>
          <p><strong>How to practise:</strong></p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Open any segment from the mock tests that contains a number, date, or name.</li>
            <li>Listen once. In your notes, write ONLY the numbers and names you heard.</li>
            <li>Interpret the full segment into the target language.</li>
            <li>Check: Did every number, date, amount, and name appear in your interpretation?</li>
            <li>Repeat the segment if any number was wrong or missing.</li>
          </ol>
          <div className="bg-slate-50 border border-slate-200 rounded p-3 mt-2">
            <p className="font-semibold text-slate-700 mb-2">Practice phrases — say aloud in Malayalam:</p>
            <ul className="space-y-1 text-xs">
              <li>Your appointment is at <strong>2:30 pm on March 15</strong> with Dr. Sharma.</li>
              <li>The bond is <strong>$1,500</strong>. The cleaning fee is <strong>$450</strong>.</li>
              <li>You must lodge within <strong>21 days</strong> of termination.</li>
              <li>The visa application fee is <strong>$4,770</strong> for the primary applicant.</li>
              <li>The fortnightly payment rate is <strong>$949.30</strong>.</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* 5-second drill */}
      <Card id="five-second">
        <CardHeader><CardTitle>⏱ 5-Second Start Drill</CardTitle></CardHeader>
        <CardContent className="space-y-3 text-sm text-slate-600">
          <p><strong>Goal:</strong> Begin interpreting within 5 seconds of the chime on every segment, every time.</p>
          <p><strong>Why it matters:</strong> NAATI deducts marks for delayed starts. The habit must be automatic by exam day.</p>
          <p><strong>How to practise:</strong></p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Play any segment from the exam simulator.</li>
            <li>When the chime sounds (or when you manually click Play and the segment ends), start a mental countdown: 1… 2… 3… 4… 5.</li>
            <li>You must start speaking before you reach 5.</li>
            <li>It&apos;s okay if your first words are incomplete — begin with something like &ldquo;The patient…&rdquo; or &ldquo;He said…&rdquo; to anchor yourself.</li>
            <li>Repeat 20 times per session until the 5-second start is automatic.</li>
          </ol>
          <div className="bg-amber-50 border border-amber-200 rounded p-3 mt-2 text-amber-800 text-xs">
            <strong>Reminder:</strong> Silence after the chime is more costly than an imperfect start. Speaking and self-correcting is always better than not speaking.
          </div>
        </CardContent>
      </Card>

      {/* Memory drill */}
      <Card id="memory">
        <CardHeader><CardTitle>🧠 Memory Without Notes Drill</CardTitle></CardHeader>
        <CardContent className="space-y-3 text-sm text-slate-600">
          <p><strong>Goal:</strong> Retain a complete 35-word segment in working memory without writing anything.</p>
          <p><strong>How to practise:</strong></p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Play a segment with your hands on the table — no pen, no paper.</li>
            <li>Listen for meaning units: who / what / when / where / amount / action.</li>
            <li>Immediately after the segment ends, speak your interpretation.</li>
            <li>Check against the expected interpretation: what did you miss?</li>
            <li>Repeat the same segment until you miss nothing.</li>
          </ol>
          <div className="bg-blue-50 border border-blue-100 rounded p-3 mt-2 text-blue-800 text-xs">
            <strong>Tip:</strong> Visualise the scene as you listen — picture the doctor, the landlord, the court. This anchors meaning better than trying to remember words.
          </div>
        </CardContent>
      </Card>

      {/* Shadowing drill */}
      <Card id="shadowing">
        <CardHeader><CardTitle>🎤 Shadowing Mode</CardTitle></CardHeader>
        <CardContent className="space-y-3 text-sm text-slate-600">
          <p><strong>Goal:</strong> Improve fluency, pronunciation, and natural language production in both languages.</p>
          <p><strong>Steps:</strong></p>
          <ol className="list-decimal list-inside space-y-1">
            <li><strong>Listen:</strong> Play the source segment fully — understand the meaning.</li>
            <li><strong>Shadow:</strong> Play it again and repeat aloud in the same language simultaneously or slightly behind.</li>
            <li><strong>Interpret:</strong> Now interpret it into the target language naturally.</li>
          </ol>
          <p className="mt-2">Shadowing in both directions daily builds muscle memory for natural delivery and reduces hesitation.</p>
          <div className="bg-slate-50 border border-slate-200 rounded p-3 mt-2">
            <p className="text-xs font-semibold text-slate-700">Note-taking symbols drill</p>
            <p className="text-xs text-slate-500 mt-1">While shadowing, practise using shorthand notes simultaneously. Goal: your notes capture the key facts in &lt;15 words while you listen.</p>
          </div>
        </CardContent>
      </Card>

      {/* Register drill */}
      <Card>
        <CardHeader><CardTitle>📋 Register & Formality Drill</CardTitle></CardHeader>
        <CardContent className="space-y-3 text-sm text-slate-600">
          <p><strong>Goal:</strong> Instantly identify the correct register and maintain it throughout the interpretation.</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-2">
            {[
              { label: "Formal", examples: "Court, police, government department, legal documents", tip: "Use formal Malayalam equivalents. No contractions. No slang." },
              { label: "Semi-formal", examples: "Hospital, school, real estate office, Centrelink", tip: "Polite and clear. Professional but accessible." },
              { label: "Informal", examples: "Community worker, casual conversation", tip: "Natural, direct. But still accurate — no invented content." },
            ].map(({ label, examples, tip }) => (
              <div key={label} className="border border-slate-200 rounded p-3">
                <p className="font-semibold text-slate-700 mb-1">{label}</p>
                <p className="text-xs text-slate-500 mb-2">Settings: {examples}</p>
                <p className="text-xs text-slate-600">{tip}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-400 mt-2">Drill: Take a formal segment and re-record it twice — once too casually, once correctly. Notice how register changes the feel of the interpretation.</p>
        </CardContent>
      </Card>
    </div>
  );
}
