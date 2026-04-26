import type {
  ScoringInput,
  SegmentScoreResult,
  Deduction,
  DeductionSeverity,
} from "@/types";

const SEGMENT_MAX_SCORE = 5;

function detectDeductions(input: ScoringInput): Deduction[] {
  const deductions: Deduction[] = [];
  const transcript = input.transcript.toLowerCase().trim();
  const expected = input.expectedInterpretation.toLowerCase().trim();
  const source = input.sourceText.toLowerCase();

  if (!transcript || transcript.length < 3) {
    deductions.push({
      category: "completeness",
      severity: "critical",
      points: 5,
      explanation: "No meaningful interpretation provided.",
    });
    return deductions;
  }

  const transcriptWords = transcript.split(/\s+/).length;
  const expectedWords = expected.split(/\s+/).length;

  const lengthRatio = transcriptWords / Math.max(expectedWords, 1);
  if (lengthRatio < 0.4) {
    deductions.push({
      category: "completeness",
      severity: "major",
      points: 2.5,
      explanation:
        "Interpretation is significantly shorter than expected — likely missing key information.",
    });
  } else if (lengthRatio < 0.6) {
    deductions.push({
      category: "completeness",
      severity: "moderate",
      points: 1.5,
      explanation: "Interpretation appears incomplete — some meaning may be missing.",
    });
  }

  if (lengthRatio > 2.5) {
    deductions.push({
      category: "accuracy",
      severity: "moderate",
      points: 1,
      explanation:
        "Interpretation is significantly longer than expected — likely contains unnecessary additions or explanations.",
    });
  }

  const numberPattern = /\b\d[\d,.]*\b/g;
  const sourceNumbers = source.match(numberPattern) ?? [];
  for (const num of sourceNumbers) {
    if (!transcript.includes(num)) {
      deductions.push({
        category: "accuracy",
        severity: "major",
        points: 1,
        explanation: `Number or amount "${num}" from source may be missing or incorrect in interpretation.`,
      });
    }
  }

  const namePattern = /\b[A-Z][a-z]+\b/g;
  const sourceNames = input.sourceText.match(namePattern) ?? [];
  const commonWords = new Set([
    "The", "A", "An", "I", "We", "You", "He", "She", "They",
    "This", "That", "It", "My", "Your", "His", "Her",
    "Please", "Thank", "Sorry", "Hello", "Yes", "No",
  ]);
  const entityNames = sourceNames.filter((n) => !commonWords.has(n));
  for (const name of entityNames) {
    if (
      !transcript.includes(name.toLowerCase()) &&
      !transcript.includes(name)
    ) {
      deductions.push({
        category: "accuracy",
        severity: "major",
        points: 0.75,
        explanation: `Proper noun or entity "${name}" may be missing or mispronounced.`,
      });
    }
  }

  if (!input.responseStartedWithinFiveSeconds) {
    deductions.push({
      category: "delivery",
      severity: "minor",
      points: 0.5,
      explanation: "Response did not start within 5 seconds of the chime.",
    });
  }

  const durationSeconds = input.durationMs / 1000;
  const expectedDurationSeconds = (expectedWords / 130) * 60;
  if (durationSeconds > expectedDurationSeconds * 2.5) {
    deductions.push({
      category: "delivery",
      severity: "minor",
      points: 0.5,
      explanation:
        "Response was significantly longer than expected — may indicate excessive hesitation or repetition.",
    });
  }

  if (input.repeatedSegmentUsed && input.repeatsAlreadyUsed >= 1) {
    deductions.push({
      category: "repeat_policy",
      severity: "moderate",
      points: 1,
      explanation:
        "More than one repeat used in this dialogue. Only one free repeat is allowed per dialogue.",
    });
  }

  const hesitationWords = ["um", "uh", "er", "ah", "hmm", "like", "you know"];
  let hesitationCount = 0;
  for (const h of hesitationWords) {
    const regex = new RegExp(`\\b${h}\\b`, "gi");
    const matches = transcript.match(regex) ?? [];
    hesitationCount += matches.length;
  }
  if (hesitationCount > 3) {
    deductions.push({
      category: "delivery",
      severity: "minor",
      points: 0.25 * Math.min(hesitationCount - 3, 4),
      explanation: `${hesitationCount} filler words detected (um, uh, er, etc.) — work on fluency.`,
    });
  }

  if (input.register === "formal" || input.register === "semi-formal") {
    const informalMarkers = ["gonna", "wanna", "gotta", "kinda", "sorta", "yeah", "nah"];
    for (const marker of informalMarkers) {
      if (transcript.includes(marker)) {
        deductions.push({
          category: "register",
          severity: "minor",
          points: 0.25,
          explanation: `Informal language "${marker}" used in a ${input.register} context.`,
        });
        break;
      }
    }
  }

  return deductions;
}

