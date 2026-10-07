import type { HandScore } from "@salon/domain";
import { useI18n } from "../../../../shared/presentation/i18n/I18nProvider";
import { usePistiText } from "../i18n";

const ROWS: (keyof HandScore)[] = ["cards", "majority", "pistis", "aces", "jacks", "clubs2", "diamonds10", "total"];

export function ScoreSheet({ score }: { score: HandScore }) {
  const { t } = useI18n();
  const { t: pt } = usePistiText();
  return (
    <table className="w-full text-sm tabular-nums">
      <thead>
        <tr className="text-zinc-400">
          <th className="py-1 text-left font-normal" />
          <th className="py-1 text-right font-semibold">{t("common.you")}</th>
          <th className="py-1 text-right font-semibold">{t("common.cpu")}</th>
        </tr>
      </thead>
      <tbody>
        {ROWS.map((k) => (
          <tr key={k} className={k === "total" ? "border-t border-white/15 font-bold text-accent" : ""}>
            <td className="py-0.5 text-left">{pt(`sheet.${k}`)}</td>
            <td className="py-0.5 text-right">{score[k][0]}</td>
            <td className="py-0.5 text-right">{score[k][1]}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
