import type { Difficulty } from "@salon/domain";
import type { ChessColor, ChessGameDTO, ChessMoveRequest } from "@salon/contracts";
import { createDependency } from "../../../shared/application/createDependency";

/** Satranç sunucusuyla konuşan port. */
export interface ChessApi {
  create(difficulty: Difficulty, color: ChessColor | "random"): Promise<ChessGameDTO>;
  move(token: string, move: Omit<ChessMoveRequest, "token">): Promise<ChessGameDTO>;
  resign(token: string): Promise<ChessGameDTO>;
}

export const ChessApiDep = createDependency<ChessApi>("ChessApi");
