import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { mockTests } from "./seedData/mockTests";
import { vocabularyTerms } from "./seedData/vocabulary";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create default user
  await prisma.userProfile.upsert({
    where: { id: "default-user" },
    update: {},
    create: {
      id: "default-user",
      name: "Candidate",
      targetScore: 85,
    },
  });

  // Seed mock tests
  for (const test of mockTests) {
    const existing = await prisma.mockTest.findFirst({
      where: { title: test.title },
    });
    if (existing) {
      console.log(`  ↳ Skipping existing: ${test.title}`);
      continue;
    }

    const mockTest = await prisma.mockTest.create({
      data: {
        title: test.title,
        description: test.description,
        orderIndex: test.orderIndex,
      },
    });

    for (const dialogue of test.dialogues) {
      const d = await prisma.dialogue.create({
        data: {
          mockTestId: mockTest.id,
          orderIndex: dialogue.orderIndex,
          title: dialogue.title,
          topic: dialogue.topic,
          totalWords: dialogue.totalWords,
        },
      });

      for (const seg of dialogue.segments) {
        await prisma.segment.create({
          data: {
            dialogueId: d.id,
            orderIndex: seg.orderIndex,
            sourceLanguage: seg.sourceLanguage,
            sourceText: seg.sourceText,
            expectedInterpretation: seg.expectedInterpretation,
            keywords: JSON.stringify(seg.keywords),
            topic: seg.topic,
            register: seg.register,
            difficulty: seg.difficulty,
            scoringNotes: seg.scoringNotes,
            wordCount: seg.sourceText.split(/\s+/).length,
          },
        });
      }
    }
    console.log(`  ✓ Created: ${test.title}`);
  }

  // Seed vocabulary
  const vocabCount = await prisma.vocabularyTerm.count();
  if (vocabCount === 0) {
    for (const term of vocabularyTerms) {
      await prisma.vocabularyTerm.create({ data: term });
    }
    console.log(`  ✓ Created ${vocabularyTerms.length} vocabulary terms`);
  }

  // Seed study progress days for default user
  for (let day = 1; day <= 7; day++) {
    await prisma.studyProgress.upsert({
      where: { id: `default-user-day-${day}` },
      update: {},
      create: {
        id: `default-user-day-${day}`,
        userId: "default-user",
        day,
        completed: false,
      },
    });
  }

  console.log("✅ Seeding complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
