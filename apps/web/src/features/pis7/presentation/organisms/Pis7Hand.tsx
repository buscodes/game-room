import { AnimatePresence } from "framer-motion";
import type { Card } from "@salon/domain";
import { PlayingCard } from "../../../../shared/presentation/atoms/PlayingCard";
import { CARD_WIDTH } from "../layout";

const PLAYABLE_GLOW = "0 0 0 3px #facc15, 0 10px 20px rgba(0,0,0,.5)";
const HINT_GLOW = "0 0 0 4px #38bdf8, 0 0 24px #38bdf8";
const DIMMED = "brightness(0.55) saturate(0.6)";

/** Kart sayısı arttıkça el sıkışır, böylece masaya sığar. */
const overlapFor = (n: number) => (n <= 7 ? 8 : -Math.min(62, 12 + (n - 7) * 7));

/**
 * "Yardımlı" el: atılabilir kartlar parlar ve yükselir, uymayanlar soluklaşır,
 * ipucunun önerdiği kart mavi çerçeveyle işaretlenir.
 */
export function Pis7Hand({
  cards,
  myTurn,
  playable,
  hintedId,
  titleFor,
  onPlay,
}: {
  cards: Card[];
  myTurn: boolean;
  playable: (c: Card) => boolean;
  hintedId?: string;
  titleFor: (c: Card) => string;
  onPlay: (c: Card) => void;
}) {
  const overlap = overlapFor(cards.length);
  return (
    <div className="flex flex-1 justify-center pt-6">
      <AnimatePresence>
        {cards.map((c, i) => {
          const ok = myTurn && playable(c);
          return (
            <PlayingCard
              key={c.id}
              card={c}
              title={titleFor(c)}
              className={`${CARD_WIDTH} ${ok ? "cursor-pointer" : "cursor-not-allowed"}`}
              style={{
                marginLeft: i ? overlap : 0,
                zIndex: i,
                filter: myTurn && !ok ? DIMMED : undefined,
                boxShadow: hintedId === c.id ? HINT_GLOW : ok ? PLAYABLE_GLOW : undefined,
              }}
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: ok ? -14 : 0, opacity: 1 }}
              exit={{ y: -200, opacity: 0 }}
              whileHover={ok ? { y: -30 } : undefined}
              onClick={() => onPlay(c)}
            />
          );
        })}
      </AnimatePresence>
    </div>
  );
}
