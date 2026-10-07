import type { Preferences } from "../../application/ports/preferences";

/** `Preferences` portunun localStorage uygulaması (gizli pencerede sessizce yok sayılır). */
export const localPreferences: Preferences = {
  get(key) {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set(key, value) {
    try {
      if (value === null) localStorage.removeItem(key);
      else localStorage.setItem(key, value);
    } catch {
      /* depolama kapalı olabilir */
    }
  },
};
