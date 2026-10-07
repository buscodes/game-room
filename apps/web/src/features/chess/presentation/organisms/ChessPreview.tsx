import { motion } from "framer-motion";

/** Lobi kartındaki animasyonlu satranç görseli. */
export function ChessPreview() {
  return (
    <div className="relative flex h-44 items-end justify-center gap-1 overflow-hidden bg-[url('/assets/chess/board/board.jpg')] bg-[length:200px] pb-4">
      {["wR", "wN", "wB", "wQ", "wK", "bP"].map((p, i) => (
        <motion.img
          key={p}
          src={`/assets/chess/pieces/${p}.svg`}
          className="h-16 w-16 drop-shadow-[0_6px_6px_rgba(0,0,0,0.6)]"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 * i }}
        />
      ))}
    </div>
  );
}
