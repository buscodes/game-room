import type { Card, Suit } from "../common/cards";

/** Botun değerlendirdiği seçeneğin ne olduğu — sunum katmanı bunu kullanıcının diline çevirir. */
export type BotSubject =
  | { kind: "move"; san: string }
  | { kind: "card"; card: Card }
  | { kind: "jack"; card: Card; suit: Suit }
  | { kind: "draw"; count: number; penalty: boolean }
  | { kind: "pass" };

/**
 * Seçeneğin gerekçesi: kod + parametreler. Parametrelerdeki `piece`, `rank`, `suit`
 * değerleri dile bağımsız kodlardır (ör. "n", "J", "H").
 */
export type ReasonCode =
  // satranç
  | "castleKing"
  | "castleQueen"
  | "captures"
  | "promotes"
  | "checkmate"
  | "check"
  | "stalemate"
  | "evaluation"
  | "mateIn"
  | "matedIn"
  // pişti
  | "capturesPile"
  | "pisti"
  | "jackPisti"
  | "wastesJack"
  | "emptyTableRisk"
  | "opponentMayTake"
  | "throwsJack"
  | "givesPoints"
  | "unseenLeft"
  | "matchesTable"
  // pis yedili
  | "lastCard"
  | "sevenPassOn"
  | "sevenDraw3"
  | "eightSkipAgain"
  | "eightSkip"
  | "jackSuit"
  | "jackEarly"
  | "nextLacksSuit"
  | "stillFits"
  | "highPenalty"
  | "keepDrawn"
  | "acceptPenalty"
  | "saveCards"
  | "noPlayable";

export interface Reason {
  code: ReasonCode;
  params?: Record<string, string | number>;
}

export interface BotOption {
  key: string;
  subject: BotSubject;
  reasons: Reason[];
  probability?: number;
}

export interface BotDecision {
  options: BotOption[];
  chosenKey: string;
  /** Kolay seviyede olasılığa göre rastgele seçildiyse ve en iyi seçenek değilse */
  sampled: boolean;
  /** Tek geçerli hamle vardı */
  onlyMove?: boolean;
  /** Çok oyunculu oyunlarda kararı veren oyuncu */
  actor?: number;
  /** Konum değerlendirmesi, -1 (bot kaybediyor) .. 1 (bot kazanıyor) */
  assessment?: number;
}
