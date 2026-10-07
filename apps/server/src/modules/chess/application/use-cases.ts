import { Chess, type Move } from "chess.js";
import { chooseChessMove, isDifficulty, RuleViolation, type BotDecision, type Difficulty } from "@salon/domain";
import type { ChessColor, ChessMoveDTO, ChessStatus, DrawReason } from "@salon/contracts";
import { AppError } from "../../../shared/application/errors";
import type { ChessEngine, GameStateStore } from "./ports";

/** Jetonda saklanan satranç durumu. */
export interface ChessState {
  pgn: string;
  difficulty: Difficulty;
  playerColor: ChessColor;
  resigned?: boolean;
  lastMove?: ChessMoveDTO;
}

/** Use-case çıktısı: sunum katmanı bunu DTO'ya çevirir. */
export interface ChessGameView {
  token: string;
  state: ChessState;
  chess: Chess;
  status: ChessStatus;
  winner: ChessColor | null;
  drawReason?: DrawReason;
  decision?: BotDecision;
}

const SQUARE = /^[a-h][1-8]$/;
const PROMOTIONS = ["q", "r", "b", "n"];

const toMoveDTO = (m: Move): ChessMoveDTO => ({ from: m.from, to: m.to, san: m.san, promotion: m.promotion });

function outcome(s: ChessState, c: Chess): Pick<ChessGameView, "status" | "winner" | "drawReason"> {
  if (s.resigned) return { status: "resigned", winner: s.playerColor === "w" ? "b" : "w" };
  if (c.isCheckmate()) return { status: "checkmate", winner: c.turn() === "w" ? "b" : "w" };
  if (c.isStalemate()) return { status: "stalemate", winner: null };
  if (c.isDraw()) {
    const drawReason: DrawReason = c.isThreefoldRepetition()
      ? "threefold"
      : c.isInsufficientMaterial()
        ? "insufficient"
        : c.isDrawByFiftyMoves()
          ? "fifty"
          : "other";
    return { status: "draw", winner: null, drawReason };
  }
  return { status: "playing", winner: null };
}

export function makeChessUseCases(deps: { store: GameStateStore; engine: ChessEngine }) {
  const load = (token: unknown) => {
    const state = deps.store.open<ChessState>(token);
    const chess = new Chess();
    if (state.pgn) chess.loadPgn(state.pgn);
    return { state, chess };
  };

  const view = (state: ChessState, chess: Chess, decision?: BotDecision): ChessGameView => {
    const saved: ChessState = { ...state, pgn: chess.pgn() };
    return { token: deps.store.seal(saved), state: saved, chess, ...outcome(saved, chess), decision };
  };

  /** Sıra bottaysa bir hamle oynar. */
  const botMove = async (state: ChessState, chess: Chess): Promise<BotDecision | undefined> => {
    if (chess.isGameOver() || chess.turn() === state.playerColor) return undefined;
    const { move, decision } = await chooseChessMove(chess, state.difficulty, deps.engine);
    state.lastMove = toMoveDTO(chess.move(move.san));
    return decision;
  };

  return {
    async newGame(input: { difficulty?: unknown; color?: unknown }): Promise<ChessGameView> {
      const difficulty = isDifficulty(input.difficulty) ? input.difficulty : "medium";
      const playerColor: ChessColor =
        input.color === "w" || input.color === "b" ? input.color : Math.random() < 0.5 ? "w" : "b";
      const state: ChessState = { pgn: "", difficulty, playerColor };
      const chess = new Chess();
      const decision = await botMove(state, chess);
      return view(state, chess, decision);
    },

    async playMove(input: { token: unknown; from: string; to: string; promotion?: string }): Promise<ChessGameView> {
      const { state, chess } = load(input.token);
      if (state.resigned || chess.isGameOver()) throw new AppError("gameOver");
      if (chess.turn() !== state.playerColor) throw new RuleViolation("notYourTurn");
      const { from, to, promotion } = input;
      if (
        !SQUARE.test(String(from)) ||
        !SQUARE.test(String(to)) ||
        (promotion !== undefined && !PROMOTIONS.includes(promotion))
      ) {
        throw new AppError("invalidMove");
      }
      let move: Move;
      try {
        move = chess.move({ from, to, promotion });
      } catch {
        throw new AppError("invalidMove");
      }
      state.lastMove = toMoveDTO(move);
      const decision = await botMove(state, chess);
      return view(state, chess, decision);
    },

    resign(input: { token: unknown }): ChessGameView {
      const { state, chess } = load(input.token);
      state.resigned = true;
      return view(state, chess);
    },
  };
}

export type ChessUseCases = ReturnType<typeof makeChessUseCases>;
