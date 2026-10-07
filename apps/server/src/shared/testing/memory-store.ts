import { AppError } from "../application/errors";
import type { GameStateStore } from "../application/ports";

/** Bellek içi jeton deposu (şifreleme yok) — use-case'leri altyapıdan bağımsız test etmek için. */
export function memoryStore(): GameStateStore {
  const saved = new Map<string, string>();
  let n = 0;
  return {
    seal(state) {
      const token = `t${++n}`;
      saved.set(token, JSON.stringify(state));
      return token;
    },
    open<T>(token: unknown): T {
      const raw = saved.get(String(token));
      if (!raw) throw new AppError("gameNotFound");
      return JSON.parse(raw) as T;
    },
  };
}
