import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { Button } from "../atoms/Button";

/** Ana sayfadaki oyun kartı: görsel, başlık, ayarlar ve "Oyna" düğmesi (her zaman altta). */
export function GameCard({
  title,
  image,
  children,
  playLabel,
  onPlay,
}: {
  title: string;
  image: ReactNode;
  children: ReactNode;
  playLabel: string;
  onPlay: () => void;
}) {
  return (
    <motion.div
      className="panel flex flex-col p-5 transition-colors hover:border-white/15"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
    >
      <div className="overflow-hidden rounded-xl ring-1 ring-white/10">{image}</div>
      <h2 className="mt-5 font-display text-2xl font-semibold tracking-tight text-white">{title}</h2>
      {children}
      <div className="min-h-6 flex-1" />
      <Button variant="primary" size="lg" className="w-full" onClick={onPlay}>
        {playLabel}
      </Button>
    </motion.div>
  );
}
