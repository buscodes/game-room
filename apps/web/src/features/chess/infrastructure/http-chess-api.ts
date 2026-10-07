import { post } from "../../../shared/infrastructure/http/post";
import type { ChessApi } from "../application/ports";

export const httpChessApi: ChessApi = {
  create: (difficulty, color) => post("/chess/new", { difficulty, color }),
  move: (token, move) => post("/chess/move", { token, ...move }),
  resign: (token) => post("/chess/resign", { token }),
};
