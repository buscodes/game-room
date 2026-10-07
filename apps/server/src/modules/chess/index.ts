import type { HttpModule } from "../../shared/interface/http/module";
import type { ChessEngine, GameStateStore } from "./application/ports";
import { makeChessUseCases } from "./application/use-cases";
import { chessRoutes } from "./interface/routes";

/** Satranç modülü: use-case'leri kurar ve HTTP'ye `/api/chess` altında açar. */
export function chessModule(deps: { store: GameStateStore; engine: ChessEngine }): HttpModule {
  return { basePath: "/api/chess", router: chessRoutes(makeChessUseCases(deps)) };
}

export { stockfishEngine } from "./infrastructure/stockfish-engine";
