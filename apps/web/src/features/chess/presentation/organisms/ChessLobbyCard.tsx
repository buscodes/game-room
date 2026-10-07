import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Difficulty } from "@salon/domain";
import type { ChessColor } from "@salon/contracts";
import { useI18n } from "../../../../shared/presentation/i18n/I18nProvider";
import { SectionLabel } from "../../../../shared/presentation/atoms/SectionLabel";
import { DifficultyPicker } from "../../../../shared/presentation/molecules/DifficultyPicker";
import { OptionGroup } from "../../../../shared/presentation/molecules/OptionGroup";
import { GameCard } from "../../../../shared/presentation/organisms/GameCard";
import { useChessText } from "../i18n";
import { ChessPreview } from "./ChessPreview";
import { chessUrl } from "../route";

/** Lobide satranç kartı: zorluk ve renk seçimi, "Oyna". */
export function ChessLobbyCard() {
  const nav = useNavigate();
  const { t } = useI18n();
  const { t: ct } = useChessText();
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [color, setColor] = useState<ChessColor | "random">("w");
  return (
    <GameCard
      title={ct("lobby.title")}
      image={<ChessPreview />}
      playLabel={ct("lobby.play")}
      onPlay={() => nav(chessUrl({ difficulty, color }))}
    >
      <SectionLabel>{t("common.difficulty")}</SectionLabel>
      <DifficultyPicker value={difficulty} onChange={setDifficulty} />
      <SectionLabel>{ct("lobby.yourColor")}</SectionLabel>
      <OptionGroup
        value={color}
        onChange={setColor}
        options={[
          ["w", ct("lobby.white")],
          ["b", ct("lobby.black")],
          ["random", ct("lobby.random")],
        ]}
      />
    </GameCard>
  );
}
