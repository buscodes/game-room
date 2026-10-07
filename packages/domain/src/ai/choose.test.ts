import { describe, expect, it } from "vitest";
import { choose, softmax } from "./choose";
import type { BotOption } from "./decision";

const options: BotOption[] = ["a", "b", "c"].map((key) => ({ key, subject: { kind: "pass" }, reasons: [] }));

describe("softmax", () => {
  it("olasılıkların toplamı 1, yüksek puan daha olası", () => {
    const p = softmax({ a: 1, b: 2, c: 3 }, 1);
    expect(p.a + p.b + p.c).toBeCloseTo(1);
    expect(p.c).toBeGreaterThan(p.b);
    expect(p.b).toBeGreaterThan(p.a);
  });
});

describe("choose", () => {
  it("best modunda en yüksek puanlıyı seçer", () => {
    const d = choose({ options, scores: { a: 5, b: 9, c: 1 }, temperature: 2, mode: "best" });
    expect(d.chosenKey).toBe("b");
    expect(d.options.find((o) => o.key === "b")!.probability).toBeGreaterThan(0.8);
    expect(d.sampled).toBe(false);
  });

  it("sample modunda olasılıklara göre seçer ve en iyiden sapınca işaretler", () => {
    const d = choose({ options, scores: { a: 0, b: 0, c: 0 }, temperature: 1, mode: "sample", rng: () => 0.99 });
    expect(d.chosenKey).toBe("c");
    expect(d.sampled).toBe(true);
  });

  it("tek seçenek varsa onu seçer", () => {
    const d = choose({ options: options.slice(0, 1), scores: { a: 0 }, temperature: 1, mode: "sample" });
    expect(d).toMatchObject({ chosenKey: "a", onlyMove: true });
  });
});
