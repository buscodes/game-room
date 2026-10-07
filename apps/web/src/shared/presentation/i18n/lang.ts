export type Lang = "tr" | "en";
export const LANGS: readonly Lang[] = ["tr", "en"];
export const DEFAULT_LANG: Lang = "en";
export const isLang = (x: unknown): x is Lang => x === "tr" || x === "en";
