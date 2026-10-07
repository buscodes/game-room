import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PIS7_PLAYERS, PIS7_TARGET, type Difficulty } from "@salon/domain";
import { useI18n } from "../../../../shared/presentation/i18n/I18nProvider";
import { SectionLabel } from "../../../../shared/presentation/atoms/SectionLabel";
import { DifficultyPicker } from "../../../../shared/presentation/molecules/DifficultyPicker";
import { OptionGroup } from "../../../../shared/presentation/molecules/OptionGroup";
import { CardFanPreview } from "../../../../shared/presentation/organisms/CardFanPreview";
import { GameCard } from "../../../../shared/presentation/organisms/GameCard";
import { usePis7Text } from "../i18n";
import { pis7Url } from "../route";

/** Lobide sunulan seçenekler: oyuncu sayısı domain aralığından, ceza sınırları sabit. */
const PLAYER_OPTIONS = Array.from({ length: PIS7_PLAYERS.max - PIS7_PLAYERS.min + 1 }, (_, i) => PIS7_PLAYERS.min + i);
const TARGET_OPTIONS = [51, PIS7_TARGET.default, 201];

/** Lobide Pis Yedili kartı: zorluk, oyuncu sayısı ve ceza sınırı seçimi, "Oyna". */
export function Pis7LobbyCard() {
  const nav = useNavigate();
  const { t } = useI18n();
  const { t: p7 } = usePis7Text();
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [players, setPlayers] = useState(PIS7_PLAYERS.default);
  const [target, setTarget] = useState(PIS7_TARGET.default);
  return (
    <GameCard
      title={p7("lobby.title")}
      image={
        <CardFanPreview cards={["7S", "7H", "8C", "JD", "7D"]} spread={40} tilt={8} badge={p7("lobby.helped")} rise />
      }
      playLabel={p7("lobby.play")}
      onPlay={() => nav(pis7Url({ difficulty, target, players }))}
    >
      <SectionLabel>{t("common.difficulty")}</SectionLabel>
      <DifficultyPicker value={difficulty} onChange={setDifficulty} />
      <SectionLabel>{p7("lobby.players")}</SectionLabel>
      <OptionGroup
        value={players}
        onChange={setPlayers}
        cols={4}
        options={PLAYER_OPTIONS.map((n) => [n, String(n)] as const)}
      />
      <p className="mt-2 text-xs text-zinc-400">{p7("lobby.playersHint", { n: players - 1 })}</p>
      <SectionLabel>{p7("lobby.penaltyLimit")}</SectionLabel>
      <OptionGroup value={target} onChange={setTarget} options={TARGET_OPTIONS.map((v) => [v, String(v)] as const)} />
    </GameCard>
  );
}
