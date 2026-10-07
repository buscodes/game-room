import type { ChessGameDTO } from "@salon/contracts";
import type { ChessGameView } from "../application/use-cases";

export function presentChess(v: ChessGameView): ChessGameDTO {
  return {
    token: v.token,
    fen: v.chess.fen(),
    difficulty: v.state.difficulty,
    playerColor: v.state.playerColor,
    status: v.status,
    winner: v.winner,
    drawReason: v.drawReason,
    inCheck: v.chess.isCheck(),
    history: v.chess.history(),
    lastMove: v.state.lastMove,
    ai: v.decision,
  };
}
