import type { ReactNode } from "react";
import { Panel } from "../../../../shared/presentation/atoms/Panel";

/** "Yardımlı" mod çubuğu: o anki durumu anlatan cümle ve eylem düğmeleri. */
export function HelpBar({ text, children }: { text: string; children: ReactNode }) {
  return (
    <Panel className="flex flex-wrap items-center gap-3 p-3">
      <span className="text-2xl">🧭</span>
      <p className="min-w-0 flex-1 text-sm text-zinc-200">{text}</p>
      {children}
    </Panel>
  );
}
