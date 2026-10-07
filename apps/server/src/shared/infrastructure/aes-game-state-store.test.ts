import { afterEach, describe, expect, it } from "vitest";
import { aesGameStateStore } from "./aes-game-state-store";

const { seal, open } = aesGameStateStore;

afterEach(() => {
  delete process.env.GAME_SECRET;
});

describe("oyun jetonu", () => {
  it("şifreler ve geri açar", () => {
    const state = { hands: [["AS", "7H"], ["JD"]], turn: 1 };
    const token = seal(state);
    // Jeton şifreli: ham baytlarında düz metin JSON'un hiçbir parçası görünmez
    // (rastgele base64'te kısa harf dizileri tesadüfen geçebileceği için baytlara bakılır).
    expect(Buffer.from(token, "base64url").includes(Buffer.from('"hands"'))).toBe(false);
    expect(open(token)).toEqual(state);
  });

  it("değiştirilmiş jetonu reddeder", () => {
    const token = seal({ a: 1 });
    const tampered = token.slice(0, -2) + (token.endsWith("A") ? "BB" : "AA");
    expect(() => open(tampered)).toThrow();
  });

  it("başka anahtarla üretilmiş jetonu reddeder", () => {
    process.env.GAME_SECRET = "bir";
    const token = seal({ a: 1 });
    process.env.GAME_SECRET = "iki";
    expect(() => open(token)).toThrow();
  });
});

describe("anahtar seçimi", () => {
  afterEach(() => {
    delete process.env.GAME_SECRET;
    process.env.NODE_ENV = "test";
  });

  it("üretimde GAME_SECRET yoksa repodaki geliştirme anahtarını kullanmaz", () => {
    process.env.NODE_ENV = "development";
    const devToken = seal({ a: 1 });
    process.env.NODE_ENV = "production";
    expect(() => open(devToken)).toThrow();
    expect(open(seal({ b: 2 }))).toEqual({ b: 2 });
  });
});
