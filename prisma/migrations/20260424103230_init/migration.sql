-- CreateTable
CREATE TABLE "UserProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL DEFAULT 'Candidate',
    "targetScore" INTEGER NOT NULL DEFAULT 85,
    "examDate" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "MockTest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Dialogue" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "mockTestId" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "totalWords" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Dialogue_mockTestId_fkey" FOREIGN KEY ("mockTestId") REFERENCES "MockTest" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Segment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "dialogueId" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL,
    "sourceLanguage" TEXT NOT NULL,
    "sourceText" TEXT NOT NULL,
    "expectedInterpretation" TEXT NOT NULL,
    "keywords" TEXT NOT NULL DEFAULT '[]',
    "topic" TEXT NOT NULL DEFAULT '',
    "register" TEXT NOT NULL DEFAULT 'semi-formal',
    "difficulty" TEXT NOT NULL DEFAULT 'medium',
    "scoringNotes" TEXT NOT NULL DEFAULT '',
    "wordCount" INTEGER NOT NULL DEFAULT 0,
    "audioFilePath" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Segment_dialogueId_fkey" FOREIGN KEY ("dialogueId") REFERENCES "Dialogue" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TestAttempt" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "mockTestId" TEXT NOT NULL,
    "userId" TEXT,
    "mode" TEXT NOT NULL DEFAULT 'exam',
    "status" TEXT NOT NULL DEFAULT 'in_progress',
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" DATETIME,
    "totalScore" REAL,
    "dialogue1Score" REAL,
    "dialogue2Score" REAL,
    "passed" BOOLEAN,
    "repeatsUsed" TEXT NOT NULL DEFAULT '{}',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TestAttempt_mockTestId_fkey" FOREIGN KEY ("mockTestId") REFERENCES "MockTest" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TestAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserProfile" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Recording" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "attemptId" TEXT NOT NULL,
    "segmentId" TEXT NOT NULL,
    "filePath" TEXT,
    "mimeType" TEXT NOT NULL DEFAULT 'audio/webm',
    "durationMs" INTEGER NOT NULL DEFAULT 0,
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" DATETIME,
    "sourceLanguage" TEXT NOT NULL,
    "targetLanguage" TEXT NOT NULL,
    "repeatedSegmentUsed" BOOLEAN NOT NULL DEFAULT false,
    "responseStartedWithinFiveSeconds" BOOLEAN NOT NULL DEFAULT true,
    "uploadStatus" TEXT NOT NULL DEFAULT 'pending',
    "transcriptionStatus" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Recording_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "TestAttempt" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Recording_segmentId_fkey" FOREIGN KEY ("segmentId") REFERENCES "Segment" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Transcript" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "recordingId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "confidence" REAL,
    "isManual" BOOLEAN NOT NULL DEFAULT false,
    "provider" TEXT NOT NULL DEFAULT 'manual',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Transcript_recordingId_fkey" FOREIGN KEY ("recordingId") REFERENCES "Recording" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SegmentScore" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "recordingId" TEXT NOT NULL,
    "segmentId" TEXT NOT NULL,
    "attemptId" TEXT NOT NULL,
    "estimatedScore" REAL NOT NULL,
    "maxScore" REAL NOT NULL DEFAULT 5,
    "deductions" TEXT NOT NULL DEFAULT '[]',
    "missedKeyFacts" TEXT NOT NULL DEFAULT '[]',
    "incorrectFacts" TEXT NOT NULL DEFAULT '[]',
    "unnecessaryAdditions" TEXT NOT NULL DEFAULT '[]',
    "betterAnswer" TEXT NOT NULL DEFAULT '',
    "examinerStyleFeedback" TEXT NOT NULL DEFAULT '',
    "practiceDrill" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SegmentScore_recordingId_fkey" FOREIGN KEY ("recordingId") REFERENCES "Recording" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SegmentScore_segmentId_fkey" FOREIGN KEY ("segmentId") REFERENCES "Segment" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DialogueScore" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "attemptId" TEXT NOT NULL,
    "dialogueId" TEXT NOT NULL,
    "estimatedScore" REAL NOT NULL,
    "maxScore" REAL NOT NULL DEFAULT 45,
    "strongestSegments" TEXT NOT NULL DEFAULT '[]',
    "weakestSegments" TEXT NOT NULL DEFAULT '[]',
    "errorSummary" TEXT NOT NULL DEFAULT '',
    "passRisk" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DialogueScore_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "TestAttempt" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "DialogueScore_dialogueId_fkey" FOREIGN KEY ("dialogueId") REFERENCES "Dialogue" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "VocabularyTerm" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "english" TEXT NOT NULL,
    "malayalam" TEXT NOT NULL,
    "romanisation" TEXT NOT NULL DEFAULT '',
    "domain" TEXT NOT NULL,
    "simpleExplanation" TEXT NOT NULL DEFAULT '',
    "exampleSentenceEn" TEXT NOT NULL DEFAULT '',
    "exampleSentenceMl" TEXT NOT NULL DEFAULT '',
    "commonMistake" TEXT NOT NULL DEFAULT '',
    "difficulty" TEXT NOT NULL DEFAULT 'medium',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "ErrorBankItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 1,
    "examples" TEXT NOT NULL DEFAULT '[]',
    "lastSeenAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ErrorBankItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserProfile" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "StudyProgress" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "day" INTEGER NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT NOT NULL DEFAULT '',
    "completedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "StudyProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserProfile" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Transcript_recordingId_key" ON "Transcript"("recordingId");
