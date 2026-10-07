import { AnimatePresence } from "framer-motion";
import type { Card } from "@salon/domain";
import { PlayingCard } from "../../../../shared/presentation/atoms/PlayingCard";
import { useFormat } from "../../../../shared/presentation/i18n/useFormat";
import { CARD_WIDTH } from "../layout";

const SHADOW = "0 12px 24px rgba(0,0,0,.5)";
const CAPTURE_GLOW = `0 0 0 3px #facc15, ${SHADOW}`;

/** Oyuncunun eli; sırası geldiğinde kartlar üzerine gelince yükselir, `highlight` olanlar parlar. */
export function PlayerHand({
  cards,
  enabled,
  highlight,
  onPlay,
}: {
  cards: Card[];
  enabled: boolean;
  highlight: (c: Card) => boolean;
  onPlay: (c: Card) => void;
}) {
  const f = useFormat();
  return (
    <div className="flex justify-center gap-2 sm:gap-3">
      <AnimatePresence>
        {cards.map((c, i) => (
          <PlayingCard
            key={c.id}
            card={c}
            className={`${CARD_WIDTH} ${enabled ? "cursor-pointer" : "opacity-90"}`}
            initial={{ y: 120, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -160, opacity: 0 }}
            transition={{ delay: i * 0.05 }}
            whileHover={enabled ? { y: -18, boxShadow: highlight(c) ? CAPTURE_GLOW : SHADOW } : undefined}
            onClick={() => onPlay(c)}
            title={f.card(c)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
