import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

export default function StudyMaterialPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Study Material</h1>
        <p className="text-slate-500 mt-1">Comprehensive preparation guides for NAATI CCL Malayalam.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/study-plan" className="block">
          <Card className="hover:border-blue-300 transition-colors h-full">
            <CardContent className="pt-5">
              <p className="text-2xl mb-2">📅</p>
              <h2 className="font-bold text-slate-800">7-Day Study Plan</h2>
              <p className="text-sm text-slate-500 mt-1">Structured daily tasks targeting 85/90.</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/vocabulary" className="block">
          <Card className="hover:border-blue-300 transition-colors h-full">
            <CardContent className="pt-5">
              <p className="text-2xl mb-2">🔤</p>
              <h2 className="font-bold text-slate-800">Vocabulary Bank</h2>
              <p className="text-sm text-slate-500 mt-1">68+ terms with Malayalam, examples and common mistakes.</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Format overview */}
      <Card>
        <CardHeader><CardTitle>CCL Test Format</CardTitle></CardHeader>
        <CardContent className="space-y-3 text-sm text-slate-600">
          <ul className="list-disc list-inside space-y-1">
            <li>2 pre-recorded dialogues between English and Malayalam speakers.</li>
            <li>Each dialogue ≈ 300 words — roughly half English, half Malayalam.</li>
            <li>Each dialogue divided into short segments of 35 words or less.</li>
            <li>After each segment, a chime sounds. Candidate begins interpreting within 5 seconds.</li>
            <li>Marked out of 90: 45 per dialogue.</li>
            <li>Pass: 63+ overall AND 29+ in each dialogue.</li>
            <li>Only one repeat per dialogue without penalty.</li>
            <li>Deduction-based marking: accuracy, completeness, language quality, register, delivery.</li>
          </ul>
        </CardContent>
      </Card>

      {/* Score strategy */}
      <Card>
        <CardHeader><CardTitle>85/90 Score Strategy</CardTitle></CardHeader>
        <CardContent className="space-y-3 text-sm text-slate-600">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="font-semibold text-slate-700 mb-2">✓ Do</p>
              <ul className="space-y-1 list-disc list-inside">
                <li>Aim for 42+ in one dialogue, 43+ in the other.</li>
                <li>Start speaking within 5 seconds of the chime.</li>
                <li>Preserve every number, date, name, and amount exactly.</li>
                <li>Preserve speaker tone and register.</li>
                <li>Speak in natural direct first-person style.</li>
                <li>Use standard Malayalam equivalents for official terms.</li>
                <li>Self-correct briefly: &ldquo;Sorry, I&rsquo;ll say that part again.&rdquo;</li>
                <li>Keep delivery smooth and continuous.</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-slate-700 mb-2">✗ Avoid</p>
              <ul className="space-y-1 list-disc list-inside">
                <li>Word-for-word translation that harms meaning.</li>
                <li>Omissions — any missing key fact costs marks.</li>
                <li>Additions or explanations not in the source.</li>
                <li>Softening formal language (prohibited → not recommended).</li>
                <li>Using more than one repeat per dialogue.</li>
                <li>Long pauses, excessive filler words (um, uh, er).</li>
                <li>Informal Malayalam in formal contexts.</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Note-taking */}
      <Card>
        <CardHeader><CardTitle>Note-Taking Strategies</CardTitle></CardHeader>
        <CardContent className="space-y-3 text-sm text-slate-600">
          <p>Use compact symbols to capture meaning quickly during each segment.</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {[
              ["↑", "increase / more / higher"],
              ["↓", "decrease / less / lower"],
              ["$", "money / payment / amount"],
              ["Dr", "doctor / physician"],
              ["→", "leads to / results in"],
              ["!", "important / urgent / must"],
              ["?", "question / enquiry"],
              ["×", "denied / not allowed / no"],
              ["✓", "approved / yes / allowed"],
              ["#", "number / reference ID"],
              ["wk", "week"],
              ["mth", "month"],
            ].map(([sym, meaning]) => (
              <div key={sym} className="flex gap-2 items-center bg-slate-50 rounded p-2">
                <span className="font-mono font-bold text-blue-700 w-8 text-center">{sym}</span>
                <span className="text-xs text-slate-600">{meaning}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-400">Key rule: Capture who / what / when / where / amount / action. Write numbers and names first.</p>
        </CardContent>
      </Card>

      {/* Common templates */}
      <Card>
        <CardHeader><CardTitle>Common Scenario Templates</CardTitle></CardHeader>
        <CardContent className="space-y-3 text-sm text-slate-600">
          {[
            {
              scenario: "Appointment booking",
              template: "Your appointment is with [Name] on [date] at [time]. Please bring [documents].",
              ml: "നിങ്ങളുടെ അപ്പോയിന്റ്മെന്റ് [Name] ഉമായി [date]ന് [time]ന് ആണ്. [documents] കൊണ്ടുവരൂ.",
            },
            {
              scenario: "Eligibility criteria",
              template: "You must meet [criteria] to be eligible for [benefit/visa].",
              ml: "[benefit/visa] ന് അർഹതയ്ക്ക് [criteria] പൂർത്തിയാക്കണം.",
            },
            {
              scenario: "Complaint/refund",
              template: "You have the right to [action] under [law/policy].",
              ml: "[law/policy] പ്രകാരം [action] ന് നിങ്ങൾക്ക് അവകാശം ഉണ്ട്.",
            },
            {
              scenario: "Payment/fine",
              template: "A [penalty/payment] of $[amount] applies if you [condition].",
              ml: "[condition] ആണെങ്കിൽ $[amount] [penalty/payment] ബാധകമാകും.",
            },
          ].map(({ scenario, template, ml }) => (
            <div key={scenario} className="border border-slate-100 rounded p-3">
              <p className="text-xs font-semibold text-slate-500 uppercase mb-1">{scenario}</p>
              <p className="text-slate-700">{template}</p>
              <p className="text-blue-700 mt-1 text-sm">{ml}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Time-saving tips */}
      <Card>
        <CardHeader><CardTitle>Time-Saving Tips</CardTitle></CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-slate-600 list-disc list-inside">
            <li>Use compact note symbols — never write full words if a symbol works.</li>
            <li>Prioritise who / what / when / where / amount / action in your notes.</li>
            <li>Chunk long sentences into meaning units, not individual words.</li>
            <li>Do not translate word-for-word when it harms meaning.</li>
            <li>Do not add explanations — NAATI penalises additions.</li>
            <li>Use standard Malayalam equivalents for official terms (do not paraphrase).</li>
            <li>Keep common templates ready for appointment, complaint, eligibility, payment, and consent scenarios.</li>
            <li>If you lose track mid-segment, say what you captured confidently rather than trailing off.</li>
          </ul>
        </CardContent>
      </Card>

      {/* Delivery tips */}
      <Card>
        <CardHeader><CardTitle>Delivery & Register Tips</CardTitle></CardHeader>
        <CardContent className="space-y-3 text-sm text-slate-600">
          <div className="space-y-2">
            <p><strong>Register:</strong> Match the formality of the source. Legal/government = formal. Medical = semi-formal. Community = semi-formal to informal.</p>
            <p><strong>Self-correction:</strong> Only correct once, briefly. Say: &ldquo;Sorry, I&rsquo;ll say that again&rdquo; then continue. Do not repeat the whole segment.</p>
            <p><strong>Pace:</strong> Speak at a steady, clear pace. Rushing causes mispronunciation; too slow causes hesitation penalties.</p>
            <p><strong>First-person:</strong> Interpret in direct first-person where natural. &ldquo;I would like to&hellip;&rdquo; not &ldquo;He/she said that he/she would like to&hellip;&rdquo;</p>
            <p><strong>Silence:</strong> 5-second start is critical. Begin speaking immediately after the chime — even a partial sentence is better than silence.</p>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3 flex-wrap">
        <Link href="/practice" className="px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700">
          Start Practice Mode
        </Link>
        <Link href="/official-resources" className="px-5 py-2.5 bg-slate-100 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-200">
          Official NAATI Resources
        </Link>
      </div>
    </div>
  );
}
