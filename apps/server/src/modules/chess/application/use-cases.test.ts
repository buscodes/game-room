import { describe, expect, it } from "vitest";
import { AppError } from "../../../shared/application/errors";
import { memoryStore } from "../../../shared/testing/memory-store";
import type { ChessEngine } from "./ports";
import { makeChessUseCases } from "./use-cases";

/** Her zaman aynı adayı öneren sahte motor. */
const fakeEngine: ChessEngine = {
  analyse: async () => [{ uci: "e7e5", score: 20, pv: ["e7e5"] }],
};

describe("satranç use-case'leri", () => {
  it("oyuncunun hamlesinden sonra bot motorun önerisini oynar", async () => {
    const uc = makeChessUseCases({ store: memoryStore(), engine: fakeEngine });
    const g = await uc.newGame({ difficulty: "hard", color: "w" });
    const after = await uc.playMove({ token: g.token, from: "e2", to: "e4" });
    expect(after.chess.history()).toEqual(["e4", "e5"]);
    expect(after.decision?.options[0].subject).toEqual({ kind: "move", san: "e5" });
    expect(after.status).toBe("playing");
  });

  it("geçersiz hamleyi ve bilinmeyen jetonu reddeder", async () => {
    const uc = makeChessUseCases({ store: memoryStore(), engine: fakeEngine });
    const g = await uc.newGame({ difficulty: "hard", color: "w" });
    await expect(uc.playMove({ token: g.token, from: "e2", to: "e5" })).rejects.toMatchObject({ code: "invalidMove" });
    await expect(uc.playMove({ token: "yok", from: "e2", to: "e4" })).rejects.toBeInstanceOf(AppError);
  });

  it("terk edilen oyunda bot kazanır", async () => {
    const uc = makeChessUseCases({ store: memoryStore(), engine: fakeEngine });
    const g = await uc.newGame({ difficulty: "easy", color: "w" });
    expect(uc.resign({ token: g.token })).toMatchObject({ status: "resigned", winner: "b" });
  });
});
