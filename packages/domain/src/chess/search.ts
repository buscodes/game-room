import { Chess, type Move, type PieceSymbol, type Color } from "chess.js";

/**
 * Küçük bir alfa-beta arama motoru. Amacı güçlü oynamak değil: kolay seviyede aday
 * hamleleri puanlamak ve Stockfish kullanılamazsa yedek olarak devreye girmek.
 */

const PIECE_VALUE: Record<PieceSymbol, number> = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 0 };

// Piece-square tabloları beyaz bakış açısından, a8..h1 sırasıyla (chess.js board() sırası).
const PST: Record<PieceSymbol, number[]> = {
  p: [
    0, 0, 0, 0, 0, 0, 0, 0, 50, 50, 50, 50, 50, 50, 50, 50, 10, 10, 20, 30, 30, 20, 10, 10, 5, 5, 10, 25, 25, 10, 5, 5,
    0, 0, 0, 20, 20, 0, 0, 0, 5, -5, -10, 0, 0, -10, -5, 5, 5, 10, 10, -20, -20, 10, 10, 5, 0, 0, 0, 0, 0, 0, 0, 0,
  ],
  n: [
    -50, -40, -30, -30, -30, -30, -40, -50, -40, -20, 0, 0, 0, 0, -20, -40, -30, 0, 10, 15, 15, 10, 0, -30, -30, 5, 15,
    20, 20, 15, 5, -30, -30, 0, 15, 20, 20, 15, 0, -30, -30, 5, 10, 15, 15, 10, 5, -30, -40, -20, 0, 5, 5, 0, -20, -40,
    -50, -40, -30, -30, -30, -30, -40, -50,
  ],
  b: [
    -20, -10, -10, -10, -10, -10, -10, -20, -10, 0, 0, 0, 0, 0, 0, -10, -10, 0, 5, 10, 10, 5, 0, -10, -10, 5, 5, 10, 10,
    5, 5, -10, -10, 0, 10, 10, 10, 10, 0, -10, -10, 10, 10, 10, 10, 10, 10, -10, -10, 5, 0, 0, 0, 0, 5, -10, -20, -10,
    -10, -10, -10, -10, -10, -20,
  ],
  r: [
    0, 0, 0, 0, 0, 0, 0, 0, 5, 10, 10, 10, 10, 10, 10, 5, -5, 0, 0, 0, 0, 0, 0, -5, -5, 0, 0, 0, 0, 0, 0, -5, -5, 0, 0,
    0, 0, 0, 0, -5, -5, 0, 0, 0, 0, 0, 0, -5, -5, 0, 0, 0, 0, 0, 0, -5, 0, 0, 0, 5, 5, 0, 0, 0,
  ],
  q: [
    -20, -10, -10, -5, -5, -10, -10, -20, -10, 0, 0, 0, 0, 0, 0, -10, -10, 0, 5, 5, 5, 5, 0, -10, -5, 0, 5, 5, 5, 5, 0,
    -5, 0, 0, 5, 5, 5, 5, 0, -5, -10, 5, 5, 5, 5, 5, 0, -10, -10, 0, 5, 0, 0, 0, 0, -10, -20, -10, -10, -5, -5, -10,
    -10, -20,
  ],
  k: [
    -30, -40, -40, -50, -50, -40, -40, -30, -30, -40, -40, -50, -50, -40, -40, -30, -30, -40, -40, -50, -50, -40, -40,
    -30, -30, -40, -40, -50, -50, -40, -40, -30, -20, -30, -30, -40, -40, -30, -30, -20, -10, -20, -20, -20, -20, -20,
    -20, -10, 20, 20, 0, 0, 0, 0, 20, 20, 20, 30, 10, 0, 0, 10, 30, 20,
  ],
};

export const MATE = 100_000;

/** Beyaz bakış açısından statik değerlendirme (santipiyon). */
export function evaluate(chess: Chess): number {
  let score = 0;
  const board = chess.board();
  for (let r = 0; r < 8; r++) {
    for (let f = 0; f < 8; f++) {
      const sq = board[r][f];
      if (!sq) continue;
      const idx = sq.color === "w" ? r * 8 + f : (7 - r) * 8 + f;
      const v = PIECE_VALUE[sq.type] + PST[sq.type][idx];
      score += sq.color === "w" ? v : -v;
    }
  }
  return score;
}

function orderScore(m: Move): number {
  let s = 0;
  if (m.captured) s += 10 * PIECE_VALUE[m.captured] - PIECE_VALUE[m.piece];
  if (m.promotion) s += PIECE_VALUE[m.promotion];
  if (m.san.includes("+")) s += 50;
  return s;
}

function orderedMoves(chess: Chess, capturesOnly = false): Move[] {
  const moves = chess.moves({ verbose: true });
  const list = capturesOnly ? moves.filter((m) => m.captured || m.promotion) : moves;
  return list.sort((a, b) => orderScore(b) - orderScore(a));
}

const sign = (c: Color) => (c === "w" ? 1 : -1);

function quiesce(chess: Chess, alpha: number, beta: number, qDepth: number): number {
  const stand = sign(chess.turn()) * evaluate(chess);
  if (qDepth === 0 || stand >= beta) return stand;
  if (stand > alpha) alpha = stand;
  for (const m of orderedMoves(chess, true)) {
    chess.move(m);
    const score = -quiesce(chess, -beta, -alpha, qDepth - 1);
    chess.undo();
    if (score >= beta) return score;
    if (score > alpha) alpha = score;
  }
  return alpha;
}

function negamax(chess: Chess, depth: number, alpha: number, beta: number, ply: number, qDepth: number): number {
  const moves = orderedMoves(chess);
  if (moves.length === 0) return chess.isCheck() ? -MATE + ply : 0;
  if (chess.isDraw()) return 0;
  if (depth === 0) return qDepth > 0 ? quiesce(chess, alpha, beta, qDepth) : sign(chess.turn()) * evaluate(chess);
  let best = -Infinity;
  for (const m of moves) {
    chess.move(m);
    const score = -negamax(chess, depth - 1, -beta, -alpha, ply + 1, qDepth);
    chess.undo();
    if (score > best) best = score;
    if (score > alpha) alpha = score;
    if (alpha >= beta) break;
  }
  return best;
}

export interface ScoredMove {
  move: Move;
  /** Hamleyi yapan taraf açısından santipiyon (mat = ±100000'e yakın). */
  score: number;
}

/**
 * Tüm kök hamleleri tam pencereyle puanlar (adaylar arası karşılaştırma için
 * kesin değerler gerekir), en iyiden kötüye sıralı döner.
 */
export function scoreMoves(fen: string, depth: number, qDepth = 0): ScoredMove[] {
  const chess = new Chess(fen);
  const result: ScoredMove[] = [];
  for (const m of orderedMoves(chess)) {
    chess.move(m);
    const score = -negamax(chess, depth - 1, -Infinity, Infinity, 1, qDepth);
    chess.undo();
    result.push({ move: m, score });
  }
  return result.sort((a, b) => b.score - a.score);
}

export function isMateScore(score: number): boolean {
  return Math.abs(score) > MATE - 1000;
}
