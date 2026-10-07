import { useCallback, useState } from "react";
import { PreferencesDep } from "../../../application/ports/preferences";

export const onboardingKey = (id: string) => `salon.onboarding.${id}.hidden`;

/** Oyuna girerken tanıtımı gösterir ("bir daha gösterme" seçilmediyse). */
export function useOnboarding(id: string) {
  const preferences = PreferencesDep.use();
  const [open, setOpen] = useState(() => preferences.get(onboardingKey(id)) !== "1");
  return { open, show: useCallback(() => setOpen(true), []), close: useCallback(() => setOpen(false), []) };
}
