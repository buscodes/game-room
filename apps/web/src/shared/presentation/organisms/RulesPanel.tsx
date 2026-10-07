import { useI18n } from "../i18n/I18nProvider";

/** Açılır-kapanır kural listesi. */
export function RulesPanel({ rules, open = false }: { rules: readonly string[]; open?: boolean }) {
  const { t } = useI18n();
  return (
    <details className="panel p-4 text-sm text-zinc-300" open={open}>
      <summary className="cursor-pointer font-display text-base font-semibold text-white">{t("common.rules")}</summary>
      <ul className="mt-2 list-disc space-y-1 pl-4">
        {rules.map((r) => (
          <li key={r}>{r}</li>
        ))}
      </ul>
    </details>
  );
}
