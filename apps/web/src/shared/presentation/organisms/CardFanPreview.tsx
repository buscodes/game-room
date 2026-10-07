import { motion } from "framer-motion";

/** Yeşil çuha üzerinde yelpaze şeklinde açılan kartlar. */
export function CardFanPreview({
  cards,
  spread,
  tilt,
  badge,
  rise = false,
}: {
  cards: string[];
  spread: number;
  tilt: number;
  badge?: string;
  rise?: boolean;
}) {
  const mid = (cards.length - 1) / 2;
  return (
    <div className="felt relative flex h-44 items-center justify-center overflow-hidden">
      {cards.map((c, i) => (
        <motion.img
          key={c}
          src={`/assets/cards/${c}.svg`}
          className="playing-card absolute h-32"
          initial={rise ? { y: 60, opacity: 0 } : { rotate: 0, x: 0, opacity: 0 }}
          animate={{ y: 0, x: (i - mid) * spread, rotate: (i - mid) * tilt, opacity: 1 }}
          transition={{ delay: 0.1 * i, type: "spring", stiffness: 120 }}
        />
      ))}
      {badge && (
        <span className="absolute right-3 top-3 rounded-full bg-sky-500/80 px-2 py-0.5 text-xs font-semibold text-white">
          {badge}
        </span>
      )}
    </div>
  );
}
