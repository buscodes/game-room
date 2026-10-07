import { AnimatePresence, type Variants } from "framer-motion";
import type { Card, PlayerIndex } from "@salon/domain";
import { CardSlot, PlayingCard, jitter } from "../../../../shared/presentation/atoms/PlayingCard";
import { usePistiText } from "../i18n";
import { CARD_WIDTH } from "../layout";

/** Toplanan kartlar toplayanın tarafına doğru uçar. */
const TABLE_VARIANTS: Variants = {
  collected: (who: PlayerIndex) => ({
    x: 380,
    y: who === 0 ? 200 : -200,
    opacity: 0,
    rotate: 30,
    transition: { duration: 0.45 },
  }),
};

/**
 * Masadaki yığın: kartlar geldiği yönden iner, toplanınca toplayanın tarafına uçar.
 * `null` kart kapalı (başlangıçtaki 3 kart).
 */
export function TablePile({
  cards,
  landFrom,
  collector,
}: {
  cards: (Card | null)[];
  landFrom: "top" | "bottom";
  collector: PlayerIndex;
}) {
  const { t } = usePistiText();
  return (
    <div className={`relative ${CARD_WIDTH}`}>
      <CardSlot />
      <AnimatePresence custom={collector}>
        {cards.map((c, i) => {
          const j = c ? jitter(c.id) : { rotate: (i - 1) * 5, x: (i - 1) * 3, y: 0 };
          return (
            <PlayingCard
              key={c ? c.id : `down-${i}`}
              card={c}
              className="absolute inset-0 w-full"
              style={{ zIndex: i }}
              custom={collector}
              initial={{ y: landFrom === "bottom" ? 260 : -260, opacity: 0, rotate: 0 }}
              animate={{ y: j.y, x: j.x, rotate: j.rotate, opacity: 1 }}
              variants={TABLE_VARIANTS}
              exit="collected"
              transition={{ type: "spring", stiffness: 170, damping: 20 }}
            />
          );
        })}
      </AnimatePresence>
      <div className="absolute -bottom-7 left-0 right-0 text-center text-xs text-emerald-100/80">
        {cards.length ? t("tableCount", { n: cards.length }) : t("tableEmpty")}
      </div>
    </div>
  );
}
