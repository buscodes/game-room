import { Router } from "express";
import type { NewPis7GameRequest, Pis7PlayRequest, TokenRequest } from "@salon/contracts";
import type { Pis7UseCases } from "../application/use-cases";
import { presentPis7, presentPis7Hint } from "./presenter";

export function pis7Routes(uc: Pis7UseCases): Router {
  const r = Router();
  r.post("/new", (req, res) => res.json(presentPis7(uc.newGame(req.body as Partial<NewPis7GameRequest>))));
  r.post("/play", (req, res) => res.json(presentPis7(uc.play(req.body as Pis7PlayRequest))));
  r.post("/draw", (req, res) => res.json(presentPis7(uc.draw(req.body as TokenRequest))));
  r.post("/pass", (req, res) => res.json(presentPis7(uc.pass(req.body as TokenRequest))));
  r.post("/next-round", (req, res) => res.json(presentPis7(uc.nextRound(req.body as TokenRequest))));
  r.post("/hint", (req, res) => res.json(presentPis7Hint(uc.hint(req.body as TokenRequest))));
  return r;
}
