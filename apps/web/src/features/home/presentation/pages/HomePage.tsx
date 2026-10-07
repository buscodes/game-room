import { ChessLobbyCard } from "../../../chess";
import { PistiLobbyCard } from "../../../pisti";
import { Pis7LobbyCard } from "../../../pis7";
import { Pill } from "../../../../shared/presentation/atoms/Pill";
import { HomeTemplate } from "../../../../shared/presentation/templates/HomeTemplate";
import { useHomeText } from "../i18n";

/** Lobi: her oyun modülü kendi kartını (ayarlar + "Oyna") getirir. */
export function HomePage() {
  const { t } = useHomeText();
  const hero = (
    <section className="py-12 text-center sm:py-20">
      <Pill>
        <span className="h-1.5 w-1.5 rounded-full bg-accent" />
        {t("games")}
      </Pill>
      <h1 className="mt-5 bg-gradient-to-b from-white to-zinc-400 bg-clip-text font-display text-5xl font-bold tracking-tight text-transparent sm:text-7xl">
        {t("title")}
      </h1>
      <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-zinc-400 sm:text-lg">{t("intro")}</p>
    </section>
  );
  return (
    <HomeTemplate hero={hero}>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        <ChessLobbyCard />
        <PistiLobbyCard />
        <Pis7LobbyCard />
      </div>
    </HomeTemplate>
  );
}
