import { type Card, type Rng, fullDeck, shuffle } from "../common/cards";
import { RuleViolation } from "../common/errors";
import type { Range } from "../common/range";

/** Oyuncu 0 = insan, 1 = yapay zeka. */
export type PlayerIndex = 0 | 1;

export interface TableCard {
  card: Card;
  faceDown: boolean;
}

export type PistiKind = "normal" | "jack";

export interface PlayEvent {
  player: PlayerIndex;
  card: Card;
  captured: Card[];
  pisti?: PistiKind;
}

export interface HandScore {
  cards: [number, number];
  majority: [number, number];
  clubs2: [number, number];
  diamonds10: [number, number];
  aces: [number, number];
  jacks: [number, number];
  pistis: [number, number];
  total: [number, number];
}

export type PistiPhase = "playing" | "handOver" | "gameOver";

export interface PistiState {
  deck: Card[];
  table: TableCard[];
  hands: [Card[], Card[]];
  captured: [Card[], Card[]];
  /** Bu eldeki pişti puanları */
  pistiPoints: [number, number];
  pistiCount: [number, number];
  lastCapturer: PlayerIndex | null;
  turn: PlayerIndex;
  dealer: PlayerIndex;
  handNo: number;
  scores: [number, number];
  target: number;
  phase: PistiPhase;
  /** Açık olarak oynanmış/görülmüş tüm kartlar (kart sayma için). */
  seen: Card[];
  lastHandScore?: HandScore;
  winner?: PlayerIndex | "draw";
}

/** Bitiş puanı: lobide seçilebilen ve sunucunun kabul ettiği aralık. */
export const PISTI_TARGET: Range = { min: 11, max: 1001, default: 151 };

const other = (p: PlayerIndex): PlayerIndex => (p === 0 ? 1 : 0);

function clone(s: PistiState): PistiState {
  return structuredClone(s);
}

/** Yeni bir el (tüm deste) başlatır. */
function dealHand(s: PistiState, rng: Rng): void {
  let deck = shuffle(fullDeck(), rng);
  // Masanın açık kartı vale olmasın: vale ise desteye geri karıştır.
  const table = deck.splice(0, 4);
  while (table[3].rank === "J") {
    deck.push(table.pop()!);
    deck = shuffle(deck, rng);
    table.push(deck.shift()!);
  }
  s.deck = deck;
  s.table = table.map((card, i) => ({ card, faceDown: i < 3 }));
  s.hands = [[], []];
  s.captured = [[], []];
  s.pistiPoints = [0, 0];
  s.pistiCount = [0, 0];
  s.lastCapturer = null;
  s.seen = [table[3]];
  s.turn = other(s.dealer);
  s.phase = "playing";
  dealCards(s);
}

function dealCards(s: PistiState): void {
  for (let i = 0; i < 4; i++) {
    s.hands[0].push(s.deck.shift()!);
    s.hands[1].push(s.deck.shift()!);
  }
}

export function createPistiGame(opts: { target?: number; rng?: Rng; dealer?: PlayerIndex } = {}): PistiState {
  const rng = opts.rng ?? Math.random;
  const s: PistiState = {
    deck: [],
    table: [],
    hands: [[], []],
    captured: [[], []],
    pistiPoints: [0, 0],
    pistiCount: [0, 0],
    lastCapturer: null,
    turn: 0,
    dealer: opts.dealer ?? 1,
    handNo: 1,
    scores: [0, 0],
    target: opts.target ?? PISTI_TARGET.default,
    phase: "playing",
    seen: [],
  };
  dealHand(s, rng);
  return s;
}

/** Bu kart masaya oynanırsa ne olur? (durum değiştirmeden) */
export function previewPlay(table: TableCard[], card: Card): { captures: boolean; pisti?: PistiKind } {
  const top = table[table.length - 1]?.card;
  if (!top) return { captures: false };
  const captures = card.rank === top.rank || card.rank === "J";
  if (!captures) return { captures: false };
  if (table.length === 1 && card.rank === top.rank) {
    return { captures: true, pisti: card.rank === "J" ? "jack" : "normal" };
  }
  return { captures: true };
}

