import { Router } from "express";
import type { ChessMoveRequest, NewChessGameRequest, TokenRequest } from "@salon/contracts";
import type { ChessUseCases } from "../application/use-cases";
import { presentChess } from "./presenter";

export function chessRoutes(uc: ChessUseCases): Router {
  const r = Router();
  r.post("/new", async (req, res) => {
    res.json(presentChess(await uc.newGame(req.body as Partial<NewChessGameRequest>)));
  });
  r.post("/move", async (req, res) => {
    res.json(presentChess(await uc.playMove(req.body as ChessMoveRequest)));
  });
  r.post("/resign", (req, res) => {
    res.json(presentChess(uc.resign(req.body as TokenRequest)));
  });
  return r;
}
