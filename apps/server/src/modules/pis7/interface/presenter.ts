import { playableCards, topOf } from "@salon/domain";
import type { Pis7GameDTO, Pis7Hint } from "@salon/contracts";
import type { Pis7GameView, Pis7HintView } from "../application/use-cases";

/** Pis Yedili görünümü: rakiplerin elleri ve çektikleri kartlar gizlenir. */
export function presentPis7(v: Pis7GameView): Pis7GameDTO {
  const s = v.game.state;
  const myTurn = s.phase === "playing" && s.turn === 0;
  return {
    token: v.token,
    difficulty: v.game.difficulty,
    players: s.players,
    top: topOf(s),
    suit: s.suit,
    hand: s.hands[0],
    playable: myTurn ? playableCards(s, 0).map((c) => c.id) : [],
    counts: s.hands.map((h) => h.length),
    deckCount: s.deck.length,
    turn: s.turn,
    pendingDraw: s.pendingDraw,
    drawnCardId: s.drawnCardId,
    canDraw: myTurn && !s.drawnCardId,
    canPass: myTurn && !!s.drawnCardId,
    phase: s.phase,
    round: s.round,
    scores: s.scores,
    target: s.target,
    lastRound: s.lastRound,
    winner: s.winner,
    reveal: s.phase === "playing" ? undefined : s.hands.map((h, i) => (i === 0 ? [] : h)),
    events: v.events.map((e) => (e.type === "draw" && e.player !== 0 ? { ...e, cards: undefined } : e)),
    ai: v.decision,
  };
}

export const presentPis7Hint = (h: Pis7HintView): Pis7Hint => ({ ...h });
