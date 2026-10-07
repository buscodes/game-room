import { LANGS } from "../i18n/lang";
import { useI18n } from "../i18n/I18nProvider";

/** TR / EN seçici. */
export function LanguageSwitch() {
  const { lang, setLang } = useI18n();
  return (
    <div
      className="flex rounded-xl border border-white/10 bg-white/5 p-0.5 text-xs font-semibold"
      role="group"
      aria-label="Language"
    >
      {LANGS.map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          aria-pressed={lang === l}
          className={`rounded-lg px-2.5 py-1 uppercase transition ${lang === l ? "bg-white text-zinc-900 shadow" : "text-zinc-400 hover:text-white"}`}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
