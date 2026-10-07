import { motion } from "framer-motion";

/** Oyun alanının ortasında kısa süreli büyük yazı ("Pişti! +10", "Pis 7! +3"). */
export function BigToast({ text, className = "text-accent" }: { text: string; className?: string }) {
  return (
    <motion.div
      className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center"
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.3 }}
    >
      <span
        className={`font-display text-5xl font-extrabold drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)] sm:text-7xl ${className}`}
      >
        {text}
      </span>
    </motion.div>
  );
}
