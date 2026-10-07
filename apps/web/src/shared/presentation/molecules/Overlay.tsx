import { motion } from "framer-motion";
import type { ReactNode } from "react";

/** Oyun alanının üstüne gelen karartma + ortalanmış içerik (terfi, sonuç, el sonu …). */
export function Overlay({
  children,
  className = "",
  dim = "bg-black/55",
}: {
  children: ReactNode;
  className?: string;
  dim?: string;
}) {
  return (
    <motion.div
      className={`absolute inset-0 z-20 flex items-center justify-center ${dim} ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {children}
    </motion.div>
  );
}
