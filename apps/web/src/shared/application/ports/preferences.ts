import { createDependency } from "../createDependency";

/** Kullanıcı tercihleri (dil, "bir daha gösterme" …). Altyapıda tarayıcı depolamasıyla uygulanır. */
export interface Preferences {
  get(key: string): string | null;
  set(key: string, value: string | null): void;
}

export const PreferencesDep = createDependency<Preferences>("Preferences");
