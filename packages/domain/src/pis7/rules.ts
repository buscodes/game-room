import { type Card, type Rng, type Suit, fullDeck, shuffle } from "../common/cards";
import { RuleViolation, type RuleViolationCode } from "../common/errors";
import type { Range } from "../common/range";

/**
 * Pis Yedili — 2–5 oyuncu. Oyuncu 0 = insan, 1..N-1 = yapay zeka.
 * Sıra saat yönünde (0 → 1 → … → N-1 → 0) ilerler.
 *  - Aynı tür ya da aynı değer atılır.
 *  - 7: sıradaki oyuncu 3 kart çeker; 7 ile karşılarsa ceza birikip bir sonrakine geçer.
 *  - 8: sıradaki oyuncu atlanır (2 kişide aynı oyuncu tekrar oynar).
 *  - Vale: her kartın üstüne (bekleyen 7 cezası yoksa) atılır, tür seçilir.
 *  - Atacak kart yoksa 1 kart çekilir; uyuyorsa atılabilir, yoksa sıra geçer.
 *  - Elini bitiren eli kazanır; diğer herkese elindeki kartlar ceza puanı olarak yazılır.
 */
export type Pis7Player = number;

/** Oyuncu sayısı (sen + botlar). */
export const PIS7_PLAYERS: Range = { min: 2, max: 5, default: 2 };
/** Ceza sınırı: biri buna ulaşınca oyun biter. */
export const PIS7_TARGET: Range = { min: 20, max: 1000, default: 101 };
const PENALTY_PER_SEVEN = 3;
const HAND_SIZE = 7;

export type Pis7Phase = "playing" | "roundOver" | "gameOver";

export interface Pis7RoundResult {
  winner: Pis7Player;
  /** Bu elde her oyuncuya yazılan ceza (kazanan 0) */
  points: number[];
}

export interface Pis7State {
  players: number;
  deck: Card[];
  discard: Card[]; // son eleman üstteki kart
  hands: Card[][];
  turn: Pis7Player;
  /** Geçerli tür (vale sonrası seçilen tür, aksi halde üst kartın türü) */
  suit: Suit;
  /** Biriken 7 cezası (çekilecek kart sayısı) */
  pendingDraw: number;
  /** Bu turda çekilen ve atılabilir kart (atabilir ya da pas geçebilir) */
  drawnCardId: string | null;
  phase: Pis7Phase;
  round: number;
  starter: Pis7Player;
  /** Toplam ceza puanları (düşük olan iyi) */
  scores: number[];
  target: number;
  lastRound?: Pis7RoundResult;
  winner?: Pis7Player;
  /** Oyuncunun türe uyamayıp kart çektiği türler (yapay zekanın hafızası için) */
  lackedSuits: Suit[][];
}

export type Pis7Event =
  | { type: "play"; player: Pis7Player; card: Card; suit: Suit; effect?: "seven" | "eight" | "jack" }
  | { type: "draw"; player: Pis7Player; count: number; penalty: boolean; cards?: Card[] }
  | { type: "pass"; player: Pis7Player }
  | { type: "reshuffle" }
  | { type: "roundOver"; winner: Pis7Player; points: number[] };

export function nextPlayer(s: Pick<Pis7State, "players">, p: Pis7Player): Pis7Player {
  return (p + 1) % s.players;
}

export function cardPenalty(c: Card): number {
  if (c.rank === "J") return 25;
  if (c.rank === "A") return 11;
  if (c.rank === "Q" || c.rank === "K") return 10;
  return Number(c.rank);
}

export function topOf(s: Pis7State): Card {
  return s.discard[s.discard.length - 1];
}

/** Bir kartın atılıp atılamayacağına karar vermek için gereken bilgi (istemci de bu görünüme sahiptir). */
export interface Pis7TurnView {
  phase: Pis7Phase;
  turn: Pis7Player;
  drawnCardId: string | null;
  pendingDraw: number;
  suit: Suit;
  top: Card;
}

