import { DIFFICULTIES, type Difficulty } from "@salon/domain";
import { useI18n } from "../i18n/I18nProvider";
import { useFormat } from "../i18n/useFormat";
import { OptionGroup } from "./OptionGroup";

export function DifficultyPicker({ value, onChange }: { value: Difficulty; onChange: (d: Difficulty) => void }) {
  const { t } = useI18n();
  const f = useFormat();
  return (
    <div>
      <OptionGroup value={value} onChange={onChange} options={DIFFICULTIES.map((d) => [d, f.difficulty(d)] as const)} />
      <p className="mt-2 text-xs text-zinc-400">{t(`difficultyHint.${value}`)}</p>
    </div>
  );
}
