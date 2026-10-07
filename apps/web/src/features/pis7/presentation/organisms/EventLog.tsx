import { motion } from "framer-motion";
import { Panel, PanelTitle } from "../../../../shared/presentation/atoms/Panel";

/** Olay günlüğü; oyuncunun satırları yeşil, rakiplerinki kırmızı, genel olaylar gri. */
export function EventLog({
  title,
  entries,
}: {
  title: string;
  entries: { id: number; text: string; player?: number }[];
}) {
  return (
    <Panel>
      <PanelTitle>{title}</PanelTitle>
      <ul className="max-h-48 space-y-1 overflow-y-auto text-xs">
        {entries.map((e) => (
          <motion.li
            key={e.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className={e.player === undefined ? "text-zinc-400" : e.player === 0 ? "text-emerald-200" : "text-rose-200"}
          >
            {e.text}
          </motion.li>
        ))}
      </ul>
    </Panel>
  );
}
