import type { ReactNode } from "react";
import { PreferencesDep } from "../shared/application/ports/preferences";
import { localPreferences } from "../shared/infrastructure/storage/local-preferences";
import { I18nProvider } from "../shared/presentation/i18n/I18nProvider";
import { ChessApiDep, httpChessApi } from "../features/chess";
import { PistiApiDep, httpPistiApi } from "../features/pisti";
import { Pis7ApiDep, httpPis7Api } from "../features/pis7";

/** Bileşim kökü: port uygulamaları (HTTP API'ler, tarayıcı depolaması) yalnızca burada seçilir. */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <PreferencesDep.Provider value={localPreferences}>
      <ChessApiDep.Provider value={httpChessApi}>
        <PistiApiDep.Provider value={httpPistiApi}>
          <Pis7ApiDep.Provider value={httpPis7Api}>
            <I18nProvider>{children}</I18nProvider>
          </Pis7ApiDep.Provider>
        </PistiApiDep.Provider>
      </ChessApiDep.Provider>
    </PreferencesDep.Provider>
  );
}
