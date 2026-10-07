import { Router } from "express";
import type { NewPistiGameRequest, TokenRequest } from "@salon/contracts";
import type { PistiUseCases } from "../application/use-cases";
import { presentPisti } from "./presenter";

export function pistiRoutes(uc: PistiUseCases): Router {
  const r = Router();
  r.post("/new", (req, res) => {
    res.json(presentPisti(uc.newGame(req.body as Partial<NewPistiGameRequest>)));
  });
  r.post("/play", (req, res) => {
    res.json(presentPisti(uc.play(req.body as TokenRequest & { cardId: string })));
  });
  r.post("/next-hand", (req, res) => {
    res.json(presentPisti(uc.nextHand(req.body as TokenRequest)));
  });
  return r;
}
