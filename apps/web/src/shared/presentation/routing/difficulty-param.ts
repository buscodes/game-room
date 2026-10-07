import { isDifficulty, type Difficulty } from "@salon/domain";

/** URL'deki `d` parametresinden zorluk; geçersizse "medium". */
export function readDifficulty(params: URLSearchParams): Difficulty {
  const d = params.get("d");
  return isDifficulty(d) ? d : "medium";
}
