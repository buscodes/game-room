import type { Card, Rank } from "../common/cards";
import type { Difficulty } from "../common/difficulty";
import { choose } from "../ai/choose";
import type { BotDecision, BotOption, Reason } from "../ai/decision";
import { previewPlay, type PistiState } from "./rules";

/** Pişti kart puanı: karo 10 = 3, sinek 2 = 2, as ve vale = 1. */
export function cardPoints(c: Card): number {
  if (c.id === "10D") return 3;
  if (c.id === "2C") return 2;
  if (c.rank === "A" || c.rank === "J") return 1;
  return 0;
}

/**
 * Seviyeler:
 *  - Kolay: yalnızca "alır mı?" bilgisi, olasılığa göre rastgele seçim
 *  - Orta:  masadaki ve eldeki kartları bilir, en iyi kartı oynar
 *  - Zor:   oynanmış bütün kartları sayar (rakibe pişti verme riskini daha iyi hesaplar)
 */
const LEVELS: Record<
  Difficulty,
  { temperature: number; mode: "sample" | "best"; memory: "none" | "visible" | "full" }
> = {
  easy: { temperature: 4, mode: "sample", memory: "none" },
  medium: { temperature: 1.5, mode: "best", memory: "visible" },
  hard: { temperature: 0.7, mode: "best", memory: "full" },
};

interface Analysis {
  card: Card;
  captures: boolean;
  score: number;
  reasons: Reason[];
}

/**
 * Rakibin elinde belirli bir değerin en az bir kartının olma olasılığı (yaklaşık).
 * `known` = botun gördüğü/bildiği kartlar.
 */
function probOpponentHas(rank: Rank, known: Card[], unseenTotal: number, oppHand: number): number {
  const remaining = 4 - known.filter((c) => c.rank === rank).length;
  if (remaining <= 0 || unseenTotal <= 0 || oppHand <= 0) return 0;
  // 1 - P(rakibin elindeki kartların hiçbiri o değerde değil)
  let pNone = 1;
  for (let i = 0; i < oppHand; i++) pNone *= Math.max(0, (unseenTotal - remaining - i) / (unseenTotal - i));
  return 1 - pNone;
}

function analyse(state: PistiState, memory: "none" | "visible" | "full"): Analysis[] {
  const hand = state.hands[1];
  const visibleTable = state.table.filter((t) => !t.faceDown).map((t) => t.card);
  const known =
    memory === "full"
      ? [...new Map([...state.seen, ...hand].map((c) => [c.id, c])).values()]
      : [...hand, ...visibleTable];
  const unseenTotal = 52 - known.length;
  const oppHand = state.hands[0].length;
  const pileCards = state.table.map((t) => t.card);
  const pilePoints = pileCards.reduce((s, c) => s + cardPoints(c), 0);
  const pct = (p: number) => Math.round(p * 100);

  return hand.map((card) => {
    const p = previewPlay(state.table, card);
    const reasons: Reason[] = [];
    let gain = 0;
    let risk = 0;
    if (p.captures) {
      const pts = pilePoints + cardPoints(card);
      gain = pts + 0.25 * (pileCards.length + 1);
      reasons.push({ code: "capturesPile", params: { n: pileCards.length, pts } });
      if (p.pisti) {
        gain += p.pisti === "jack" ? 20 : 10;
        reasons.push({ code: p.pisti === "jack" ? "jackPisti" : "pisti" });
      }
      if (card.rank === "J" && !p.pisti && pileCards.length <= 2 && pilePoints === 0) {
        gain -= 2.5;
        reasons.push({ code: "wastesJack" });
      }
    } else {
      const newPile = pileCards.length + 1;
      const newPoints = pilePoints + cardPoints(card);
      const pSame = memory === "none" ? 0.3 : probOpponentHas(card.rank, known, unseenTotal, oppHand);
      const pJack = memory === "none" ? 0.25 : probOpponentHas("J", known, unseenTotal, oppHand);
      const pTake = 1 - (1 - pSame) * (1 - pJack);
      risk = pTake * (newPoints + 0.25 * newPile);
      if (newPile === 1) {
        risk += pSame * 10;
        reasons.push({ code: "emptyTableRisk", params: { pct: pct(pSame) } });
      } else {
        reasons.push({ code: "opponentMayTake", params: { n: newPile, pct: pct(pTake) } });
      }
      if (card.rank === "J") {
        risk += 3;
        reasons.push({ code: "throwsJack" });
      }
      if (cardPoints(card) > 0) reasons.push({ code: "givesPoints", params: { pts: cardPoints(card) } });
      if (memory === "full") {
        const left = 4 - known.filter((c) => c.rank === card.rank).length;
        reasons.push({ code: "unseenLeft", params: { n: left, rank: card.rank } });
      }
    }
    return { card, captures: p.captures, score: gain - risk, reasons };
  });
}

/** Bot (oyuncu 1) hangi kartı oynayacak? */
export function choosePistiCard(state: PistiState, difficulty: Difficulty): { cardId: string; decision: BotDecision } {
  const level = LEVELS[difficulty];
  const analysis = analyse(state, level.memory);

  const options: BotOption[] = analysis.map((a, i) => ({
    key: `c${i + 1}`,
    subject: { kind: "card", card: a.card },
    reasons: difficulty === "easy" ? (a.captures ? [{ code: "matchesTable" }] : []) : a.reasons,
  }));
  const decision = choose({
    options,
    scores: Object.fromEntries(
      analysis.map((a, i) => [options[i].key, difficulty === "easy" ? (a.captures ? 3 : 0) : a.score]),
    ),
    temperature: level.temperature,
    mode: level.mode,
  });
  const idx = options.findIndex((o) => o.key === decision.chosenKey);
  return { cardId: analysis[idx].card.id, decision };
}
