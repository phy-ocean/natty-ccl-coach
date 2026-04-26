import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { StudyDayToggle } from "./StudyDayToggle";

const studyDays = [
  {
    day: 1,
    title: "Understand the Format & Baseline",
    focus: "orientation",
    tasks: [
      "Read the official NAATI CCL candidate instructions.",
      "Watch the format overview: 2 dialogues, 8–12 segments each, 35 words max per segment.",
      "Take Mock Test 1 (Health) without preparation — note your score and weaknesses.",
      "Identify your weak language direction: English→Malayalam or Malayalam→English.",
      "Read the NAATI scoring guide on this app.",
    ],
    tips: [
      "Do not study the answers before taking Mock Test 1.",
      "Record yourself and listen back — is your Malayalam natural or word-for-word?",
      "Note every number, name, and term you missed.",
    ],
  },
  {
    day: 2,
    title: "Note-Taking, Memory & Numbers",
    focus: "technique",
    tasks: [
      "Learn 5–8 compact note-taking symbols (↑ increase, $ money, Dr = doctor, etc.).",
      "Practice the 5-second start drill: play a segment, chime, speak within 5 seconds × 20 times.",
      "Drill numbers drill: listen to segments with numbers/dates, write down all numbers, check accuracy.",
      "Practice memory without notes drill: listen once, then interpret without pausing.",
      "Review Day 1 error bank entries.",
    ],
    tips: [
      "Chunk meaning, not words: who / what / when / where / amount / action.",
      "Start speaking within 5 seconds even if imperfect — silence costs marks.",
      "Write numbers and names first in notes — never skip them.",
    ],
  },
  {
    day: 3,
    title: "Health, Housing & Social Services Vocabulary",
    focus: "vocabulary",
    tasks: [
      "Study 30 health terms from the vocabulary bank (prescription, referral, blood thinners, etc.).",
      "Study 20 housing terms (bond, landlord, tenancy agreement, eviction, etc.).",
      "Study 20 social services terms (Centrelink, Parenting Payment, income test, etc.).",
      "Take Mock Test 2 (Housing) — focus on number accuracy.",
      "Take one dialogue from Mock Test 6 in practice mode — check completeness.",
    ],
    tips: [
      "For each domain, practise the standard phrases: 'Your bond is…', 'You are entitled to…'.",
      "Use the vocabulary bank's example sentences — say them aloud 3 times each.",
      "Do not translate word-for-word when it harms naturalness.",
    ],
  },
  {
    day: 4,
    title: "Legal, Immigration & Consumer Affairs Vocabulary",
    focus: "vocabulary",
    tasks: [
      "Study 25 legal terms (adverse action, statutory declaration, default judgment, bail, etc.).",
      "Study 20 immigration terms (visa subclass, nomination, bridging visa, character requirement, etc.).",
      "Study 15 consumer affairs terms (refund, warranty, consumer rights, etc.).",
      "Take Mock Test 4 (Legal) — focus on legal register accuracy.",
      "Accuracy drill: replay weakest segments from days 1–3, re-record, compare.",
    ],
    tips: [
      "Legal register: never soften 'prohibited', 'illegal', 'penalty' — use exact equivalents.",
      "For visa subclass numbers (186, 482), practise saying them clearly in both languages.",
      "Statutory declaration = 'സ്റ്റാറ്റ്യൂട്ടറി ഡിക്ലറേഷൻ' — borrow the term, do not paraphrase.",
    ],
  },
  {
    day: 5,
    title: "Full Mock Under Timed Conditions",
    focus: "simulation",
    tasks: [
      "Take Mock Test 3 (Employment) in full exam mode — no pausing.",
      "Immediately after: self-review all segments with expected answers.",
      "Write your 5 biggest errors in the error bank.",
      "Delivery drill: re-record your 3 weakest segments, focusing on smooth delivery and register.",
      "Study 15 employment/finance terms you did not know today.",
    ],
    tips: [
      "Treat this like exam day — quiet room, microphone ready, no interruptions.",
      "If you used a repeat: did you need it? Train to reduce repeats.",
      "Register correction: formal contexts need formal Malayalam, not conversational shorthand.",
    ],
  },
  {
    day: 6,
    title: "Two Full Mocks & Error Bank Revision",
    focus: "intensive",
    tasks: [
      "Take Mock Test 5 (Immigration) — full exam mode.",
      "Take Mock Test 6 (Education) — full exam mode.",
      "Analyse both reports: compare dialogue 1 vs dialogue 2 scores.",
      "Revise top 10 error bank items from all sessions.",
      "Revise highest-risk vocabulary: any term with numbers, legal terms, agency names.",
    ],
    tips: [
      "Aim for 42+ in your stronger dialogue and 43+ in your weaker one.",
      "If your Dialogue 2 score is consistently lower, practise that direction more.",
      "Avoid adding explanations — NAATI penalises unnecessary additions.",
    ],
  },
  {
    day: 7,
    title: "Light Revision & Exam Day Preparation",
    focus: "confidence",
    tasks: [
      "Light revision only: review error bank, key vocabulary, and top 5 improvement actions.",
      "Visit the official NAATI practice platform (link in Official Resources).",
      "Run a mic and internet check for exam day conditions.",
      "Confirm your exam time, login, and test environment.",
      "Get adequate sleep.",
    ],
    tips: [
      "No new material today — consolidate what you know.",
      "Confidence routine: say to yourself — 'I start within 5 seconds. I capture numbers. I preserve register.'",
      "On exam day: breathe, listen fully, start confidently.",
    ],
  },
];

export default async function StudyPlanPage() {
  const progress = await prisma.studyProgress.findMany({
    where: { userId: "default-user" },
    orderBy: { day: "asc" },
  });

  const completedMap = Object.fromEntries(progress.map((p) => [p.day, p.completed]));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">7-Day Study Plan</h1>
        <p className="text-slate-500 mt-1">
          Targeting 85/90 — follow this plan for structured preparation in one week.
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-sm text-blue-800">
        <strong>85/90 Strategy:</strong> Aim for 42+ in one dialogue and 43+ in the other. Minimise
        errors on numbers, dates, names, and legal/medical terms. Start every response within 5 seconds.
        Use only one repeat per dialogue.
      </div>

      <div className="space-y-4">
        {studyDays.map((day) => {
          const done = completedMap[day.day] ?? false;
          const focusColors: Record<string, string> = {
            orientation: "bg-purple-100 text-purple-700",
            technique: "bg-blue-100 text-blue-700",
            vocabulary: "bg-green-100 text-green-700",
            simulation: "bg-orange-100 text-orange-700",
            intensive: "bg-red-100 text-red-700",
            confidence: "bg-teal-100 text-teal-700",
          };

          return (
            <Card key={day.day} id={`day-${day.day}`} className={done ? "border-green-300" : ""}>
              <CardHeader>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${done ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"}`}>
                      {done ? "✓" : day.day}
                    </div>
                    <div>
                      <CardTitle className="text-base">Day {day.day}: {day.title}</CardTitle>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${focusColors[day.focus]}`}>
                      {day.focus}
                    </span>
                    <StudyDayToggle day={day.day} completed={done} />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Tasks</p>
                  <ul className="space-y-1 text-sm text-slate-600 list-disc list-inside">
                    {day.tasks.map((t, i) => <li key={i}>{t}</li>)}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Key Tips</p>
                  <ul className="space-y-1 text-sm text-slate-500 list-none">
                    {day.tips.map((t, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="text-blue-400 flex-shrink-0">→</span>
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
