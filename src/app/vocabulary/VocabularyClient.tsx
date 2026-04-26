"use client";
import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

type Term = {
  id: string;
  english: string;
  malayalam: string;
  romanisation: string;
  domain: string;
  simpleExplanation: string;
  exampleSentenceEn: string;
  exampleSentenceMl: string;
  commonMistake: string;
  difficulty: string;
};

const domains = ["all", "health", "legal", "immigration", "employment", "housing", "finance", "insurance", "consumer", "social_services", "general"];
const domainLabels: Record<string, string> = {
  all: "All", health: "Health", legal: "Legal", immigration: "Immigration",
  employment: "Employment", housing: "Housing", finance: "Finance",
  insurance: "Insurance", consumer: "Consumer", social_services: "Social Services", general: "General",
};
const difficultyVariant: Record<string, "success" | "warning" | "danger"> = {
  easy: "success", medium: "warning", hard: "danger",
};

export function VocabularyClient({ terms }: { terms: Term[] }) {
  const [query, setQuery] = useState("");
  const [domain, setDomain] = useState("all");
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return terms.filter((t) => {
      const matchDomain = domain === "all" || t.domain === domain;
      const matchQ = !q || t.english.toLowerCase().includes(q) || t.malayalam.toLowerCase().includes(q) || t.romanisation.toLowerCase().includes(q);
      return matchDomain && matchQ;
    });
  }, [terms, query, domain]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="search"
          placeholder="Search English or Malayalam…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 border border-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <select
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          {domains.map((d) => <option key={d} value={d}>{domainLabels[d]}</option>)}
        </select>
      </div>

      <p className="text-sm text-slate-400">{filtered.length} terms</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filtered.map((term) => (
          <Card
            key={term.id}
            className="cursor-pointer hover:border-blue-300 transition-colors"
            onClick={() => setExpanded(expanded === term.id ? null : term.id)}
          >
            <CardContent className="pt-4">
              <div className="flex items-start justify-between gap-2 mb-1">
                <div>
                  <p className="font-semibold text-slate-800">{term.english}</p>
                  <p className="text-blue-700 font-medium text-sm mt-0.5">{term.malayalam}</p>
                  {term.romanisation && (
                    <p className="text-slate-400 text-xs italic">{term.romanisation}</p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge variant="outline" className="text-xs">{domainLabels[term.domain] ?? term.domain}</Badge>
                  <Badge variant={difficultyVariant[term.difficulty] ?? "default"}>{term.difficulty}</Badge>
                </div>
              </div>

              {expanded === term.id && (
                <div className="mt-3 space-y-2 border-t border-slate-100 pt-3">
                  {term.simpleExplanation && (
                    <p className="text-sm text-slate-600">{term.simpleExplanation}</p>
                  )}
                  {term.exampleSentenceEn && (
                    <div>
                      <p className="text-xs text-slate-400">Example (EN):</p>
                      <p className="text-sm text-slate-600 italic">&ldquo;{term.exampleSentenceEn}&rdquo;</p>
                    </div>
                  )}
                  {term.exampleSentenceMl && (
                    <div>
                      <p className="text-xs text-slate-400">Example (ML):</p>
                      <p className="text-sm text-slate-700">{term.exampleSentenceMl}</p>
                    </div>
                  )}
                  {term.commonMistake && (
                    <div className="bg-amber-50 border border-amber-100 rounded p-2">
                      <p className="text-xs text-amber-600 font-medium">Common mistake:</p>
                      <p className="text-xs text-amber-700">{term.commonMistake}</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-slate-400 py-8">No terms match your search.</p>
      )}
    </div>
  );
}
