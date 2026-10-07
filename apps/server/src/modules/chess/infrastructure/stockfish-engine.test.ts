import { describe, expect, it } from "vitest";
import { parseInfo } from "./stockfish-engine";

describe("parseInfo", () => {
  it("cp puanını okur", () => {
    const r = parseInfo("info depth 12 seldepth 15 multipv 2 score cp -40 nodes 1 nps 1 time 1 pv c3d5 c6d4");
    expect(r).toEqual({ index: 2, line: { uci: "c3d5", score: -40, mate: undefined, pv: ["c3d5", "c6d4"] } });
  });
  it("mat puanını okur", () => {
    expect(parseInfo("info depth 5 multipv 1 score mate 2 nodes 1 pv d1h5")!.line.score).toBe(99_998);
    expect(parseInfo("info depth 5 multipv 1 score mate -3 nodes 1 pv d1h5")!.line.score).toBe(-99_997);
  });
});
