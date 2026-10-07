import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import { deflateRawSync, inflateRawSync } from "node:zlib";
import { AppError } from "../application/errors";
import type { GameStateStore } from "../application/ports";

/**
 * Durumsuz sunucu: oyunun tüm durumu sıkıştırılıp AES-256-GCM ile şifrelenir ve
 * istemciye "jeton" olarak verilir; istemci her istekte geri gönderir.
 *  - Şifreli olduğu için rakibin eli / deste sırası okunamaz.
 *  - GCM etiketi sayesinde değiştirilen jeton reddedilir.
 * Böylece Vercel gibi örnekleri paylaşımsız çalışan ortamlarda veritabanı gerekmez.
 */

/** Yalnızca geliştirmede kullanılır; repo açık olduğu için üretimde ASLA kullanılmamalı. */
const DEV_SECRET = "dev-secret-change-me";
/** Üretimde GAME_SECRET yoksa süreç başına rastgele anahtar (yeniden başlatınca oyunlar sıfırlanır). */
const EPHEMERAL_SECRET = randomBytes(32).toString("hex");

let cached: { secret: string; key: Buffer } | null = null;

function resolveSecret(): string {
  if (process.env.GAME_SECRET) return process.env.GAME_SECRET;
  if (process.env.NODE_ENV !== "production") return DEV_SECRET;
  if (!cached) console.warn("[token] GAME_SECRET tanımlı değil; süreç başına rastgele anahtar kullanılıyor");
  return EPHEMERAL_SECRET;
}

function key(): Buffer {
  const secret = resolveSecret();
  if (cached?.secret !== secret) cached = { secret, key: createHash("sha256").update(secret).digest() };
  return cached.key;
}

function seal(value: unknown): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key(), iv);
  const body = Buffer.concat([cipher.update(deflateRawSync(JSON.stringify(value))), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), body]).toString("base64url");
}

function open<T>(token: unknown): T {
  if (typeof token !== "string" || token.length < 40) throw new AppError("gameNotFound");
  try {
    const raw = Buffer.from(token, "base64url");
    const decipher = createDecipheriv("aes-256-gcm", key(), raw.subarray(0, 12));
    decipher.setAuthTag(raw.subarray(12, 28));
    const plain = Buffer.concat([decipher.update(raw.subarray(28)), decipher.final()]);
    return JSON.parse(inflateRawSync(plain).toString("utf8")) as T;
  } catch {
    // Farklı anahtarla (ör. yeni dağıtım) üretilmiş ya da değiştirilmiş jeton
    throw new AppError("gameNotFound");
  }
}

/** `GameStateStore` portunun AES-256-GCM uygulaması. */
export const aesGameStateStore: GameStateStore = { seal, open };
