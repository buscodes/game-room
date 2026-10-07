import { SUITS, type Card, type Suit } from "../common/cards";
import type { Difficulty } from "../common/difficulty";
import { choose } from "../ai/choose";
import type { BotDecision, BotOption, BotSubject, Reason } from "../ai/decision";
import { cardPenalty, nextPlayer, playableCards, type Pis7Player, type Pis7State } from "./rules";

/**
 * Seviyeler:
 *  - Kolay: olasılığa göre rastgele seçim
 *  - Orta:  en iyi hamle
 *  - Zor:   en iyi hamle + sıradaki oyuncunun hangi türlerde kart çektiğini hatırlar
 */
const LEVELS: Record<Difficulty, { temperature: number; mode: "sample" | "best"; memory: boolean }> = {
  easy: { temperature: 3, mode: "sample", memory: false },
  medium: { temperature: 1.2, mode: "best", memory: false },
  hard: { temperature: 0.6, mode: "best", memory: true },
};

export interface Pis7Action {
  action: "play" | "draw" | "pass";
  cardId?: string;
  suit?: Suit;
}

interface Candidate extends Pis7Action {
  key: string;
  subject: BotSubject;
  reasons: Reason[];
  score: number;
}

function candidates(s: Pis7State, me: Pis7Player, memory: boolean): Candidate[] {
  const hand = s.hands[me];
  const victim = nextPlayer(s, me); // 7 ve 8'den etkilenecek oyuncu
  const victimCount = s.hands[victim].length;
  const danger = Math.min(...s.hands.filter((_, i) => i !== me).map((h) => h.length)); // bitirmeye en yakın rakip
  const victimLacks = memory ? s.lackedSuits[victim] : [];
  const out: Candidate[] = [];
  let n = 0;

  const addPlay = (c: Card, suit?: Suit) => {
    const after = hand.filter((x) => x.id !== c.id);
    const newSuit = suit ?? c.suit;
    const fits = after.filter((x) => x.suit === newSuit || x.rank === c.rank || x.rank === "J").length;
    let score = 2 + cardPenalty(c) * 0.08 + fits * 0.6;
    const reasons: Reason[] = [];
    if (after.length === 0) {
      score += 50;
      reasons.push({ code: "lastCard" });
    }
    if (c.rank === "7") {
      score += 2 + (victimCount <= 3 ? 3 : 0) + (s.pendingDraw > 0 ? 6 : 0);
      reasons.push(
        s.pendingDraw > 0 ? { code: "sevenPassOn", params: { n: s.pendingDraw + 3 } } : { code: "sevenDraw3" },
      );
    } else if (c.rank === "8") {
      const again = s.players === 2 && after.some((x) => x.suit === c.suit || x.rank === "8" || x.rank === "J");
      score += 1.5 + (again ? 1.5 : 0) + (victimCount <= 2 ? 2 : 0);
      reasons.push({ code: s.players === 2 ? "eightSkipAgain" : "eightSkip" });
    } else if (c.rank === "J") {
      score += -2.5 + (after.length <= 1 ? 4 : 0) + (danger <= 2 ? 1.5 : 0);
      reasons.push({ code: "jackSuit", params: { suit: newSuit } });
      if (after.length > 1) reasons.push({ code: "jackEarly" });
    }
    if (victimLacks.includes(newSuit)) {
      score += 1.5;
      reasons.push({ code: "nextLacksSuit", params: { suit: newSuit } });
    }
    if (fits > 0) reasons.push({ code: "stillFits", params: { n: fits } });
    if (cardPenalty(c) >= 10 && c.rank !== "J") reasons.push({ code: "highPenalty", params: { pts: cardPenalty(c) } });
    n++;
    out.push({
      key: `a${n}`,
      action: "play",
      cardId: c.id,
      suit,
      subject: suit ? { kind: "jack", card: c, suit } : { kind: "card", card: c },
      reasons,
      score,
    });
  };

  const playable = playableCards(s, me);
  const firstJack = playable.find((c) => c.rank === "J");
  for (const c of playable) {
    if (c.rank === "J") {
      if (c !== firstJack) continue;
      for (const suit of SUITS) addPlay(c, suit);
    } else addPlay(c);
  }

  if (s.drawnCardId) {
    out.push({ key: "pass", action: "pass", subject: { kind: "pass" }, reasons: [{ code: "keepDrawn" }], score: -1 });
  } else {
    const penalty = s.pendingDraw;
    out.push({
      key: "draw",
      action: "draw",
      subject: { kind: "draw", count: penalty || 1, penalty: penalty > 0 },
      reasons: [{ code: penalty ? "acceptPenalty" : playable.length ? "saveCards" : "noPlayable" }],
      score: penalty ? -penalty * 0.8 : -3,
    });
  }
  return out;
}

/** Oyuncu `me` için hamle seçer (botlar ve "İpucu" bu fonksiyonu kullanır). */
export function choosePis7Action(
  s: Pis7State,
  me: Pis7Player,
  difficulty: Difficulty,
): Pis7Action & { option: BotOption; decision: BotDecision } {
  const level = LEVELS[difficulty];
  const cands = candidates(s, me, level.memory);
  const options: BotOption[] = cands.map((c) => ({ key: c.key, subject: c.subject, reasons: c.reasons }));
  const decision = choose({
    options,
    scores: Object.fromEntries(cands.map((c) => [c.key, c.score])),
    temperature: level.temperature,
    mode: level.mode,
  });
  decision.actor = me;
  const chosen = cands.find((c) => c.key === decision.chosenKey)!;
  const option = decision.options.find((o) => o.key === chosen.key)!;
  return { action: chosen.action, cardId: chosen.cardId, suit: chosen.suit, option, decision };
}
