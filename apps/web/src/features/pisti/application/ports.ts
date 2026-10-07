import type { Difficulty } from "@salon/domain";
import type { PistiGameDTO } from "@salon/contracts";
import { createDependency } from "../../../shared/application/createDependency";

/** Pişti sunucusuyla konuşan port. */
export interface PistiApi {
  create(difficulty: Difficulty, target: number): Promise<PistiGameDTO>;
  play(token: string, cardId: string): Promise<PistiGameDTO>;
  nextHand(token: string): Promise<PistiGameDTO>;
}

export const PistiApiDep = createDependency<PistiApi>("PistiApi");
