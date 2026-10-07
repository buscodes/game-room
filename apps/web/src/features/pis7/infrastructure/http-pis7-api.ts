import { post } from "../../../shared/infrastructure/http/post";
import type { Pis7Api } from "../application/ports";

export const httpPis7Api: Pis7Api = {
  create: (difficulty, target, players) => post("/pis7/new", { difficulty, target, players }),
  play: (token, cardId, suit) => post("/pis7/play", { token, cardId, suit }),
  draw: (token) => post("/pis7/draw", { token }),
  pass: (token) => post("/pis7/pass", { token }),
  nextRound: (token) => post("/pis7/next-round", { token }),
  hint: (token) => post("/pis7/hint", { token }),
};
