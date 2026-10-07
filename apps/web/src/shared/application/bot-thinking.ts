import { sleep } from "./sleep";

/** Bir süre aralığı (ms). */
export interface Duration {
  min: number;
  max: number;
}

/** Bilgisayarın hamle yapmadan önceki "düşünme" süresi: kısa ama her seferinde biraz farklı. */
export const BOT_THINKING: Duration = { min: 600, max: 1200 };

/** Aralıktan rastgele bir süre seçer; sabit bir gecikme mekanik hissettirdiği için. */
export const thinkingTime = (range: Duration = BOT_THINKING) => range.min + Math.random() * (range.max - range.min);

/**
 * `startedAt`'ten beri `ms` kadar zaman geçmediyse kalanını bekler.
 * Sunucu zaten yavaş cevap verdiyse (ör. zor seviyede motor) bekleme üst üste binmez.
 */
export async function waitUntilElapsed(startedAt: number, ms: number): Promise<void> {
  const remaining = ms - (performance.now() - startedAt);
  if (remaining > 0) await sleep(remaining);
}
