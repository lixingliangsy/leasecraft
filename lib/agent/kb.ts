import type { KbEntry } from "../support-kit/types";
export type { KbEntry };

export const KB: KbEntry[] = [
  {
    id: "what",
    title: "What LeaseCraft does",
    keywords: ["LeaseCraft", "leasecraft", "what", "product", "about", "Clear lease clauses for any situation - late rent, pets, deposits."],
    body: "Clear lease clauses for any situation - late rent, pets, deposits.. LeaseCraft produces plain-English lease clauses for common situations — late rent, pets, deposits — state-aware and drop-in ready. It is a template, not legal advice.",
    source: "LeaseCraft product definition",
    tags: [],
  },
  {
    id: "features",
    title: "LeaseCraft features",
    keywords: ["features", "feature", "can", "does", "Plain-English clauses", "State-aware framing", "Landlord & tenant sides", "Drop-in ready"],
    body: "LeaseCraft includes: Plain-English clauses; State-aware framing; Landlord & tenant sides; Drop-in ready. It does not add capabilities that are not listed here.",
    source: "LeaseCraft feature list",
    tags: [],
  },
  {
    id: "pricing",
    title: "LeaseCraft pricing",
    keywords: ["price", "pricing", "plan", "cost", "billing", "subscription", "monthly", "yearly"],
    body: "Listed prices for LeaseCraft: $15/month and $150/year. Checkout uses the in-app checkout route. This assistant cannot change a subscription or issue a refund.",
    source: "LeaseCraft pricing fields",
    tags: [],
  },
  {
    id: "howto",
    title: "How to use LeaseCraft",
    keywords: ["how", "start", "use", "tool", "run", "Draft a lease clause"],
    body: "Open LeaseCraft and use Draft a lease clause. The form asks for: Clause; State / region; Written for; Specifics (optional).",
    source: "LeaseCraft tool fields",
    tags: [],
  },
  {
    id: "faq-1",
    title: "What is LeaseCraft?",
    keywords: ["What", "is", "LeaseCraft?"],
    body: "LeaseCraft generates plain-English lease clauses for situations like late rent, pets, and deposits, state-aware and drop-in ready.",
    source: "LeaseCraft FAQ",
    tags: [],
  },
  {
    id: "faq-2",
    title: "Which clauses does it cover?",
    keywords: ["Which", "clauses", "does", "it", "cover?"],
    body: "Common situations such as late rent, pets, and deposits.",
    source: "LeaseCraft FAQ",
    tags: [],
  },
  {
    id: "faq-3",
    title: "Is it legal advice?",
    keywords: ["Is", "it", "legal", "advice?"],
    body: "No. It is a template, not legal advice; review with counsel before use.",
    source: "LeaseCraft FAQ",
    tags: ["compliance"],
  },
  {
    id: "honesty",
    title: "What this assistant will not claim",
    keywords: ["legal", "advice", "guarantee", "demo", "human", "refund", "support"],
    body: "Answers about LeaseCraft are decision support only, not legal, tax, accessibility-certification, or compliance sign-off. This assistant does not invent integrations, SSO, CSV export, or Slack connections unless they are already in the product description. If live AI is unavailable, the product must not pretend a demo result is live. Say you want a human and leave an email if you need a person.",
    source: "LeaseCraft support policy",
    tags: ["compliance"],
  },
];

function normalize(s: string): string {
  return (s || "").toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, " ");
}
function toWords(s: string): string[] {
  return normalize(s).split(/\s+/).map((w) => w.trim()).filter(Boolean);
}
function cjkBigrams(s: string): string[] {
  const grams: string[] = [];
  const han = /[\u4e00-\u9fff]/;
  for (const w of toWords(s)) {
    if (han.test(w) && w.length >= 2) {
      for (let i = 0; i < w.length - 1; i++) grams.push(w.slice(i, i + 2));
    }
  }
  return grams;
}
function scoreEntry(entry: KbEntry, query: string): number {
  const q = normalize(query);
  const qWords = new Set(toWords(q));
  const qGrams = new Set(cjkBigrams(q));
  let s = 0;
  for (const kw of entry.keywords) {
    const k = kw.toLowerCase();
    if (q.includes(k)) s += 3;
  }
  for (const tw of toWords(entry.title)) {
    if (qWords.has(tw)) s += 2;
  }
  const idx = normalize(entry.keywords.join(" ") + " " + entry.title + " " + entry.body.slice(0, 400));
  for (const g of qGrams) if (idx.includes(g)) s += 0.5;
  return s;
}

export interface RetrieveResult {
  entries: KbEntry[];
  topScore: number;
}

export function retrieve(query: string, topK = 4, entries: KbEntry[] = KB): RetrieveResult {
  const scored = entries
    .map((e) => ({ e, s: scoreEntry(e, query) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s)
    .slice(0, topK);
  return { entries: scored.map((x) => x.e), topScore: scored.length ? scored[0].s : 0 };
}

export function isComplianceRelated(entries: KbEntry[]): boolean {
  return entries.some((e) => e.tags.includes("compliance"));
}
