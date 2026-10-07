import type { BotDecision } from "@salon/domain";
import { useI18n } from "../i18n/I18nProvider";
import { useFormat } from "../i18n/useFormat";
import { Panel, PanelTitle } from "../atoms/Panel";
import { PulseDot } from "../atoms/PulseDot";
import { AssessmentBar } from "../molecules/AssessmentBar";
import { DecisionRow } from "../molecules/DecisionRow";

/** "Rakibin düşüncesi": botun son kararındaki adaylar, olasılıkları ve konum değerlendirmesi. */
export function AiPanel({ ai, thinking, title }: { ai?: BotDecision; thinking?: boolean; title?: string }) {
  const { t } = useI18n();
  const f = useFormat();
  return (
    <Panel className="text-sm">
      <div className="mb-3 flex items-center justify-between gap-2">
        <PanelTitle className="mb-0">{title ?? t("aiPanel.title")}</PanelTitle>
        {thinking && (
          <span className="flex items-center gap-2 text-xs text-amber-200">
            <PulseDot ping /> {t("aiPanel.thinking")}
          </span>
        )}
      </div>

      {!ai ? (
        <p className="text-zinc-400">{t("aiPanel.none")}</p>
      ) : (
        <>
          {ai.assessment !== undefined && <AssessmentBar value={ai.assessment} />}
          <ul className="space-y-1.5">
            {[...ai.options]
              .sort((a, b) => (b.probability ?? 0) - (a.probability ?? 0))
              .map((o) => {
                const { label, description } = f.option(o);
                return (
                  <DecisionRow
                    key={o.key}
                    label={label}
                    description={description}
                    probability={o.probability ?? 0}
                    chosen={o.key === ai.chosenKey}
                  />
                );
              })}
          </ul>
          {(ai.sampled || ai.onlyMove) && (
            <p className="mt-3 text-xs text-amber-200/90">
              ℹ {t(ai.onlyMove ? "aiPanel.noteOnlyMove" : "aiPanel.noteSampled")}
            </p>
          )}
        </>
      )}
    </Panel>
  );
}
