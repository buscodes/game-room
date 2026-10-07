import { describe, expect, it } from "vitest";
import { makeCard, seededRng } from "../common/cards";
import { createPis7Game, type Pis7State } from "./rules";
import { choosePis7Action } from "./bot";

describe("pis yedili botu", () => {
  it("son kartını atarak eli bitirir", () => {
    const base = createPis7Game({ rng: seededRng(4), players: 3 });
    const s: Pis7State = {
      ...base,
      hands: [[makeCard("2", "S")], [makeCard("5", "H")], [makeCard("4", "D"), makeCard("6", "D")]],
      discard: [makeCard("9", "H")],
      suit: "H",
      turn: 1,
    };
    const a = choosePis7Action(s, 1, "medium");
    expect(a).toMatchObject({ action: "play", cardId: "5H" });
    expect(a.option.reasons[0].code).toBe("lastCard");
    expect(a.decision.actor).toBe(1);
  });

  it("uyan kartı yoksa çeker", () => {
    const base = createPis7Game({ rng: seededRng(5) });
    const s: Pis7State = {
      ...base,
      hands: [[makeCard("2", "S")], base.hands[1]],
      discard: [makeCard("9", "H")],
      suit: "H",
      turn: 0,
    };
    const a = choosePis7Action(s, 0, "hard");
    expect(a.action).toBe("draw");
    expect(a.option.subject).toEqual({ kind: "draw", count: 1, penalty: false });
  });
});
