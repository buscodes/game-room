import type { ReactNode } from "react";

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <div className="mb-2 mt-5 text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">{children}</div>
  );
}
