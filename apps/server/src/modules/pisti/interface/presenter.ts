import type { PistiGameDTO } from "@salon/contracts";
import type { PistiGameView } from "../application/use-cases";

/** Pişti görünümü: rakibin eli ve kapalı masa kartları gizlenir. */
export function presentPisti(v: PistiGameView): PistiGameDTO {
  const s = v.game.state;
  return {
    token: v.token,
    difficulty: v.game.difficulty,
    table: s.table.map((t) => (t.faceDown ? null : t.card)),
    hand: s.hands[0],
    opponentCount: s.hands[1].length,
    deckCount: s.deck.length,
    capturedCount: [s.captured[0].length, s.captured[1].length],
    pistiCount: s.pistiCount,
    scores: s.scores,
    target: s.target,
    turn: s.turn,
    handNo: s.handNo,
    phase: s.phase,
    lastHandScore: s.lastHandScore,
    winner: s.winner,
    events: v.events,
    ai: v.decision,
  };
}
