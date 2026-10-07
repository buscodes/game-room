export const SUITS = ["S", "H", "D", "C"] as const;
export const RANKS = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"] as const;

export type Suit = (typeof SUITS)[number];
export type Rank = (typeof RANKS)[number];

export interface Card {
  id: string; // ör. "10D", "AS"
  rank: Rank;
  suit: Suit;
}

export function makeCard(rank: Rank, suit: Suit): Card {
  return { id: `${rank}${suit}`, rank, suit };
}

export function fullDeck(): Card[] {
  return SUITS.flatMap((s) => RANKS.map((r) => makeCard(r, s)));
}

export type Rng = () => number;

export function shuffle<T>(arr: T[], rng: Rng = Math.random): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Deterministik testler için küçük bir tohumlu RNG (mulberry32). */
export function seededRng(seed: number): Rng {
  let t = seed >>> 0;
  return () => {
    t = (t + 0x6d2b79f5) >>> 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}