export function playCard(
  state: PistiState,
  player: PlayerIndex,
  cardId: string,
): { state: PistiState; event: PlayEvent } {
  if (state.phase !== "playing") throw new RuleViolation("handNotPlaying");
  if (state.turn !== player) throw new RuleViolation("notYourTurn");
  const s = clone(state);
  const hand = s.hands[player];
  const idx = hand.findIndex((c) => c.id === cardId);
  if (idx < 0) throw new RuleViolation("cardNotInHand");
  const [card] = hand.splice(idx, 1);
  s.seen.push(card);

  const result = previewPlay(s.table, card);
  const event: PlayEvent = { player, card, captured: [] };
  if (result.captures) {
    // Kapalı kartlar da alınır ve artık görülmüş sayılır.
    for (const t of s.table) if (t.faceDown) s.seen.push(t.card);
    event.captured = [...s.table.map((t) => t.card), card];
    s.captured[player].push(...event.captured);
    s.table = [];
    s.lastCapturer = player;
    if (result.pisti) {
      event.pisti = result.pisti;
      s.pistiCount[player] += 1;
      s.pistiPoints[player] += result.pisti === "jack" ? 20 : 10;
    }
  } else {
    s.table.push({ card, faceDown: false });
  }

  s.turn = other(player);

  if (s.hands[0].length === 0 && s.hands[1].length === 0) {
    if (s.deck.length > 0) {
      dealCards(s);
    } else {
      finishHand(s);
    }
  }
  return { state: s, event };
}

function finishHand(s: PistiState): void {
  if (s.table.length > 0 && s.lastCapturer !== null) {
    s.captured[s.lastCapturer].push(...s.table.map((t) => t.card));
    s.table = [];
  }
  const score = scoreHand(s);
  s.lastHandScore = score;
  s.scores = [s.scores[0] + score.total[0], s.scores[1] + score.total[1]];
  const reached = s.scores[0] >= s.target || s.scores[1] >= s.target;
  if (reached && s.scores[0] !== s.scores[1]) {
    s.phase = "gameOver";
    s.winner = s.scores[0] > s.scores[1] ? 0 : 1;
  } else {
    s.phase = "handOver";
  }
}

export function scoreHand(s: Pick<PistiState, "captured" | "pistiPoints">): HandScore {
  const cards: [number, number] = [s.captured[0].length, s.captured[1].length];
  const count = (p: PlayerIndex, f: (c: Card) => boolean) => s.captured[p].filter(f).length;
  const pair = (f: (p: PlayerIndex) => number): [number, number] => [f(0), f(1)];
  const majority: [number, number] = cards[0] > cards[1] ? [3, 0] : cards[1] > cards[0] ? [0, 3] : [0, 0];
  const clubs2 = pair((p) => count(p, (c) => c.id === "2C") * 2);
  const diamonds10 = pair((p) => count(p, (c) => c.id === "10D") * 3);
  const aces = pair((p) => count(p, (c) => c.rank === "A"));
  const jacks = pair((p) => count(p, (c) => c.rank === "J"));
  const pistis: [number, number] = [s.pistiPoints[0], s.pistiPoints[1]];
  const total = pair((p) => majority[p] + clubs2[p] + diamonds10[p] + aces[p] + jacks[p] + pistis[p]);
  return { cards, majority, clubs2, diamonds10, aces, jacks, pistis, total };
}

export function startNextHand(state: PistiState, rng: Rng = Math.random): PistiState {
  if (state.phase !== "handOver") throw new RuleViolation("cannotStartNextHand");
  const s = clone(state);
  s.handNo += 1;
  s.dealer = other(s.dealer);
  dealHand(s, rng);
  return s;
}
