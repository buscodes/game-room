import { useCallback } from "react";
import { whyNotPlayable, type Card } from "@salon/domain";
import type { Pis7GameDTO, Pis7Hint } from "@salon/contracts";
import type { Pis7LogEvent } from "../../application/usePis7Game";
import { useI18n } from "../../../../shared/presentation/i18n/I18nProvider";
import { useFormat } from "../../../../shared/presentation/i18n/useFormat";
import { usePis7Text } from ".";

/** Pis Yedili için kullanıcının dilinde metinler: oyuncu adları, günlük, yardım, ipucu. */
export function usePis7Narration(game: Pis7GameDTO | null, players: number, busy: boolean) {
  const { t } = useI18n();
  const { t: p7 } = usePis7Text();
  const f = useFormat();
  const next = (p: number) => (p + 1) % players;

  const name = useCallback(
    (p: number) => (p === 0 ? t("common.you") : players === 2 ? t("common.cpu") : t("common.botN", { n: p })),
    [t, players],
  );

  const describe = (e: Pis7LogEvent): string => {
    switch (e.type) {
      case "newGame":
        return p7("log.newGame", { p: e.players, c: f.card(e.top) });
      case "play": {
        const base =
          e.player === 0
            ? p7("log.playYou", { c: f.card(e.card) })
            : p7("log.playOther", { name: name(e.player), c: f.card(e.card) });
        const victim = next(e.player);
        if (e.effect === "seven")
          return `${base} → ${victim === 0 ? p7("log.sevenToYou") : p7("log.sevenTo", { victim: name(victim) })}`;
        if (e.effect === "eight")
          return `${base} → ${victim === 0 ? p7("log.eightSkipYou") : p7("log.eightSkip", { victim: name(victim) })}`;
        if (e.effect === "jack") return `${base} → ${p7("log.jack", { s: f.suit(e.suit) })}`;
        return base;
      }
      case "draw":
        if (e.penalty)
          return e.player === 0
            ? p7("log.drawPenaltyYou", { n: e.count })
            : p7("log.drawPenaltyOther", { name: name(e.player), n: e.count });
        return e.player === 0 ? p7("log.drawYou") : p7("log.drawOther", { name: name(e.player) });
      case "pass":
        return e.player === 0 ? p7("log.passYou") : p7("log.passOther", { name: name(e.player) });
      case "reshuffle":
        return p7("log.reshuffle");
      case "roundOver":
        return e.winner === 0 ? p7("log.roundYou") : p7("log.roundOther", { name: name(e.winner) });
    }
  };

  const need = game ? p7("help.need", { s: f.suit(game.suit), r: f.rank(game.top.rank) }) : "";

  /** Kart neden atılamıyor? (kartın üzerine gelince gösterilir; kural domain'den gelir) */
  const reasonFor = (c: Card): string | null => {
    if (!game) return null;
    switch (whyNotPlayable(game, 0, c)?.code) {
      case undefined:
        return null;
      case "notYourTurn":
        return p7("reason.notYourTurn");
      case "onlyDrawnCard":
        return p7("reason.onlyDrawn");
      case "penaltyPending":
        return p7("reason.penalty");
      default:
        return p7("reason.noMatch", { s: f.suit(game.suit), r: f.rank(game.top.rank) });
    }
  };

  /** Yardım çubuğundaki "şu an ne yapabilirsin" cümlesi. */
  const helpText = (() => {
    if (!game) return "";
    if (game.phase !== "playing") return p7("help.roundOver");
    if (busy || game.turn !== 0) return p7("help.othersTurn", { name: name(game.turn === 0 ? 1 : game.turn) });
    const n = game.playable.length;
    if (game.drawnCardId) return p7("help.drawn");
    if (game.pendingDraw > 0)
      return n ? p7("help.penaltyCan", { n: game.pendingDraw }) : p7("help.penaltyCant", { n: game.pendingDraw });
    return n ? p7("help.canPlay", { need, n }) : p7("help.cantPlay", { need });
  })();

  /** İpucu metni: "Kupa 7 at — rakibe 3 kart çektirir …" */
  const hintText = (h: Pis7Hint) => {
    const { label, description } = f.option(h.option);
    const head = h.action === "play" ? t("subjects.play", { label }) : label;
    return description ? `${head} — ${description}` : head;
  };

  return { name, describe, reasonFor, helpText, hintText };
}
