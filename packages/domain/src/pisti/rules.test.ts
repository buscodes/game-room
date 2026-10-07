import { describe, expect, it } from "vitest";
import { makeCard, seededRng, type Card } from "../common/cards";
import {
  createPistiGame,
  playCard,
  previewPlay,
  scoreHand,
  startNextHand,
  type PistiState,
  type TableCard,
} from "./rules";

const t = (c: Card, faceDown = false): TableCard => ({ card: c, faceDown });

describe("previewPlay", () => {
  it("aynı değer masayı alır", () => {
    expect(previewPlay([t(makeCard("5", "S")), t(makeCard("7", "H"))], makeCard("7", "C"))).toEqual({ captures: true });
  });
  it("vale her zaman alır ama tek karta vale pişti sayılmaz", () => {
    expect(previewPlay([t(makeCard("7", "H"))], makeCard("J", "C"))).toEqual({ captures: true });
  });
  it("tek karta aynı değer pişti, vale üstüne vale 20'lik pişti", () => {
    expect(previewPlay([t(makeCard("7", "H"))], makeCard("7", "C")).pisti).toBe("normal");
    expect(previewPlay([t(makeCard("J", "H"))], makeCard("J", "C")).pisti).toBe("jack");
  });
  it("boş masaya atılan kart almaz", () => {
    expect(previewPlay([], makeCard("J", "C"))).toEqual({ captures: false });
  });
});

describe("scoreHand", () => {
  it("özel kartları ve çoğunluğu sayar", () => {
    const s = scoreHand({
      captured: [
        [makeCard("2", "C"), makeCard("10", "D"), makeCard("A", "S"), makeCard("J", "H")],
        [makeCard("3", "S")],
      ],
      pistiPoints: [10, 20],
    });
    expect(s.total).toEqual([3 + 2 + 3 + 1 + 1 + 10, 20]);
  });
});

describe("tam oyun", () => {
  it("52 kart korunur ve el biter", () => {
    const rng = seededRng(42);
    let s: PistiState = createPistiGame({ rng, target: 1000 });
    expect(s.table).toHaveLength(4);
    expect(s.table[3].card.rank).not.toBe("J");
    expect(s.hands[0]).toHaveLength(4);
    let plays = 0;
    while (s.phase === "playing") {
      const p = s.turn;
      s = playCard(s, p, s.hands[p][0].id).state;
      plays++;
      const total =
        s.deck.length +
        s.table.length +
        s.hands[0].length +
        s.hands[1].length +
        s.captured[0].length +
        s.captured[1].length;
      expect(total).toBe(52);
    }
    expect(plays).toBe(48);
    expect(s.phase).toBe("handOver");
    expect(s.table).toHaveLength(0);
    const next = startNextHand(s, rng);
    expect(next.handNo).toBe(2);
    expect(next.turn).toBe(next.dealer === 0 ? 1 : 0);
  });
  it("sıra dışı oynamayı reddeder", () => {
    const s = createPistiGame({ rng: seededRng(1) });
    const wrong = s.turn === 0 ? 1 : 0;
    expect(() => playCard(s, wrong, s.hands[wrong][0].id)).toThrow();
  });
});
