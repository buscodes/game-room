import { useMemo } from "react";
import type { BotOption, BotSubject, Card, Difficulty, Rank, Reason, Suit } from "@salon/domain";
import type { ApiError } from "../../application/errors";
import { useI18n } from "./I18nProvider";

/**
 * Sunucudan/domain'den gelen dile bağımsız değerleri (kart, seçenek, gerekçe, hata)
 * kullanıcının diline çeviren yardımcılar.
 */
export function useFormat() {
  const { t, dict } = useI18n();
  return useMemo(() => {
    const suit = (s: Suit) => dict.names.suits[s];
    const rank = (r: Rank) => dict.names.ranks[r];
    const card = (c: Card) => t("names.cardName", { suit: suit(c.suit), rank: rank(c.rank) });
    const difficulty = (d: Difficulty) => dict.names.difficulty[d];

    const subject = (s: BotSubject): string => {
      switch (s.kind) {
        case "move":
          return s.san;
        case "card":
          return card(s.card);
        case "jack":
          return t("subjects.jack", { card: card(s.card), suit: suit(s.suit) });
        case "draw":
          return s.count > 1 ? t("subjects.drawN", { n: s.count }) : t("subjects.draw");
        case "pass":
          return t("subjects.pass");
      }
    };

    /** Gerekçe parametrelerindeki kodları (taş, değer, tür) adlarına çevirir. */
    const reason = (r: Reason): string => {
      const params: Record<string, string | number> = { ...r.params };
      if (typeof params.piece === "string")
        params.piece = dict.names.pieces[params.piece as keyof typeof dict.names.pieces];
      if (typeof params.rank === "string") params.rank = rank(params.rank as Rank);
      if (typeof params.suit === "string") params.suit = suit(params.suit as Suit);
      return t(`reasons.${r.code}`, params);
    };
    const reasons = (list: Reason[], sep = ", ") => list.map(reason).join(sep);

    const option = (o: BotOption) => ({ label: subject(o.subject), description: reasons(o.reasons) || undefined });
    const error = (e: ApiError | null | undefined) => (e ? t(`errors.${e.code}`, e.params) : null);

    return { suit, rank, card, difficulty, subject, reason, reasons, option, error };
  }, [t, dict]);
}
