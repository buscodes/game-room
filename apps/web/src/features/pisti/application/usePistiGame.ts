import { useCallback, useEffect, useRef, useState } from "react";
import { makeCard, previewPlay, type Card, type Difficulty, type PistiKind, type PlayerIndex } from "@salon/domain";
import type { PistiGameDTO } from "@salon/contracts";
import { PistiApiDep } from "./ports";
import { toApiError, type ApiError } from "../../../shared/application/errors";

import { thinkingTime } from "../../../shared/application/bot-thinking";
import { sleep } from "../../../shared/application/sleep";

/** Animasyon süreleri (ms). */
const TIMING = {
  /** Kart masaya indikten sonra toplanmadan önce */
  beforeCollect: 550,
  /** Toplama animasyonu */
  collect: 300,
  /** "Pişti!" yazısının ekranda kalma süresi */
  toast: 1100,
  /** Son olaydan sonra sunucu durumunu uygulamadan önce */
  settle: 350,
};

/** Masadaki anlık görünüm (animasyon sırasında sunucu durumundan önce güncellenir). */
export interface PistiView {
  table: (Card | null)[];
  hand: Card[];
  opponentCount: number;
  /** Masaya en son gelen kartın geldiği yön */
  landFrom: "top" | "bottom";
  /** Masayı son toplayan (çıkış animasyonu yönü) */
  collector: PlayerIndex;
}

/** Ekranda kısa süre gösterilecek bildirim (metne sayfa çevirir). */
export interface PistiToast {
  player: PlayerIndex;
  kind: PistiKind;
}

/** Pişti oyununun durumu, animasyon akışı ve kullanıcı eylemleri. */
export function usePistiGame(difficulty: Difficulty, target: number) {
  const api = PistiApiDep.use();
  const [game, setGame] = useState<PistiGameDTO | null>(null);
  const [view, setView] = useState<PistiView>({ table: [], hand: [], opponentCount: 0, landFrom: "top", collector: 0 });
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<PistiToast | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const started = useRef(false);

  const applyDTO = useCallback((g: PistiGameDTO) => {
    setGame(g);
    setView((v) => ({ ...v, table: g.table, hand: g.hand, opponentCount: g.opponentCount }));
  }, []);

  const flash = useCallback(async (t: PistiToast) => {
    setToast(t);
    await sleep(TIMING.toast);
    setToast(null);
  }, []);

  const newGame = useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      applyDTO(await api.create(difficulty, target));
    } catch (e) {
      setError(toApiError(e));
    } finally {
      setBusy(false);
    }
  }, [api, difficulty, target, applyDTO]);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    void newGame();
  }, [newGame]);

  /** Sunucudan gelen olayları sırayla canlandırır, sonra son durumu uygular. */
  const replay = useCallback(
    async (g: PistiGameDTO, table: (Card | null)[], skipFirstLanding: boolean) => {
      let pile = table;
      for (const [i, e] of g.events.entries()) {
        if (!(i === 0 && skipFirstLanding)) {
          if (e.player === 1) {
            await sleep(thinkingTime());
            setView((v) => ({ ...v, opponentCount: Math.max(0, v.opponentCount - 1) }));
          }
          pile = [...pile, e.card];
          setView((v) => ({ ...v, table: pile, landFrom: e.player === 0 ? "bottom" : "top" }));
        }
        if (e.captured.length) {
          await sleep(TIMING.beforeCollect);
          pile = [];
          setView((v) => ({ ...v, table: pile, collector: e.player }));
          if (e.pisti) await flash({ player: e.player, kind: e.pisti });
          else await sleep(TIMING.collect);
        }
      }
      await sleep(TIMING.settle);
      applyDTO(g);
    },
    [applyDTO, flash],
  );

  const play = useCallback(
    async (card: Card) => {
      if (!game || busy || game.turn !== 0 || game.phase !== "playing") return;
      setBusy(true);
      setError(null);
      const before = view.table;
      setView((v) => ({
        ...v,
        hand: v.hand.filter((c) => c.id !== card.id),
        table: [...before, card],
        landFrom: "bottom",
      }));
      try {
        const g = await api.play(game.token, card.id);
        await replay(g, [...before, card], true);
      } catch (e) {
        setError(toApiError(e));
        applyDTO(game);
      } finally {
        setBusy(false);
      }
    },
    [api, game, busy, view.table, replay, applyDTO],
  );

  const nextHand = useCallback(async () => {
    if (!game) return;
    setBusy(true);
    try {
      const g = await api.nextHand(game.token);
      if (g.events.length) {
        // Bilgisayar başlıyorsa: önce dağıtılmış masayı göster, sonra onun kartını canlandır.
        const botCards = new Set(g.events.map((e) => e.card.id));
        const dealt = g.table.filter((c) => !c || !botCards.has(c.id));
        setGame(g);
        setView((v) => ({ ...v, table: dealt, hand: g.hand, opponentCount: g.opponentCount + g.events.length }));
        await replay(g, dealt, false);
      } else {
        applyDTO(g);
      }
    } catch (e) {
      setError(toApiError(e));
    } finally {
      setBusy(false);
    }
  }, [api, game, replay, applyDTO]);

  const myTurn = !!game && game.turn === 0 && game.phase === "playing" && !busy;

  /** Bu kart şu an masayı alır mı? (kolay seviyede ipucu olarak gösterilir) */
  const captures = useCallback(
    (card: Card) => {
      if (!view.table.some(Boolean)) return false;
      // Kapalı kartların değeri önemsiz: previewPlay yalnızca üst kartı ve masa boyunu kullanır.
      const table = view.table.map((c) => ({ card: c ?? makeCard("2", "S"), faceDown: !c }));
      return previewPlay(table, card).captures;
    },
    [view.table],
  );

  return { game, view, busy, toast, error, myTurn, newGame, play, nextHand, captures };
}
