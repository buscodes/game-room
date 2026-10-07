import { describe, expect, it } from "vitest";
import { makeCard, seededRng } from "../common/cards";
import { canPlay, createPis7Game, pis7Draw, pis7Pass, pis7Play, playableCards, type Pis7State } from "./rules";

/** Elleri ve masayı elle kurulmuş bir durum. */
function setup(hand0: string[], hand1: string[], top: string, extra: Partial<Pis7State> = {}): Pis7State {
  const parse = (id: string) => makeCard(id.slice(0, -1) as never, id.slice(-1) as never);
  const base = createPis7Game({ rng: seededRng(1) });
  const t = parse(top);
  const used = new Set([...hand0, ...hand1, top]);
  return {
    ...base,
    hands: [hand0.map(parse), hand1.map(parse)],
    discard: [t],
    suit: t.suit,
    deck: base.deck.concat(base.hands[0], base.hands[1], base.discard).filter((c) => !used.has(c.id)),
    turn: 0,
    ...extra,
  };
}

describe("pis yedili kuralları", () => {
  it("tür ya da değer uyar, vale her zaman", () => {
    const s = setup(["5H", "9S", "JC", "2D"], ["3C"], "9H");
    expect(
      playableCards(s, 0)
        .map((c) => c.id)
        .sort(),
    ).toEqual(["5H", "9S", "JC"].sort());
  });

  it("7 ceza biriktirir, 7 ile karşılanabilir, çekince ceza temizlenir", () => {
    let s = setup(["7H", "3C"], ["7S", "4D", "KD"], "9H");
    s = pis7Play(s, 0, "7H").state;
    expect(s.pendingDraw).toBe(3);
    expect(
      canPlay(
        s,
        1,
        s.hands[1].find((c) => c.id === "4D")!,
      ),
    ).toBe(false);
    s = pis7Play(s, 1, "7S").state;
    expect(s.pendingDraw).toBe(6);
    const r = pis7Draw(s, 0);
    expect(r.state.hands[0]).toHaveLength(1 + 6);
    expect(r.state.pendingDraw).toBe(0);
    expect(r.state.turn).toBe(1);
  });

  it("8 rakibi atlatır", () => {
    const s = pis7Play(setup(["8H", "3C"], ["4D"], "9H"), 0, "8H").state;
    expect(s.turn).toBe(0);
  });

  it("vale türü değiştirir ve tür seçimi zorunludur", () => {
    const s0 = setup(["JH", "3C"], ["4D"], "9S");
    expect(() => pis7Play(s0, 0, "JH")).toThrow();
    const s = pis7Play(s0, 0, "JH", "D").state;
    expect(s.suit).toBe("D");
    expect(canPlay(s, 1, s.hands[1][0])).toBe(true);
  });

  it("çekilen kart uymuyorsa sıra geçer; uyuyorsa yalnız o atılabilir ya da pas", () => {
    const s = setup(["3C"], ["4D"], "9H");
    s.deck = [makeCard("2", "S"), ...s.deck.filter((c) => c.id !== "2S")];
    const r = pis7Draw(s, 0);
    expect(r.state.turn).toBe(1);
    const s2 = setup(["3C"], ["4D"], "9H");
    s2.deck = [makeCard("5", "H"), ...s2.deck.filter((c) => c.id !== "5H")];
    const r2 = pis7Draw(s2, 0);
    expect(r2.state.drawnCardId).toBe("5H");
    expect(() => pis7Play(r2.state, 0, "3C")).toThrow();
    expect(pis7Pass(r2.state, 0).state.turn).toBe(1);
  });

  it("eli bitiren kazanır, kaybedene elindeki kartların cezası yazılır", () => {
    const s = pis7Play(setup(["5H"], ["JD", "AC", "7S"], "9H"), 0, "5H").state;
    expect(s.phase).toBe("roundOver");
    expect(s.lastRound).toEqual({ winner: 0, points: [0, 25 + 11 + 7] });
    expect(s.scores).toEqual([0, 43]);
  });

  it("son kart 7 ise rakip cezayı yine çeker", () => {
    const s = pis7Play(setup(["7H"], ["2D"], "9H"), 0, "7H").state;
    expect(s.hands[1]).toHaveLength(4);
  });

  it.each([2, 3, 4, 5])("%i oyunculu rastgele el her zaman biter ve 52 kart korunur", (players) => {
    const rng = seededRng(99 + players);
    let s = createPis7Game({ rng, target: 10_000, players });
    expect(s.hands).toHaveLength(players);
    for (let step = 0; step < 2000 && s.phase === "playing"; step++) {
      const p = s.turn;
      const play = playableCards(s, p)[0];
      if (play) s = pis7Play(s, p, play.id, play.rank === "J" ? "S" : undefined, rng).state;
      else if (s.drawnCardId) s = pis7Pass(s, p).state;
      else s = pis7Draw(s, p, rng).state;
      expect(s.deck.length + s.discard.length + s.hands.reduce((n, h) => n + h.length, 0)).toBe(52);
    }
    expect(s.phase).toBe("roundOver");
  });

  it("3 kişide 8 bir sonrakini atlar, 7 cezası sıradakine gider", () => {
    const base = createPis7Game({ rng: seededRng(5), players: 3 });
    const s: Pis7State = {
      ...base,
      hands: [
        [makeCard("8", "H"), makeCard("3", "C")],
        [makeCard("7", "H"), makeCard("4", "S")],
        [makeCard("9", "D"), makeCard("5", "S")],
      ],
      discard: [makeCard("9", "H")],
      suit: "H",
      turn: 0,
    };
    const afterEight = pis7Play(s, 0, "8H").state;
    expect(afterEight.turn).toBe(2); // oyuncu 1 atlandı
    const s2 = { ...s, turn: 1 };
    const afterSeven = pis7Play(s2, 1, "7H").state;
    expect(afterSeven.turn).toBe(2);
    expect(afterSeven.pendingDraw).toBe(3);
    const drew = pis7Draw(afterSeven, 2).state;
    expect(drew.hands[2]).toHaveLength(5);
    expect(drew.turn).toBe(0);
  });

  it("çok oyunculuda el bitince herkese ceza yazılır, en düşük puanlı kazanır", () => {
    const base = createPis7Game({ rng: seededRng(6), players: 3, target: 20 });
    const s: Pis7State = {
      ...base,
      hands: [[makeCard("5", "H")], [makeCard("K", "S"), makeCard("Q", "S")], [makeCard("2", "D")]],
      discard: [makeCard("9", "H")],
      suit: "H",
      turn: 0,
    };
    const r = pis7Play(s, 0, "5H").state;
    expect(r.lastRound!.points).toEqual([0, 20, 2]);
    expect(r.phase).toBe("gameOver");
    expect(r.winner).toBe(0);
  });
});
