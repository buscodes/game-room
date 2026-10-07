import { useMemo } from "react";
import type { Lang } from "./lang";
import { lookup, useI18n } from "./I18nProvider";

type Params = Record<string, string | number>;

/**
 * Bir modülün kendi sözlüğünü (tr/en) geçerli dile bağlayan hook üretir.
 * Ortak modül hiçbir oyunun metnini bilmez; her modül kendi metnini taşır.
 *
 *   export const useChessText = createFeatureText({ tr, en });
 *   const { t, dict } = useChessText();  t("title", { d })
 */
export function createFeatureText<D extends object>(dicts: Record<Lang, D>) {
  return function useFeatureText() {
    const { lang } = useI18n();
    return useMemo(() => {
      const dict = dicts[lang];
      return { dict, t: (key: string, params?: Params) => lookup(dict, key, params) };
    }, [lang]);
  };
}
