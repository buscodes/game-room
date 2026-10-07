import { motion } from "framer-motion";
import { usePis7Text } from "../i18n";

/** İpucu kutusu: önerilen hamle ve gerekçesi. */
export function HintNotice({ text }: { text: string }) {
  const { t: p7 } = usePis7Text();
  return (
    <motion.div
      className="panel border-sky-400/40! p-3 text-sm"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
    >
      <span className="font-semibold text-sky-300">{p7("suggestion")} </span>
      {text}
    </motion.div>
  );
}
