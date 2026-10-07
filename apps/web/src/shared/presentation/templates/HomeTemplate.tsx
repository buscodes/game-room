import type { ReactNode } from "react";
import { TopBar } from "../organisms/TopBar";

/** Ana sayfa iskeleti: üst bar + ortalanmış içerik. */
export function HomeTemplate({ hero, children }: { hero: ReactNode; children: ReactNode }) {
  return (
    <div className="min-h-screen pb-16">
      <TopBar />
      <main className="mx-auto max-w-7xl px-4">
        {hero}
        {children}
      </main>
    </div>
  );
}