/** Kart neden atılamıyor? null = atılabilir. */
export function whyNotPlayable(
  v: Pis7TurnView,
  player: Pis7Player,
  card: Card,
): { code: RuleViolationCode; params?: Record<string, number> } | null {
  if (v.phase !== "playing" || v.turn !== player) return { code: "notYourTurn" };
  if (v.drawnCardId && card.id !== v.drawnCardId) return { code: "onlyDrawnCard" };
  if (v.pendingDraw > 0) return card.rank === "7" ? null : { code: "penaltyPending", params: { n: v.pendingDraw } };
  if (card.rank === "J") return null;
  return card.suit === v.suit || card.rank === v.top.rank ? null : { code: "doesNotMatch" };
}

const whyNot = (s: Pis7State, player: Pis7Player, card: Card) => whyNotPlayable({ ...s, top: topOf(s) }, player, card);

export function canPlay(s: Pis7State, player: Pis7Player, card: Card): boolean {
  return whyNot(s, player, card) === null;
}

export function playableCards(s: Pis7State, player: Pis7Player): Card[] {
  return s.hands[player].filter((c) => canPlay(s, player, c));
}

function clone(s: Pis7State): Pis7State {
  return structuredClone(s);
}

function drawCards(s: Pis7State, player: Pis7Player, n: number, rng: Rng, events: Pis7Event[]): Card[] {
  const drawn: Card[] = [];
  for (let i = 0; i < n; i++) {
    if (s.deck.length === 0) {
      if (s.discard.length <= 1) break; // çekilecek kart kalmadı
      const top = s.discard.pop()!;
      s.deck = shuffle(s.discard, rng);
      s.discard = [top];
      events.push({ type: "reshuffle" });
    }
    const c = s.deck.shift()!;
    s.hands[player].push(c);
    drawn.push(c);
  }
  return drawn;
}

function dealRound(s: Pis7State, rng: Rng): void {
  s.deck = shuffle(fullDeck(), rng);
  s.hands = Array.from({ length: s.players }, () => s.deck.splice(0, HAND_SIZE));
  // Açılış kartı özel olmasın (7, 8, vale)
  const idx = s.deck.findIndex((c) => !["7", "8", "J"].includes(c.rank));
  const [first] = s.deck.splice(idx, 1);
  s.discard = [first];
  s.suit = first.suit;
  s.pendingDraw = 0;
  s.drawnCardId = null;
  s.turn = s.starter;
  s.phase = "playing";
  s.lackedSuits = Array.from({ length: s.players }, () => []);
}

export function createPis7Game(
  opts: { players?: number; target?: number; rng?: Rng; starter?: Pis7Player } = {},
): Pis7State {
  const players = Math.min(
    PIS7_PLAYERS.max,
    Math.max(PIS7_PLAYERS.min, Math.round(opts.players ?? PIS7_PLAYERS.default)),
  );
  const s = {
    players,
    round: 1,
    starter: opts.starter ?? 0,
    scores: Array(players).fill(0),
    target: opts.target ?? PIS7_TARGET.default,
  } as Pis7State;
  dealRound(s, opts.rng ?? Math.random);
  return s;
}

function endTurn(s: Pis7State, next: Pis7Player): void {
  s.turn = next;
  s.drawnCardId = null;
}

function finishRound(s: Pis7State, winner: Pis7Player, rng: Rng, events: Pis7Event[]): void {
  // Son kart 7 ise ceza yine de sıradakine çektirilir.
  if (s.pendingDraw > 0) {
    const victim = nextPlayer(s, winner);
    const drawn = drawCards(s, victim, s.pendingDraw, rng, events);
    events.push({ type: "draw", player: victim, count: drawn.length, penalty: true, cards: drawn });
    s.pendingDraw = 0;
  }
  const points = s.hands.map((h, i) => (i === winner ? 0 : h.reduce((sum, c) => sum + cardPenalty(c), 0)));
  s.scores = s.scores.map((v, i) => v + points[i]);
  s.lastRound = { winner, points };
  events.push({ type: "roundOver", winner, points });
  if (s.scores.some((v) => v >= s.target)) {
    s.phase = "gameOver";
    s.winner = s.scores.indexOf(Math.min(...s.scores));
  } else {
    s.phase = "roundOver";
  }
}

