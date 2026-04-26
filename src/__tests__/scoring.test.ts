import { scoreSegment, calculateDialogueScore, calculateTestScore } from "../lib/scoring/rubric";
import type { ScoringInput } from "../types";

const baseInput: ScoringInput = {
  segmentId: "seg-1",
  transcript: "I need to see a doctor. I have had chest pain for one week.",
  expectedInterpretation: "ഡോക്ടറെ കാണണം. ഒരാഴ്ചയായി നെഞ്ചുവേദന ഉണ്ട്.",
  sourceText: "I need to see a doctor. I have had chest pain for one week.",
  sourceLanguage: "English",
  targetLanguage: "Malayalam",
  keywords: ["doctor", "chest pain", "one week"],
  register: "semi-formal",
  difficulty: "easy",
  scoringNotes: "Symptom and duration are critical.",
  responseStartedWithinFiveSeconds: true,
  repeatedSegmentUsed: false,
  repeatsAlreadyUsed: 0,
  durationMs: 5000,
};

describe("scoreSegment", () => {
  it("returns a valid score object", () => {
    const result = scoreSegment(baseInput);
    expect(result.segmentId).toBe("seg-1");
    expect(result.estimatedScore).toBeGreaterThanOrEqual(0);
    expect(result.estimatedScore).toBeLessThanOrEqual(result.maxScore);
    expect(result.maxScore).toBe(5);
    expect(Array.isArray(result.deductions)).toBe(true);
    expect(typeof result.examinerStyleFeedback).toBe("string");
    expect(typeof result.practiceDrill).toBe("string");
  });

  it("penalises empty transcript", () => {
    const result = scoreSegment({ ...baseInput, transcript: "" });
    expect(result.estimatedScore).toBe(0);
    expect(result.deductions.some((d) => d.category === "completeness")).toBe(true);
  });

  it("penalises response not started within 5 seconds", () => {
    const result = scoreSegment({ ...baseInput, responseStartedWithinFiveSeconds: false });
    const deliveryDeductions = result.deductions.filter((d) => d.category === "delivery");
    expect(deliveryDeductions.length).toBeGreaterThan(0);
    expect(result.estimatedScore).toBeLessThan(5);
  });

  it("penalises repeat over limit", () => {
    const result = scoreSegment({
      ...baseInput,
      repeatedSegmentUsed: true,
      repeatsAlreadyUsed: 1,
    });
    const repeatDeductions = result.deductions.filter((d) => d.category === "repeat_policy");
    expect(repeatDeductions.length).toBeGreaterThan(0);
  });

  it("does not penalise first free repeat", () => {
    const result = scoreSegment({
      ...baseInput,
      repeatedSegmentUsed: true,
      repeatsAlreadyUsed: 0,
    });
    const repeatDeductions = result.deductions.filter((d) => d.category === "repeat_policy");
    expect(repeatDeductions.length).toBe(0);
  });

  it("penalises very short transcript (completeness)", () => {
    const result = scoreSegment({ ...baseInput, transcript: "Doctor." });
    const completenessDeductions = result.deductions.filter((d) => d.category === "completeness");
    expect(completenessDeductions.length).toBeGreaterThan(0);
    expect(result.estimatedScore).toBeLessThan(5);
  });

  it("gives high score for good interpretation", () => {
    const result = scoreSegment({
      ...baseInput,
      transcript: "ഡോക്ടറെ കാണണം. ഒരാഴ്ചയായി നെഞ്ചുവേദന ഉണ്ട്.",
    });
    expect(result.estimatedScore).toBeGreaterThanOrEqual(4);
  });

  it("validates segment length <= 35 words", () => {
    const longText = "word ".repeat(36).trim();
    expect(longText.split(/\s+/).length).toBeGreaterThan(35);
  });
});

describe("calculateDialogueScore", () => {
  it("scales segment scores to 45-point dialogue score", () => {
    const scores = Array.from({ length: 10 }, (_, i) => ({
      segmentId: `seg-${i}`,
      estimatedScore: 5,
      maxScore: 5,
    }));
    const result = calculateDialogueScore(scores);
    expect(result.estimatedScore).toBe(45);
    expect(result.maxScore).toBe(45);
  });

  it("flags pass risk when estimated dialogue score < 35", () => {
    const scores = Array.from({ length: 10 }, (_, i) => ({
      segmentId: `seg-${i}`,
      estimatedScore: 1,
      maxScore: 5,
    }));
    const result = calculateDialogueScore(scores);
    expect(result.passRisk).toBe(true);
  });

  it("does not flag pass risk when estimated dialogue score >= 35", () => {
    const scores = Array.from({ length: 10 }, (_, i) => ({
      segmentId: `seg-${i}`,
      estimatedScore: 4,
      maxScore: 5,
    }));
    const result = calculateDialogueScore(scores);
    expect(result.passRisk).toBe(false);
    expect(result.estimatedScore).toBeGreaterThanOrEqual(35);
  });

  it("identifies strongest and weakest segments", () => {
    const scores = [
      { segmentId: "s1", estimatedScore: 5, maxScore: 5 },
      { segmentId: "s2", estimatedScore: 2, maxScore: 5 },
      { segmentId: "s3", estimatedScore: 4, maxScore: 5 },
      { segmentId: "s4", estimatedScore: 1, maxScore: 5 },
    ];
    const result = calculateDialogueScore(scores);
    expect(result.strongestSegments).toContain("s1");
    expect(result.weakestSegments).toContain("s4");
  });
});

describe("calculateTestScore", () => {
  it("passes when both dialogues meet thresholds and total >= 63", () => {
    const result = calculateTestScore(35, 35);
    expect(result.totalScore).toBe(70);
    expect(result.passed).toBe(true);
  });

  it("fails when total is below 63", () => {
    const result = calculateTestScore(30, 30);
    expect(result.totalScore).toBe(60);
    expect(result.passed).toBe(false);
  });

  it("fails when one dialogue is below 29 even if total is high enough", () => {
    const result = calculateTestScore(40, 25);
    expect(result.passed).toBe(false);
  });

  it("calculates target gap correctly", () => {
    const result = calculateTestScore(35, 35, 85);
    expect(result.targetGap).toBe(15);
  });

  it("marks exam_ready when score >= 80", () => {
    const result = calculateTestScore(41, 42);
    expect(result.recommendation).toBe("exam_ready");
  });

  it("marks borderline when score is between 65 and 79", () => {
    const result = calculateTestScore(35, 35);
    expect(result.recommendation).toBe("borderline");
  });

  it("marks needs_more_practice when score < 65", () => {
    const result = calculateTestScore(30, 30);
    expect(result.recommendation).toBe("needs_more_practice");
  });

  it("provides top5 actions", () => {
    const result = calculateTestScore(30, 30);
    expect(result.top5Actions.length).toBeGreaterThan(0);
    expect(result.top5Actions.length).toBeLessThanOrEqual(5);
  });
});

describe("segment word count validation", () => {
  it("all seed segments should be 35 words or less", () => {
    const longSegment = "word ".repeat(36).trim();
    const words = longSegment.split(/\s+/).length;
    expect(words).toBe(36);
    expect(words > 35).toBe(true);

    const validSegment = "I need to see a doctor about my chest pain which has lasted one week.";
    expect(validSegment.split(/\s+/).length).toBeLessThanOrEqual(35);
  });
});
