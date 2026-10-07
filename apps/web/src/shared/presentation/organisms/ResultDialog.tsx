import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { Overlay } from "../molecules/Overlay";

/** Oyun/el sonu penceresi: başlık, isteğe bağlı içerik ve eylem düğmeleri. */
export function ResultDialog({
  title,
  children,
  actions,
  width = "w-[min(92%,380px)]",
  rounded = "",
}: {
  title: string;
  children?: ReactNode;
  actions: ReactNode;
  width?: string;
  rounded?: string;
}) {
  return (
    <Overlay className={`overflow-y-auto p-3 ${rounded}`}>
      <motion.div
        className={`panel p-6 text-center ${width}`}
        initial={{ y: 30, scale: 0.95 }}
        animate={{ y: 0, scale: 1 }}
      >
        <h2 className="font-display text-2xl font-semibold tracking-tight text-white">{title}</h2>
        {children}
        <div className="mt-5 flex justify-center gap-3">{actions}</div>
      </motion.div>
    </Overlay>
  );
}