export function pis7Play(
  state: Pis7State,
  player: Pis7Player,
  cardId: string,
  chosenSuit?: Suit,
  rng: Rng = Math.random,
): { state: Pis7State; events: Pis7Event[] } {
  const card = state.hands[player]?.find((c) => c.id === cardId);
  if (!card) throw new RuleViolation("cardNotInHand");
  const reason = whyNot(state, player, card);
  if (reason) throw new RuleViolation(reason.code, reason.params);
  if (card.rank === "J" && !chosenSuit) throw new RuleViolation("mustChooseSuit");

  const s = clone(state);
  const events: Pis7Event[] = [];
  s.hands[player] = s.hands[player].filter((c) => c.id !== cardId);
  s.discard.push(card);
  s.suit = card.rank === "J" ? chosenSuit! : card.suit;
  s.lackedSuits[player] = s.lackedSuits[player].filter((x) => x !== card.suit);

  let effect: "seven" | "eight" | "jack" | undefined;
  let next = nextPlayer(s, player);
  if (card.rank === "7") {
    effect = "seven";
    s.pendingDraw += PENALTY_PER_SEVEN;
  } else if (card.rank === "8") {
    effect = "eight";
    next = nextPlayer(s, next); // bir oyuncu atlanır
  } else if (card.rank === "J") {
    effect = "jack";
  }
  events.push({ type: "play", player, card, suit: s.suit, effect });

  if (s.hands[player].length === 0) {
    finishRound(s, player, rng, events);
    return { state: s, events };
  }
  endTurn(s, next);
  return { state: s, events };
}

export function pis7Draw(
  state: Pis7State,
  player: Pis7Player,
  rng: Rng = Math.random,
): { state: Pis7State; events: Pis7Event[] } {
  if (state.phase !== "playing" || state.turn !== player) throw new RuleViolation("notYourTurn");
  if (state.drawnCardId) throw new RuleViolation("alreadyDrew");
  const s = clone(state);
  const events: Pis7Event[] = [];
  if (s.pendingDraw > 0) {
    const drawn = drawCards(s, player, s.pendingDraw, rng, events);
    events.push({ type: "draw", player, count: drawn.length, penalty: true, cards: drawn });
    s.pendingDraw = 0;
    endTurn(s, nextPlayer(s, player));
    return { state: s, events };
  }
  if (!s.lackedSuits[player].includes(s.suit)) s.lackedSuits[player].push(s.suit);
  const drawn = drawCards(s, player, 1, rng, events);
  events.push({ type: "draw", player, count: drawn.length, penalty: false, cards: drawn });
  if (drawn.length && canPlay({ ...s, drawnCardId: null }, player, drawn[0])) {
    s.drawnCardId = drawn[0].id;
  } else {
    events.push({ type: "pass", player });
    endTurn(s, nextPlayer(s, player));
  }
  return { state: s, events };
}

export function pis7Pass(state: Pis7State, player: Pis7Player): { state: Pis7State; events: Pis7Event[] } {
  if (state.turn !== player || !state.drawnCardId) throw new RuleViolation("mustDrawFirst");
  const s = clone(state);
  endTurn(s, nextPlayer(s, player));
  return { state: s, events: [{ type: "pass", player }] };
}

export function pis7NextRound(state: Pis7State, rng: Rng = Math.random): Pis7State {
  if (state.phase !== "roundOver") throw new RuleViolation("cannotStartNextHand");
  const s = clone(state);
  s.round += 1;
  s.starter = nextPlayer(s, s.starter);
  s.lastRound = undefined;
  dealRound(s, rng);
  return s;
}
