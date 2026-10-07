import type {
  BotDecision,
  BotOption,
  Card,
  Difficulty,
  Pis7Event,
  Pis7Phase,
  Pis7Player,
  Pis7RoundResult,
  Suit,
} from "@salon/domain";

/** İstemciye gönderilen Pis Yedili görünümü (rakiplerin elleri gizli). */
export interface Pis7GameDTO {
  /** Şifreli oyun durumu; her istekte sunucuya geri gönderilir. */
  token: string;
  difficulty: Difficulty;
  players: number;
  top: Card;
  suit: Suit;
  hand: Card[];
  playable: string[];
  /** Her oyuncunun kart sayısı (0 = sen) */
  counts: number[];
  deckCount: number;
  turn: Pis7Player;
  pendingDraw: number;
  drawnCardId: string | null;
  canDraw: boolean;
  canPass: boolean;
  phase: Pis7Phase;
  round: number;
  scores: number[];
  target: number;
  lastRound?: Pis7RoundResult;
  winner?: Pis7Player;
  /** El bitince rakiplerin kalan kartları açılır (indeks oyuncuya göre, 0 boş) */
  reveal?: Card[][];
  events: Pis7Event[];
  ai?: BotDecision;
}

/** "İpucu": oyuncu için önerilen hamle ve gerekçesi. */
export interface Pis7Hint {
  action: "play" | "draw" | "pass";
  cardId?: string;
  suit?: Suit;
  option: BotOption;
}

export interface NewPis7GameRequest {
  difficulty: Difficulty;
  target: number;
  players: number;
}

export interface Pis7PlayRequest {
  token: string;
  cardId: string;
  suit?: Suit;
}
