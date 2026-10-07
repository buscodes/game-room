export type Difficulty = "easy" | "medium" | "hard";

export const DIFFICULTIES: readonly Difficulty[] = ["easy", "medium", "hard"];

export function isDifficulty(x: unknown): x is Difficulty {
  return DIFFICULTIES.includes(x as Difficulty);
}
