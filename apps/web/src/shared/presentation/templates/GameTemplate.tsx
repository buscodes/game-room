import type { ReactNode } from "react";
import { TopBar } from "../organisms/TopBar";
import { Onboarding, type IntroScene } from "../organisms/onboarding/Onboarding";
import { useOnboarding } from "../organisms/onboarding/useOnboarding";

/**
 * Oyun sayfası iskeleti: üst bar, oyuna özel tanıtım, solda oyun alanı, sağda yan panel.
 * Tanıtım her girişte açılır ("bir daha gösterme" seçilmediyse); üst bardaki düğmeyle tekrar açılır.
 */
export function GameTemplate({
  title,
  intro,
  board,
  sidebar,
}: {
  title: string;
  intro: { id: string; scenes: IntroScene[] };
  board: ReactNode;
  sidebar: ReactNode;
}) {
  const onboarding = useOnboarding(intro.id);
  return (
    <div className="min-h-screen pb-12">
      <TopBar title={title} onHelp={onboarding.show} />
      <Onboarding id={intro.id} scenes={intro.scenes} open={onboarding.open} onClose={onboarding.close} />
      <main className="mx-auto mt-6 grid max-w-7xl gap-6 px-4 lg:grid-cols-[minmax(0,1fr)_340px]">
        {board}
        <aside className="space-y-4">{sidebar}</aside>
      </main>
    </div>
  );
}
