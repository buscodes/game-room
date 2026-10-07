import { AnimatePresence, motion } from "framer-motion";
import type { Card, Suit } from "@salon/domain";
import { CardSlot, PlayingCard, jitter } from "../../../../shared/presentation/atoms/PlayingCard";
import { SuitIcon } from "../../../../shared/presentation/atoms/SuitIcon";
import { useFormat } from "../../../../shared/presentation/i18n/useFormat";
import { usePis7Text } from "../i18n";
import { CARD_WIDTH } from "../layout";

/** Atılan kartlar yığını; yanında geçerli tür ve bekleyen 7 cezası. */
export function DiscardPile({ pile, suit, pendingDraw }: { pile: Card[]; suit?: Suit; pendingDraw: number }) {
  const { t: p7 } = usePis7Text();
  const f = useFormat();
  return (
    <div className="relative">
      <div className={`relative ${CARD_WIDTH}`}>
        <CardSlot />
        <AnimatePresence>
          {pile.map((c, i) => {
            const j = jitter(c.id);
            return (
              <PlayingCard
                key={c.id}
                card={c}
                className="absolute inset-0 w-full"
                style={{ zIndex: i }}
                initial={{ y: -220, opacity: 0 }}
                animate={{ y: j.y, x: j.x, rotate: j.rotate, opacity: 1 }}
                transition={{ type: "spring", stiffness: 170, damping: 20 }}
              />
            );
          })}
        </AnimatePresence>
      </div>
      {suit && (
        <div className="absolute -right-16 top-1/2 flex -translate-y-1/2 flex-col items-center gap-2 sm:-right-20">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 text-3xl shadow-lg"
            title={p7("currentSuit", { s: f.suit(suit) })}
          >
            <SuitIcon suit={suit} />
          </div>
          <AnimatePresence>
            {pendingDraw > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="rounded-full bg-red-600 px-2.5 py-1 text-sm font-bold text-white shadow-lg"
              >
                +{pendingDraw}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
