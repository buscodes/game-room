const START_COUNTS: Record<string, number> = { p: 8, n: 2, b: 2, r: 2, q: 1 };
const PIECE_VALUE: Record<string, number> = { p: 1, n: 3, b: 3, r: 5, q: 9 };

/**
 * Tahtadan alınmış taşları FEN'den hesaplar.
 * `w`: beyazın aldığı siyah taşlar, `b`: siyahın aldığı beyaz taşlar (ör. "bN"), `diff`: beyazın materyal üstünlüğü.
 */
export function capturedPieces(fen: string): { w: string[]; b: string[]; diff: number } {
  const board = fen.split(" ")[0];
  const count = (ch: string) => [...board].filter((c) => c === ch).length;
  const res = { w: [] as string[], b: [] as string[] };
  for (const p of Object.keys(START_COUNTS)) {
    for (let i = count(p); i < START_COUNTS[p]; i++) res.w.push(`b${p.toUpperCase()}`);
    for (let i = count(p.toUpperCase()); i < START_COUNTS[p]; i++) res.b.push(`w${p.toUpperCase()}`);
  }
  const value = (list: string[]) => list.reduce((s, c) => s + PIECE_VALUE[c[1].toLowerCase()], 0);
  return { ...res, diff: value(res.w) - value(res.b) };
}
