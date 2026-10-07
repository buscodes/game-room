import type { Difficulty, Suit } from "@salon/domain";
import type { Pis7GameDTO, Pis7Hint } from "@salon/contracts";
import { createDependency } from "../../../shared/application/createDependency";

/** Pis Yedili sunucusuyla konuşan port. */
export interface Pis7Api {
  create(difficulty: Difficulty, target: number, players: number): Promise<Pis7GameDTO>;
  play(token: string, cardId: string, suit?: Suit): Promise<Pis7GameDTO>;
  draw(token: string): Promise<Pis7GameDTO>;
  pass(token: string): Promise<Pis7GameDTO>;
  nextRound(token: string): Promise<Pis7GameDTO>;
  hint(token: string): Promise<Pis7Hint>;
}

export const Pis7ApiDep = createDependency<Pis7Api>("Pis7Api");
