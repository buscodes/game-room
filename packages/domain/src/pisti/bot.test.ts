import { describe, expect, it } from "vitest";
import { makeCard, seededRng } from "../common/cards";
import { createPistiGame, type PistiState } from "./rules";
import { choosePistiCard } from "./bot";

describe("pişti botu", () => {
  it("pişti fırsatını kaçırmaz", () => {
    const base = createPistiGame({ rng: seededRng(3) });
    const state: PistiState = {
      ...base,
      table: [{ card: makeCard("9", "H"), faceDown: false }],
      hands: [base.hands[0], [makeCard("3", "S"), makeCard("9", "C"), makeCard("K", "D")]],
      turn: 1,
    };
    const { cardId, decision } = choosePistiCard(state, "hard");
    expect(cardId).toBe("9C");
    const chosen = decision.options.find((o) => o.key === decision.chosenKey)!;
    expect(chosen.reasons.map((r) => r.code)).toContain("pisti");
  });
});
