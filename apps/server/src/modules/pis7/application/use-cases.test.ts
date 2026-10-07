import { describe, expect, it } from "vitest";
import { RuleViolation } from "@salon/domain";
import { memoryStore } from "../../../shared/testing/memory-store";
import { makePis7UseCases } from "./use-cases";

describe("pis yedili use-case'leri", () => {
  it("insan çekince botlar sırayla oynar ve sıra insana döner", () => {
    const uc = makePis7UseCases({ store: memoryStore() });
    const g = uc.newGame({ difficulty: "medium", players: 4 });
    expect(g.game.state.players).toBe(4);
    const after = uc.draw({ token: g.token });
    const s = after.game.state;
    expect(s.phase !== "playing" || s.turn === 0).toBe(true);
    expect(after.events.length).toBeGreaterThan(0);
  });

  it("sıra insanda değilken ipucu kural hatası verir", () => {
    const g = makePis7UseCases({ store: memoryStore() }).newGame({ players: 2 });
    const store = memoryStore();
    const notMyTurn = store.seal({ ...g.game, state: { ...g.game.state, turn: 1 } });
    expect(() => makePis7UseCases({ store }).hint({ token: notMyTurn })).toThrow(RuleViolation);
  });
});
