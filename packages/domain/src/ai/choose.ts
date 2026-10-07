import type { BotDecision, BotOption } from "./decision";

/**
 * Botların seçim adımı: her seçeneğin puanını softmax ile olasılığa çevirir.
 *  - "sample": olasılıklara göre rastgele seçer (kolay seviye; bazen zayıf hamle yapar)
 *  - "best":   en yüksek puanlıyı seçer (orta / zor)
 */
export interface ChooseInput {
  options: BotOption[];
  /** Seçenek anahtarı → puan (yüksek = iyi) */
  scores: Record<string, number>;
  /** Softmax sıcaklığı (puan biriminde); yüksek = daha dağınık olasılıklar */
  temperature: number;
  mode: "sample" | "best";
  rng?: () => number;
}

export function softmax(scores: Record<string, number>, temperature: number): Record<string, number> {
  const keys = Object.keys(scores);
  const temp = Math.max(temperature, 1e-6);
  const max = Math.max(...keys.map((k) => scores[k]));
  const exps = keys.map((k) => Math.exp((scores[k] - max) / temp));
  const sum = exps.reduce((a, b) => a + b, 0);
  return Object.fromEntries(keys.map((k, i) => [k, exps[i] / sum]));
}

function argmax(p: Record<string, number>): string {
  return Object.entries(p).reduce((best, cur) => (cur[1] > best[1] ? cur : best))[0];
}

function sample(p: Record<string, number>, rng: () => number): string {
  let r = rng();
  for (const [k, v] of Object.entries(p)) {
    r -= v;
    if (r <= 0) return k;
  }
  return argmax(p);
}

export function choose(input: ChooseInput): BotDecision {
  if (input.options.length === 1) {
    return {
      options: [{ ...input.options[0], probability: 1 }],
      chosenKey: input.options[0].key,
      sampled: false,
      onlyMove: true,
    };
  }
  const probabilities = softmax(input.scores, input.temperature);
  const top = argmax(probabilities);
  const chosenKey = input.mode === "sample" ? sample(probabilities, input.rng ?? Math.random) : top;
  return {
    options: input.options.map((o) => ({ ...o, probability: probabilities[o.key] })),
    chosenKey,
    sampled: chosenKey !== top,
  };
}
