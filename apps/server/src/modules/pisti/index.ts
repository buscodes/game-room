import type { GameStateStore } from "../../shared/application/ports";
import type { HttpModule } from "../../shared/interface/http/module";
import { makePistiUseCases } from "./application/use-cases";
import { pistiRoutes } from "./interface/routes";

/** Pişti modülü: use-case'leri kurar ve HTTP'ye `/api/pisti` altında açar. */
export function pistiModule(deps: { store: GameStateStore }): HttpModule {
  return { basePath: "/api/pisti", router: pistiRoutes(makePistiUseCases(deps)) };
}
