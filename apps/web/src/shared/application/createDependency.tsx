import { createContext, useContext, type ReactNode } from "react";

/**
 * Modüllerin kendi portlarını (API, depolama …) uygulamaya vermesi için küçük bir DI yardımcısı.
 * Uygulaması yalnızca bileşim kökünde (app/) seçilir.
 */
export function createDependency<T>(name: string) {
  const Context = createContext<T | null>(null);
  function Provider({ value, children }: { value: T; children: ReactNode }) {
    return <Context.Provider value={value}>{children}</Context.Provider>;
  }
  function use(): T {
    const v = useContext(Context);
    if (v === null) throw new Error(`${name} sağlanmadı: bileşim kökünde Provider eksik`);
    return v;
  }
  return { Provider, use };
}