function generateFeedback(
  input: ScoringInput,
  deductions: Deduction[],
  score: number,
  maxScore: number
): {
  examinerStyleFeedback: string;
  practiceDrill: string;
  betterAnswer: string;
} {
  const percentage = (score / maxScore) * 100;
  const mainIssues = deductions.map((d) => d.explanation).slice(0, 3);

  let examinerFeedback: string;
  if (percentage >= 90) {
    examinerFeedback =
      "Excellent interpretation. Meaning transferred accurately with natural language and appropriate register.";
  } else if (percentage >= 70) {
    examinerFeedback = `Good interpretation overall. ${mainIssues[0] ?? "Minor improvements possible."}`;
  } else if (percentage >= 50) {
    examinerFeedback = `Adequate but with notable gaps. Key issues: ${mainIssues.join("; ")}.`;
  } else {
    examinerFeedback = `Significant meaning loss. Issues: ${mainIssues.join("; ")}. Practise this segment type.`;
  }

  let drill: string;
  const categories = deductions.map((d) => d.category);
  if (categories.includes("accuracy") && input.sourceText.match(/\d/)) {
    drill =
      "Numbers & Entities Drill: Practise segments containing numbers, dates, and names. Record and check accuracy.";
  } else if (categories.includes("completeness")) {
    drill =
      "Memory Drill: Listen once, note who/what/when/where/amount, then interpret without stopping.";
  } else if (categories.includes("delivery")) {
    drill =
      "5-Second Start Drill: Play chime, then start speaking within 5 seconds. Repeat 10 times.";
  } else if (categories.includes("register")) {
    drill =
      "Register Drill: Re-record this segment matching the formal register. Avoid contractions and slang.";
  } else {
    drill =
      "Shadowing Drill: Listen to the source segment, shadow it aloud, then interpret into target language.";
  }

  const betterAnswer = `Aim for a more complete and natural rendering of: "${input.expectedInterpretation.substring(0, 120)}..."`;

  return { examinerStyleFeedback: examinerFeedback, practiceDrill: drill, betterAnswer };
}

function getMissedKeyFacts(input: ScoringInput, transcript: string): string[] {
  const missed: string[] = [];
  const lower = transcript.toLowerCase();
  for (const keyword of input.keywords) {
    const kw = keyword.toLowerCase();
    if (kw.length > 2 && !lower.includes(kw)) {
      missed.push(keyword);
    }
  }
  return missed.slice(0, 5);
}

export function scoreSegment(input: ScoringInput): SegmentScoreResult {
  const deductions = detectDeductions(input);

  const totalDeducted = deductions.reduce((sum, d) => sum + d.points, 0);
  const rawScore = Math.max(0, SEGMENT_MAX_SCORE - totalDeducted);
  const estimatedScore = Math.round(rawScore * 4) / 4;

  const missed = getMissedKeyFacts(input, input.transcript);

  const { examinerStyleFeedback, practiceDrill, betterAnswer } = generateFeedback(
    input,
    deductions,
    estimatedScore,
    SEGMENT_MAX_SCORE
  );

  return {
    segmentId: input.segmentId,
    sourceLanguage: input.sourceLanguage,
    targetLanguage: input.targetLanguage,
    transcript: input.transcript,
    expectedMeaning: input.expectedInterpretation,
    estimatedScore,
    maxScore: SEGMENT_MAX_SCORE,
    deductions,
    missedKeyFacts: missed,
    incorrectFacts: [],
    unnecessaryAdditions: [],
    betterAnswer,
    examinerStyleFeedback,
    practiceDrill,
  };
}

export function calculateDialogueScore(
  segmentScores: Array<{ segmentId: string; estimatedScore: number; maxScore: number }>
): {
  estimatedScore: number;
  maxScore: number;
  strongestSegments: string[];
  weakestSegments: string[];
  errorSummary: string;
  passRisk: boolean;
} {
  const totalMax = 45;
  const segMax = 5;
  const numSegments = segmentScores.length;
  const scaleFactor = totalMax / (numSegments * segMax);

  const totalRaw = segmentScores.reduce((sum, s) => sum + s.estimatedScore, 0);
  const estimatedScore = Math.min(
    totalMax,
    Math.round(totalRaw * scaleFactor * 4) / 4
  );

  const sorted = [...segmentScores].sort((a, b) => b.estimatedScore - a.estimatedScore);
  const strongest = sorted.slice(0, 2).map((s) => s.segmentId);
  const weakest = sorted.slice(-2).map((s) => s.segmentId);

  const avgPercent = (estimatedScore / totalMax) * 100;
  let summary: string;
  if (avgPercent >= 90) summary = "Excellent performance across all segments.";
  else if (avgPercent >= 70) summary = "Good overall with some segments needing refinement.";
  else if (avgPercent >= 55) summary = "Several segments showed significant errors — targeted practice needed.";
  else summary = "Multiple segments with major meaning loss — intensive practice required.";

  return {
    estimatedScore,
    maxScore: totalMax,
    strongestSegments: strongest,
    weakestSegments: weakest,
    errorSummary: summary,
    passRisk: estimatedScore < 35,
  };
}

export function calculateTestScore(
  d1Score: number,
  d2Score: number,
  targetScore = 85
): {
  totalScore: number;
  passed: boolean;
  targetGap: number;
  recommendation: "exam_ready" | "borderline" | "needs_more_practice";
  top5Actions: string[];
} {
  const totalScore = Math.round((d1Score + d2Score) * 4) / 4;
  const passed = totalScore >= 63 && d1Score >= 29 && d2Score >= 29;
  const targetGap = Math.max(0, targetScore - totalScore);

  let recommendation: "exam_ready" | "borderline" | "needs_more_practice";
  if (totalScore >= 80) recommendation = "exam_ready";
  else if (totalScore >= 65) recommendation = "borderline";
  else recommendation = "needs_more_practice";

  const actions: string[] = [];
  if (d1Score < 35) actions.push("Focus intensive practice on Dialogue 1 — you are at pass-risk.");
  if (d2Score < 35) actions.push("Focus intensive practice on Dialogue 2 — you are at pass-risk.");
  if (totalScore < 75) actions.push("Run at least 2 more full mock tests before exam day.");
  actions.push("Review the numbers and entities drill for each weak segment.");
  actions.push("Practise the 5-second start drill daily.");
  actions.push("Revise high-frequency vocabulary for health, legal, and immigration domains.");
  actions.push("Record yourself and self-evaluate delivery, register, and fluency.");

  return {
    totalScore,
    passed,
    targetGap,
    recommendation,
    top5Actions: actions.slice(0, 5),
  };
}
