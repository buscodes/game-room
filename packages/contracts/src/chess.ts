import type { BotDecision, Difficulty } from "@salon/domain";

export type ChessColor = "w" | "b";
export type ChessStatus = "playing" | "checkmate" | "stalemate" | "draw" | "resigned";
export type DrawReason = "threefold" | "insufficient" | "fifty" | "other";

export interface ChessMoveDTO {
  from: string;
  to: string;
  san: string;
  promotion?: string;
}

export interface ChessGameDTO {
  /** Şifreli oyun durumu; her istekte sunucuya geri gönderilir. */
  token: string;
  fen: string;
  difficulty: Difficulty;
  playerColor: ChessColor;
  status: ChessStatus;
  winner: ChessColor | null;
  drawReason?: DrawReason;
  inCheck: boolean;
  history: string[];
  lastMove?: ChessMoveDTO;
  ai?: BotDecision;
}

export interface NewChessGameRequest {
  difficulty: Difficulty;
  color: ChessColor | "random";
}

export interface ChessMoveRequest {
  token: string;
  from: string;
  to: string;
  promotion?: "q" | "r" | "b" | "n";
}
