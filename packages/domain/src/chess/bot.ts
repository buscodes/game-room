import { Chess, type Move } from "chess.js";
import { shuffle } from "../common/cards";
import type { Difficulty } from "../common/difficulty";
import { choose } from "../ai/choose";
import type { BotDecision, BotOption, Reason } from "../ai/decision";
import type { ChessEngine } from "./ports";
import { isMateScore, MATE, scoreMoves } from "./search";

interface Candidate {
  move: Move;
  /** Hamleyi yapan (bot) açısından santipiyon. */
  score: number;
}

/**
 * Seviyeler:
 *  - Kolay: 6 rastgele yasal hamle (kötüler dahil), sığ değerlendirme, olasılığa göre rastgele seçim
 *  - Orta:  motor derinlik 6, en iyi 6 aday arasından en iyisi
 *  - Zor:   motor derinlik 14, en iyi aday
 */
const LEVELS: Record<
  Difficulty,
  { count: number; depth: number; temperature: number; mode: "sample" | "best"; showEval: boolean }
> = {
  easy: { count: 6, depth: 0, temperature: 150, mode: "sample", showEval: false },
  medium: { count: 6, depth: 6, temperature: 60, mode: "best", showEval: false },
  hard: { count: 5, depth: 14, temperature: 30, mode: "best", showEval: true },
};

function toMove(fen: string, uci: string): Move | null {
  try {
    return new Chess(fen).move({ from: uci.slice(0, 2), to: uci.slice(2, 4), promotion: uci[4] });
  } catch {
    return null;
  }
}

async function candidates(fen: string, difficulty: Difficulty, engine: ChessEngine): Promise<Candidate[]> {
  const { count, depth } = LEVELS[difficulty];
  if (difficulty === "easy") return shuffle(scoreMoves(fen, 1, 2)).slice(0, count);
  try {
    const lines = await engine.analyse(fen, { depth, multiPv: count, timeoutMs: 4000 });
    const result: Candidate[] = [];
    for (const l of lines) {
      const move = toMove(fen, l.uci);
      if (move) result.push({ move, score: l.score });
    }
    if (result.length) return result;
  } catch (e) {
    console.warn("[chess] motor kullanılamadı, yerel aramaya düşülüyor:", e);
  }
  return scoreMoves(fen, 2, 2).slice(0, count);
}

function evaluation(score: number): Reason {
  if (isMateScore(score)) {
    const n = Math.ceil((MATE - Math.abs(score)) / 2);
    return { code: score > 0 ? "mateIn" : "matedIn", params: { n } };
  }
  return { code: "evaluation", params: { v: `${score >= 0 ? "+" : ""}${(score / 100).toFixed(2)}` } };
}

function reasons(fen: string, c: Candidate, showEval: boolean): Reason[] {
  const m = c.move;
  const out: Reason[] = [];
  if (m.isKingsideCastle()) out.push({ code: "castleKing" });
  else if (m.isQueensideCastle()) out.push({ code: "castleQueen" });
  if (m.captured) out.push({ code: "captures", params: { piece: m.captured } });
  if (m.promotion) out.push({ code: "promotes", params: { piece: m.promotion } });
  const after = new Chess(fen);
  after.move(m.san);
  if (after.isCheckmate()) out.push({ code: "checkmate" });
  else if (after.isCheck()) out.push({ code: "check" });
  else if (after.isStalemate()) out.push({ code: "stalemate" });
  if (showEval) out.push(evaluation(c.score));
  return out;
}

export async function chooseChessMove(
  chess: Chess,
  difficulty: Difficulty,
  engine: ChessEngine,
): Promise<{ move: Move; decision: BotDecision }> {
  const fen = chess.fen();
  const level = LEVELS[difficulty];
  const cands = await candidates(fen, difficulty, engine);
  const best = cands.reduce((a, b) => (b.score > a.score ? b : a));

  const options: BotOption[] = cands.map((c, i) => ({
    key: `m${i + 1}`,
    subject: { kind: "move", san: c.move.san },
    reasons: reasons(fen, c, level.showEval),
  }));
  const decision = choose({
    options,
    scores: Object.fromEntries(options.map((o, i) => [o.key, cands[i].score])),
    temperature: level.temperature,
    mode: level.mode,
  });
  decision.assessment = Math.tanh(best.score / 400);
  return { move: cands[options.findIndex((o) => o.key === decision.chosenKey)].move, decision };
}
