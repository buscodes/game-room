import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { PreferencesDep } from "../../application/ports/preferences";
import { DEFAULT_LANG, isLang, type Lang } from "./lang";
import { tr } from "./locales/tr";
import { en } from "./locales/en";

type Dict = typeof tr;
const DICTS: Record<Lang, Dict> = { tr, en };
const STORAGE_KEY = "salon.lang";

type Params = Record<string, string | number>;

/** "a.b.c" yolundaki metni bulur, {param}'ları doldurur. */
export function lookup(dict: object, key: string, params?: Params): string {
  const raw = key.split(".").reduce<unknown>((o, k) => (o as Record<string, unknown> | undefined)?.[k], dict);
  if (typeof raw !== "string") return key;
  return params ? raw.replace(/\{(\w+)\}/g, (_, k) => String(params[k] ?? `{${k}}`)) : raw;
}

interface I18nValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string, params?: Params) => string;
  /** Ortak sözlükten nesne okumak için (ör. kart adları) */
  dict: Dict;
}

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const preferences = PreferencesDep.use();
  const [lang, setLangState] = useState<Lang>(() => {
    const stored = preferences.get(STORAGE_KEY);
    return isLang(stored) ? stored : DEFAULT_LANG;
  });

  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = DICTS[lang].common.siteTitle;
  }, [lang]);

  const setLang = useCallback(
    (l: Lang) => {
      setLangState(l);
      preferences.set(STORAGE_KEY, l);
    },
    [preferences],
  );

  const value = useMemo<I18nValue>(
    () => ({ lang, setLang, t: (key, params) => lookup(DICTS[lang], key, params), dict: DICTS[lang] }),
    [lang, setLang],
  );
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const v = useContext(I18nContext);
  if (!v) throw new Error("useI18n must be used inside I18nProvider");
  return v;
}
