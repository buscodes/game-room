import { PISTI_TARGET, readInRange, type Difficulty } from "@salon/domain";
import { readDifficulty } from "../../../shared/presentation/routing/difficulty-param";

/** Pişti sayfasının adresi ve ayarlarının URL'de taşınması (lobi kartı ↔ sayfa sözleşmesi). */
export const PISTI_PATH = "/pisti";

export interface PistiSettings {
  difficulty: Difficulty;
  target: number;
}

export const pistiUrl = (s: PistiSettings) => `${PISTI_PATH}?d=${s.difficulty}&t=${s.target}`;

export const readPistiSettings = (params: URLSearchParams): PistiSettings => ({
  difficulty: readDifficulty(params),
  target: readInRange(params.get("t"), PISTI_TARGET),
});
