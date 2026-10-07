import type { CSSProperties, ReactNode } from "react";
import { motion } from "framer-motion";

/*
 * Tanıtım sahnelerinin görsel yapı taşları. Oyun modülleri kendi sahnelerini bunlarla kurar.
 */

export const Card = ({
  id,
  className = "",
  ...rest
}: { id: string; className?: string } & Parameters<typeof motion.img>[0]) => (
  <motion.img
    src={`/assets/cards/${id}.svg`}
    className={`playing-card absolute w-20 sm:w-24 ${className}`}
    draggable={false}
    {...rest}
  />
);
export const Piece = ({
  code,
  className = "",
  ...rest
}: { code: string; className?: string } & Parameters<typeof motion.img>[0]) => (
  <motion.img
    src={`/assets/chess/pieces/${code}.svg`}
    className={`absolute drop-shadow-[0_6px_6px_rgba(0,0,0,0.6)] ${className}`}
    draggable={false}
    {...rest}
  />
);
export const Pop = ({
  children,
  className = "",
  delay = 0,
  style,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  style?: CSSProperties;
}) => (
  // Dış katman konumlanır (translate sınıfları korunur), iç katman animasyonlanır.
  <div
    className={`absolute font-display font-extrabold drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)] ${className}`}
    style={style}
  >
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: [0, 1.3, 1], opacity: 1 }}
      transition={{ delay, duration: 0.6 }}
    >
      {children}
    </motion.div>
  </div>
);
export const Felt = ({ children }: { children: ReactNode }) => (
  <div className="felt relative h-full w-full overflow-hidden rounded-2xl">{children}</div>
);

export function ProbBars({ items, delay = 0.3 }: { items: [string, number][]; delay?: number }) {
  return (
    <div className="absolute inset-x-6 bottom-6 space-y-2 sm:inset-x-16">
      {items.map(([label, p], i) => (
        <div key={label} className="text-left text-sm">
          <div className="flex justify-between text-zinc-200">
            <span className={i === 0 ? "font-bold text-accent" : ""}>
              {i === 0 && "▶ "}
              {label}
            </span>
            <span>{Math.round(p * 100)}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded bg-white/10">
            <motion.div
              className={i === 0 ? "h-full bg-gradient-to-r from-amber-300 to-amber-500" : "h-full bg-zinc-400/60"}
              initial={{ width: 0 }}
              animate={{ width: `${p * 100}%` }}
              transition={{ delay: delay + i * 0.25, duration: 0.8 }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
