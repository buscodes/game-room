import { PIS7_PLAYERS, PIS7_TARGET, readInRange, type Difficulty } from "@salon/domain";
import { readDifficulty } from "../../../shared/presentation/routing/difficulty-param";

/** Pis Yedili sayfasının adresi ve ayarlarının URL'de taşınması (lobi kartı ↔ sayfa sözleşmesi). */
export const PIS7_PATH = "/pis7li";

export interface Pis7Settings {
  difficulty: Difficulty;
  target: number;
  players: number;
}

export const pis7Url = (s: Pis7Settings) => `${PIS7_PATH}?d=${s.difficulty}&t=${s.target}&p=${s.players}`;

export const readPis7Settings = (params: URLSearchParams): Pis7Settings => ({
  difficulty: readDifficulty(params),
  target: readInRange(params.get("t"), PIS7_TARGET),
  players: readInRange(params.get("p"), PIS7_PLAYERS),
});
