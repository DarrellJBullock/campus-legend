/**
 * Fictional newspaper-style headline & body templates. The news engine fills
 * {name}, {opp}, {yards}, {school} tokens and picks by tone. All outlets are
 * invented (The Campus Sentinel, Gridiron Weekly, etc.).
 */

export type NewsTone = "positive" | "neutral" | "negative";

export interface NewsTemplate {
  id: string;
  tone: NewsTone;
  outlet: string;
  headline: string;
  body: string;
}

export const NEWS_OUTLETS = [
  "The Campus Sentinel",
  "Gridiron Weekly",
  "The Daily Snap",
  "Sideline Report",
  "The End Zone Times",
];

export const GAME_NEWS: Record<NewsTone, NewsTemplate[]> = {
  positive: [
    {
      id: "n-pos-1",
      tone: "positive",
      outlet: "Gridiron Weekly",
      headline: "{name} Shines as {school} Downs {opp}",
      body: "{name} turned in a standout performance to lead {school} past {opp}, drawing praise from coaches and scouts alike.",
    },
    {
      id: "n-pos-2",
      tone: "positive",
      outlet: "The Daily Snap",
      headline: "Star Turn: {name} Powers Victory Over {opp}",
      body: "In front of a raucous home crowd, {name} delivered a signature moment that has the whole conference talking.",
    },
    {
      id: "n-pos-3",
      tone: "positive",
      outlet: "Sideline Report",
      headline: "{name} Rising Up Draft Boards After {opp} Win",
      body: "Draft analysts took notice as {name} continued a breakout stretch in a convincing win over {opp}.",
    },
  ],
  neutral: [
    {
      id: "n-neu-1",
      tone: "neutral",
      outlet: "The Campus Sentinel",
      headline: "{school} Splits the Difference Against {opp}",
      body: "It was a workmanlike outing for {name} and {school} in a game that offered flashes of promise and room to grow.",
    },
    {
      id: "n-neu-2",
      tone: "neutral",
      outlet: "The End Zone Times",
      headline: "Steady Effort From {name} vs. {opp}",
      body: "{name} did the little things right, though the box score won't tell the whole story of a grinding matchup.",
    },
  ],
  negative: [
    {
      id: "n-neg-1",
      tone: "negative",
      outlet: "Sideline Report",
      headline: "Tough Day for {name} as {opp} Prevails",
      body: "It wasn't the outing {name} wanted. {school} will look to regroup after a difficult loss to {opp}.",
    },
    {
      id: "n-neg-2",
      tone: "negative",
      outlet: "Gridiron Weekly",
      headline: "Questions Mount After {school} Falls to {opp}",
      body: "A quiet stat line for {name} added to a frustrating afternoon, and the pressure is building heading into next week.",
    },
  ],
};

export const MILESTONE_NEWS: NewsTemplate[] = [
  {
    id: "n-mile-captain",
    tone: "positive",
    outlet: "The Campus Sentinel",
    headline: "{name} Named Team Captain",
    body: "Teammates and coaches recognized {name}'s leadership by voting them a captain for the season.",
  },
  {
    id: "n-mile-award",
    tone: "positive",
    outlet: "The End Zone Times",
    headline: "Honors Roll In for {name}",
    body: "{name} added to a growing trophy case with a well-earned season honor.",
  },
  {
    id: "n-mile-injury",
    tone: "negative",
    outlet: "The Daily Snap",
    headline: "Injury Concern Surrounds {name}",
    body: "{school} is monitoring the status of {name} after an injury raised concern about the coming weeks.",
  },
  {
    id: "n-mile-deal",
    tone: "neutral",
    outlet: "Gridiron Weekly",
    headline: "{name} Signs New Endorsement Deal",
    body: "Off the field, {name} is building a brand, inking a fresh partnership that reflects a rising profile.",
  },
];

function fill(t: string, tokens: Record<string, string | number>): string {
  return t.replace(/\{(\w+)\}/g, (_, k: string) => String(tokens[k] ?? ""));
}

export function renderNews(
  tpl: NewsTemplate,
  tokens: Record<string, string | number>,
): { headline: string; body: string; outlet: string } {
  return {
    outlet: tpl.outlet,
    headline: fill(tpl.headline, tokens),
    body: fill(tpl.body, tokens),
  };
}
