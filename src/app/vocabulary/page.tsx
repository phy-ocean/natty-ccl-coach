import { prisma } from "@/lib/prisma";
import { VocabularyClient } from "./VocabularyClient";

export default async function VocabularyPage() {
  const [terms, total] = await Promise.all([
    prisma.vocabularyTerm.findMany({ orderBy: [{ domain: "asc" }, { english: "asc" }] }),
    prisma.vocabularyTerm.count(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Malayalam–English Vocabulary Bank</h1>
        <p className="text-slate-500 mt-1">{total} terms across health, legal, immigration, employment, housing, finance, insurance, consumer affairs, and social services.</p>
      </div>
      <VocabularyClient terms={JSON.parse(JSON.stringify(terms))} />
    </div>
  );
}
