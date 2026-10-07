import { useCallback, useEffect, useRef, useState } from "react";
import type { Card, Difficulty, Pis7Event, Suit } from "@salon/domain";
import type { Pis7GameDTO, Pis7Hint } from "@salon/contracts";
import { Pis7ApiDep } from "./ports";
import { toApiError, type ApiError } from "../../../shared/application/errors";

import { thinkingTime, type Duration } from "../../../shared/application/bot-thinking";
import { sleep } from "../../../shared/application/sleep";

/** Botun kart çekme / pas geçme adımı: kart atmaktan daha çabuk karar verilir. */
const BOT_QUICK_ACTION: Duration = { min: 350, max: 650 };

/** Animasyon süreleri (ms). */
const TIMING = {
  /** "Pis 7!" yazısının ekranda kalma süresi */
  toast: 1000,
  /** Son olaydan sonra sunucu durumunu uygulamadan önce */
  settle: 250,
};

/** Masadaki anlık görünüm (animasyon sırasında sunucu durumundan önce güncellenir). */
export interface Pis7Display {
  /** Atılan son birkaç kart (üstteki en sonda) */
  pile: Card[];
  suit: Suit;
  counts: number[];
  pendingDraw: number;
}

/** Olay günlüğü kaydı: sunucu olayları + oyun başlangıcı. Metne sayfa çevirir. */
export type Pis7LogEvent = Pis7Event | { type: "newGame"; players: number; top: Card };

/** 7 atıldığında kısa bildirim: ceza sana mı geldi? */
export interface Pis7Toast {
  sevenToYou: boolean;
}

/** Pis Yedili oyununun durumu, animasyon akışı ve kullanıcı eylemleri. */
export function usePis7Game(difficulty: Difficulty, target: number, playerCount: number) {
  const api = Pis7ApiDep.use();
  const [game, setGame] = useState<Pis7GameDTO | null>(null);
  const [display, setDisplay] = useState<Pis7Display | null>(null);
  const [hand, setHand] = useState<Card[]>([]);
  const [busy, setBusy] = useState(false);
  const [log, setLog] = useState<{ id: number; event: Pis7LogEvent }[]>([]);
  const [hint, setHint] = useState<Pis7Hint | null>(null);
  const [hintLoading, setHintLoading] = useState(false);
  const [jackCard, setJackCard] = useState<Card | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [toast, setToast] = useState<Pis7Toast | null>(null);
  const started = useRef(false);
  const logId = useRef(0);

  const players = game?.players ?? playerCount;
  const next = useCallback((p: number) => (p + 1) % players, [players]);

  const addLog = useCallback((event: Pis7LogEvent) => {
    setLog((l) => [{ id: ++logId.current, event }, ...l].slice(0, 60));
  }, []);

  const apply = useCallback((g: Pis7GameDTO, resetPile = false) => {
    setGame(g);
    setHand(g.hand);
    setDisplay((d) => ({
      pile:
        resetPile || !d ? [g.top] : d.pile[d.pile.length - 1]?.id === g.top.id ? d.pile : [...d.pile, g.top].slice(-5),
      suit: g.suit,
      counts: g.counts,
      pendingDraw: g.pendingDraw,
    }));
  }, []);

  const flash = useCallback(async (t: Pis7Toast) => {
    setToast(t);
    await sleep(TIMING.toast);
    setToast(null);
  }, []);

  /** Sunucudan gelen olayları sırayla canlandırır. */
  const replay = useCallback(
    async (g: Pis7GameDTO) => {
      const bump = (d: Pis7Display | null, p: number, delta: number): Pis7Display | null =>
        d && { ...d, counts: d.counts.map((v, i) => (i === p ? Math.max(0, v + delta) : v)) };
      for (const e of g.events) {
        const bot = "player" in e && e.player !== 0;
        if (bot) await sleep(e.type === "play" ? thinkingTime() : thinkingTime(BOT_QUICK_ACTION));
        if (e.type === "play") {
          setDisplay((d) => {
            const b = bump(d, e.player, e.player === 0 ? 0 : -1);
            return (
              b && {
                ...b,
                // kendi kartın zaten iyimser olarak yığına eklendi
                pile: b.pile[b.pile.length - 1]?.id === e.card.id ? b.pile : [...b.pile, e.card].slice(-5),
                suit: e.suit,
                pendingDraw: e.effect === "seven" ? b.pendingDraw + 3 : b.pendingDraw,
              }
            );
          });
          if (e.effect === "seven") void flash({ sevenToYou: next(e.player) === 0 });
        } else if (e.type === "draw") {
          setDisplay((d) => {
            const b = bump(d, e.player, e.player === 0 ? 0 : e.count);
            return b && { ...b, pendingDraw: e.penalty ? 0 : b.pendingDraw };
          });
        }
        addLog(e);
      }
      await sleep(TIMING.settle);
      apply(g);
    },
    [apply, addLog, flash, next],
  );

  const run = useCallback(
    async (fn: () => Promise<Pis7GameDTO>) => {
      setBusy(true);
      setError(null);
      setHint(null);
      try {
        await replay(await fn());
      } catch (e) {
        setError(toApiError(e));
        if (game) apply(game);
      } finally {
        setBusy(false);
      }
    },
    [replay, apply, game],
  );

  const newGame = useCallback(async () => {
    setBusy(true);
    setError(null);
    setHint(null);
    setLog([]);
    try {
      const g = await api.create(difficulty, target, playerCount);
      apply(g, true);
      addLog({ type: "newGame", players: g.players, top: g.top });
    } catch (e) {
      setError(toApiError(e));
    } finally {
      setBusy(false);
    }
  }, [api, difficulty, target, playerCount, apply, addLog]);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    void newGame();
  }, [newGame]);

  const myTurn = !!game && game.phase === "playing" && game.turn === 0 && !busy;

  /** Kart oynar; vale ise önce tür seçimi istenir. */
  const playCard = (card: Card, suit?: Suit) => {
    if (!game || !myTurn || !game.playable.includes(card.id)) return;
    if (card.rank === "J" && !suit) {
      setJackCard(card);
      return;
    }
    setJackCard(null);
    setHand((h) => h.filter((c) => c.id !== card.id));
    setDisplay((d) => d && { ...d, pile: [...d.pile, card].slice(-5) });
    void run(() => api.play(game.token, card.id, suit));
  };

  const askHint = async () => {
    if (!game || !myTurn) return;
    setHintLoading(true);
    try {
      setHint(await api.hint(game.token));
    } catch (e) {
      setError(toApiError(e));
    } finally {
      setHintLoading(false);
    }
  };

  return {
    game,
    display,
    hand,
    busy,
    log,
    hint,
    hintLoading,
    jackCard,
    error,
    toast,
    myTurn,
    players,
    next,
    newGame,
    playCard,
    cancelJack: () => setJackCard(null),
    askHint,
    draw: () => game && void run(() => api.draw(game.token)),
    pass: () => game && void run(() => api.pass(game.token)),
    nextRound: () => {
      if (!game) return;
      setDisplay(null);
      void run(() => api.nextRound(game.token));
    },
  };
}
