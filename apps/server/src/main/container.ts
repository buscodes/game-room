import { aesGameStateStore } from "../shared/infrastructure/aes-game-state-store";
import { createApp } from "../shared/interface/http/create-app";
import { chessModule, stockfishEngine } from "../modules/chess";
import { pistiModule } from "../modules/pisti";
import { pis7Module } from "../modules/pis7";

/** Bileşim kökü: altyapı uygulamaları modüllere yalnızca burada bağlanır. */
export function buildApp() {
  const store = aesGameStateStore;
  return createApp([chessModule({ store, engine: stockfishEngine }), pistiModule({ store }), pis7Module({ store })]);
}
