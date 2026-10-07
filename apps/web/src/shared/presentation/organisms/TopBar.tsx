import { Link } from "react-router-dom";
import { useI18n } from "../i18n/I18nProvider";
import { Button } from "../atoms/Button";
import { LanguageSwitch } from "../molecules/LanguageSwitch";

export function TopBar({ title, onHelp }: { title?: string; onHelp?: () => void }) {
  const { t } = useI18n();
  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-[#0a0d12]/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <Link to="/" className="group flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-accent to-emerald-600 shadow-lg shadow-emerald-500/20 transition group-hover:scale-105">
            <img src="/assets/chess/pieces/wN.svg" alt="" className="h-6 w-6" />
          </span>
          <span className="font-display text-lg font-semibold tracking-tight text-white">{t("common.siteTitle")}</span>
        </Link>
        {title && <span className="hidden text-sm font-medium text-zinc-400 md:block">{title}</span>}
        <div className="flex items-center gap-2">
          {onHelp && (
            <Button size="sm" onClick={onHelp}>
              <span className="grid h-4 w-4 place-items-center rounded-full bg-white/10 text-[10px]">?</span>
              {t("common.howToPlay")}
            </Button>
          )}
          <LanguageSwitch />
        </div>
      </div>
    </header>
  );
}
