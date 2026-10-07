import { describe, expect, it } from "vitest";
import { capturedPieces } from "./material";

describe("capturedPieces", () => {
  it("başlangıçta alınan taş yok", () => {
    expect(capturedPieces("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1")).toEqual({
      w: [],
      b: [],
      diff: 0,
    });
  });
  it("alınan taşları ve materyal farkını hesaplar", () => {
    // Siyahın vezir ve bir piyonu eksik, beyazın bir atı eksik
    const r = capturedPieces("rnb1kbnr/ppp1pppp/8/8/8/8/PPPPPPPP/R1BQKBNR w KQkq - 0 1");
    expect(r.w.sort()).toEqual(["bP", "bQ"]);
    expect(r.b).toEqual(["wN"]);
    expect(r.diff).toBe(10 - 3);
  });
});
