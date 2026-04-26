export type Language = "English" | "Malayalam";
export type Register = "formal" | "semi-formal" | "informal";
export type Difficulty = "easy" | "medium" | "hard";
export type UploadStatus = "pending" | "uploading" | "uploaded" | "failed";
export type TranscriptionStatus =
  | "pending"
  | "transcribing"
  | "complete"
  | "failed"
  | "manual";
export type AttemptMode = "exam" | "practice";
export type AttemptStatus = "in_progress" | "complete" | "abandoned";

export type DeductionCategory =
  | "accuracy"
  | "completeness"
  | "language_quality"
  | "register"
  | "delivery"
  | "repeat_policy";

export type DeductionSeverity = "minor" | "moderate" | "major" | "critical";

export interface Deduction {
  category: DeductionCategory;
  severity: DeductionSeverity;
  points: number;
  explanation: string;
}

export interface SegmentScoreResult {
  segmentId: string;
  sourceLanguage: Language;
  targetLanguage: Language;
  transcript: string;
  expectedMeaning: string;
  estimatedScore: number;
  maxScore: number;
  deductions: Deduction[];
  missedKeyFacts: string[];
  incorrectFacts: string[];
  unnecessaryAdditions: string[];
  betterAnswer: string;
  examinerStyleFeedback: string;
  practiceDrill: string;
}

export interface DialogueScoreResult {
  dialogueId: string;
  estimatedScore: number;
  maxScore: number;
  strongestSegments: string[];
  weakestSegments: string[];
  errorSummary: string;
  passRisk: boolean;
}

export interface TestScoreResult {
  attemptId: string;
  totalScore: number;
  dialogue1Score: number;
  dialogue2Score: number;
  passed: boolean;
  passThreshold: number;
  perDialogueThreshold: number;
  targetGap: number;
  top5Actions: string[];
  vocabularyGaps: string[];
  deliveryGaps: string[];
  recommendation: "exam_ready" | "borderline" | "needs_more_practice";
}

export interface TranscriptionResult {
  text: string;
  confidence?: number;
  words?: Array<{ word: string; start?: number; end?: number }>;
  duration?: number;
}

export interface ScoringInput {
  segmentId: string;
  transcript: string;
  expectedInterpretation: string;
  sourceText: string;
  sourceLanguage: Language;
  targetLanguage: Language;
  keywords: string[];
  register: Register;
  difficulty: Difficulty;
  scoringNotes: string;
  responseStartedWithinFiveSeconds: boolean;
  repeatedSegmentUsed: boolean;
  repeatsAlreadyUsed: number;
  durationMs: number;
}

export interface RecordingMetadata {
  mockTestId: string;
  dialogueId: string;
  segmentId: string;
  attemptId: string;
  sourceLanguage: Language;
  targetLanguage: Language;
  startedAt: string;
  endedAt: string;
  durationMs: number;
  repeatedSegmentUsed: boolean;
  responseStartedWithinFiveSeconds: boolean;
}
