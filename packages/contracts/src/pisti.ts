import type { BotDecision, Card, Difficulty, HandScore, PistiPhase, PlayEvent, PlayerIndex } from "@salon/domain";

/** İstemciye gönderilen pişti görünümü (rakibin eli gizli). */
export interface PistiGameDTO {
  /** Şifreli oyun durumu; her istekte sunucuya geri gönderilir. */
  token: string;
  difficulty: Difficulty;
  table: (Card | null)[]; // null = kapalı kart
  hand: Card[];
  opponentCount: number;
  deckCount: number;
  capturedCount: [number, number];
  pistiCount: [number, number];
  scores: [number, number];
  target: number;
  turn: PlayerIndex;
  handNo: number;
  phase: PistiPhase;
  lastHandScore?: HandScore;
  winner?: PlayerIndex | "draw";
  /** Son isteğin ardından gerçekleşen oyunlar (animasyon için). */
  events: PlayEvent[];
  ai?: BotDecision;
}

export interface NewPistiGameRequest {
  difficulty: Difficulty;
  target: number;
}
