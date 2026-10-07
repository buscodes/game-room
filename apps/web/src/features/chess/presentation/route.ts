import type { Difficulty } from "@salon/domain";
import type { ChessColor } from "@salon/contracts";
import { readDifficulty } from "../../../shared/presentation/routing/difficulty-param";

/** Satranç sayfasının adresi ve ayarlarının URL'de taşınması (lobi kartı ↔ sayfa sözleşmesi). */
export const CHESS_PATH = "/satranc";

export interface ChessSettings {
  difficulty: Difficulty;
  color: ChessColor | "random";
}

export const chessUrl = (s: ChessSettings) => `${CHESS_PATH}?d=${s.difficulty}&c=${s.color}`;

export function readChessSettings(params: URLSearchParams): ChessSettings {
  const c = params.get("c");
  return { difficulty: readDifficulty(params), color: c === "w" || c === "b" || c === "random" ? c : "w" };
}
