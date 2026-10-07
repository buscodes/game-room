import { motion } from "framer-motion";

/** 0..1 arası değeri animasyonlu bir çubukla gösterir. */
export function ProbabilityBar({ value, highlight = false }: { value: number; highlight?: boolean }) {
  return (
    <div className="mt-0.5 h-1.5 overflow-hidden rounded bg-white/10">
      <motion.div
        className={highlight ? "h-full bg-gradient-to-r from-amber-300 to-amber-500" : "h-full bg-zinc-400/60"}
        initial={{ width: 0 }}
        animate={{ width: `${Math.max(value * 100, 1)}%` }}
        transition={{ duration: 0.5 }}
      />
    </div>
  );
}
