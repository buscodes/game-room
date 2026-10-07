import { AnimatePresence } from "framer-motion";
import { PlayingCard } from "../../../../shared/presentation/atoms/PlayingCard";
import { CARD_WIDTH } from "../layout";

/** Rakibin kapalı eli (yelpaze). */
export function OpponentHand({ count }: { count: number }) {
  return (
    <div className="flex justify-center">
      <AnimatePresence>
        {Array.from({ length: count }).map((_, i) => (
          <PlayingCard
            key={`opp-${i}`}
            card={null}
            className={`${CARD_WIDTH} -ml-8 first:ml-0`}
            initial={{ y: -80, opacity: 0 }}
            animate={{ y: 0, opacity: 1, rotate: (i - 1.5) * 4 }}
            exit={{ y: 60, opacity: 0 }}
            transition={{ delay: i * 0.06 }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
