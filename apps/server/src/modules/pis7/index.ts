import type { GameStateStore } from "../../shared/application/ports";
import type { HttpModule } from "../../shared/interface/http/module";
import { makePis7UseCases } from "./application/use-cases";
import { pis7Routes } from "./interface/routes";

/** Pis Yedili modülü: use-case'leri kurar ve HTTP'ye `/api/pis7` altında açar. */
export function pis7Module(deps: { store: GameStateStore }): HttpModule {
  return { basePath: "/api/pis7", router: pis7Routes(makePis7UseCases(deps)) };
}
