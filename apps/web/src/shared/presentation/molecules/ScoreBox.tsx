import { motion } from "framer-motion";

/** Etiket + büyük sayı; değer değişince hafifçe zıplar. */
export function ScoreBox({ label, value, active = false }: { label: string; value: number; active?: boolean }) {
  return (
    <div className={`rounded-lg py-2 ${active ? "bg-amber-400/15 ring-1 ring-amber-300/50" : "bg-white/5"}`}>
      <div className="text-xs text-zinc-400">{label}</div>
      <motion.div
        key={value}
        initial={{ scale: 1.3 }}
        animate={{ scale: 1 }}
        className="font-display text-2xl font-bold text-accent"
      >
        {value}
      </motion.div>
    </div>
  );
}
