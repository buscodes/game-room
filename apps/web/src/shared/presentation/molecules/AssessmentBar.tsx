import { motion } from "framer-motion";
import { useI18n } from "../i18n/I18nProvider";

/** -1 (sen öndesin) .. 1 (rakip önde) arası konum değerlendirmesi. */
export function AssessmentBar({ value }: { value: number }) {
  const { t } = useI18n();
  const pct = ((value + 1) / 2) * 100;
  return (
    <div className="mb-3">
      <div className="mb-1 flex justify-between text-[11px] text-zinc-400">
        <span>{t("aiPanel.youAhead")}</span>
        <span>{t("aiPanel.assessment")}</span>
        <span>{t("aiPanel.aiAhead")}</span>
      </div>
      <div className="relative h-2 rounded bg-gradient-to-r from-emerald-400/60 via-zinc-500/40 to-rose-400/60">
        <motion.div
          className="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-ink bg-accent"
          style={{ left: `${pct}%` }}
          animate={{ left: `${pct}%` }}
          transition={{ type: "spring", stiffness: 120, damping: 16 }}
        />
      </div>
    </div>
  );
}
