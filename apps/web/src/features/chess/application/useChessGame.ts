import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Chess, type Square } from "chess.js";
import { capturedPieces, type Difficulty } from "@salon/domain";
import type { ChessColor, ChessGameDTO } from "@salon/contracts";
import { ChessApiDep } from "./ports";
import { thinkingTime, waitUntilElapsed } from "../../../shared/application/bot-thinking";
import { toApiError, type ApiError } from "../../../shared/application/errors";

export type Promotion = "q" | "r" | "b" | "n";

/** Satranç oyununun durumu ve kullanıcı eylemleri. */
export function useChessGame(difficulty: Difficulty, color: ChessColor | "random") {
  const api = ChessApiDep.use();
  const [game, setGame] = useState<ChessGameDTO | null>(null);
  const [fen, setFen] = useState(new Chess().fen());
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null);
  const [thinking, setThinking] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [promotion, setPromotion] = useState<{ from: string; to: string } | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const started = useRef(false);

  const newGame = useCallback(async () => {
    setThinking(true);
    setError(null);
    setSelected(null);
    setLastMove(null);
    setFen(new Chess().fen());
    try {
      const startedAt = performance.now();
      const g = await api.create(difficulty, color);
      setGame(g);
      // Bilgisayar beyazsa önce boş tahta, kısa bir düşünmenin ardından ilk hamlesi görünür.
      if (g.lastMove) await waitUntilElapsed(startedAt, thinkingTime());
      setFen(g.fen);
      setLastMove(g.lastMove ?? null);
    } catch (e) {
      setError(toApiError(e));
    } finally {
      setThinking(false);
    }
  }, [api, difficulty, color]);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    void newGame();
  }, [newGame]);

  const position = useMemo(() => new Chess(fen), [fen]);
  const myTurn = !!game && game.status === "playing" && !thinking && position.turn() === game.playerColor;

  const submit = useCallback(
    async (from: string, to: string, promo?: Promotion) => {
      if (!game) return;
      const c = new Chess(fen);
      try {
        c.move({ from, to, promotion: promo });
      } catch {
        return;
      }
      // İyimser güncelleme: hamle hemen görünür, sunucu cevabıyla düzeltilir.
      setFen(c.fen());
      setLastMove({ from, to });
      setSelected(null);
      setThinking(true);
      setError(null);
      try {
        const startedAt = performance.now();
        const g = await api.move(game.token, { from, to, promotion: promo });
        const botMoved = g.lastMove && (g.lastMove.from !== from || g.lastMove.to !== to);
        if (botMoved) await waitUntilElapsed(startedAt, thinkingTime());
        setGame(g);
        setFen(g.fen);
        setLastMove(g.lastMove ?? null);
      } catch (e) {
        setError(toApiError(e));
        setFen(game.fen);
      } finally {
        setThinking(false);
      }
    },
    [api, game, fen],
  );

  /** Sürükle-bırak ya da tıklama ile hamle denemesi; terfi gerekiyorsa seçim penceresini açar. */
  const tryMove = useCallback(
    (from: string, to: string): boolean => {
      if (!myTurn) return false;
      const legal = position.moves({ square: from as Square, verbose: true }).filter((m) => m.to === to);
      if (legal.length === 0) return false;
      if (legal.some((m) => m.promotion)) {
        setPromotion({ from, to });
        return false;
      }
      void submit(from, to);
      return true;
    },
    [myTurn, position, submit],
  );

  const clickSquare = useCallback(
    (square: string) => {
      if (!myTurn) return;
      const piece = position.get(square as Square);
      if (selected && selected !== square && tryMove(selected, square)) return;
      if (piece && piece.color === game?.playerColor) setSelected(square);
      else setSelected(null);
    },
    [myTurn, position, selected, tryMove, game?.playerColor],
  );

  const choosePromotion = useCallback(
    (p: Promotion) => {
      if (!promotion) return;
      setPromotion(null);
      void submit(promotion.from, promotion.to, p);
    },
    [promotion, submit],
  );

  const resign = useCallback(async () => {
    if (!game) return;
    try {
      setGame(await api.resign(game.token));
    } catch (e) {
      setError(toApiError(e));
    }
  }, [api, game]);

  return {
    game,
    fen,
    position,
    lastMove,
    selected,
    promotion,
    thinking,
    error,
    myTurn,
    captured: capturedPieces(fen),
    newGame,
    tryMove,
    clickSquare,
    choosePromotion,
    cancelPromotion: () => setPromotion(null),
    resign,
  };
}
