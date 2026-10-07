import { post } from "../../../shared/infrastructure/http/post";
import type { PistiApi } from "../application/ports";

export const httpPistiApi: PistiApi = {
  create: (difficulty, target) => post("/pisti/new", { difficulty, target }),
  play: (token, cardId) => post("/pisti/play", { token, cardId }),
  nextHand: (token) => post("/pisti/next-hand", { token }),
};
