import { describe, expect, it } from "vitest";
import { memoryStore } from "../../../shared/testing/memory-store";
import { makePistiUseCases } from "./use-cases";

describe("pişti use-case'leri", () => {
  it("oyuncu kart atınca bot da oynar ve sıra oyuncuya döner", () => {
    const uc = makePistiUseCases({ store: memoryStore() });
    const g = uc.newGame({ difficulty: "hard" });
    const card = g.game.state.hands[0][0];
    const after = uc.play({ token: g.token, cardId: card.id });
    expect(after.events[0]).toMatchObject({ player: 0, card });
    expect(after.events.some((e) => e.player === 1)).toBe(true);
    expect(after.game.state.turn).toBe(0);
  });
});
