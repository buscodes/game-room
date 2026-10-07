import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PISTI_TARGET, type Difficulty } from "@salon/domain";
import { useI18n } from "../../../../shared/presentation/i18n/I18nProvider";
import { SectionLabel } from "../../../../shared/presentation/atoms/SectionLabel";
import { DifficultyPicker } from "../../../../shared/presentation/molecules/DifficultyPicker";
import { OptionGroup } from "../../../../shared/presentation/molecules/OptionGroup";
import { CardFanPreview } from "../../../../shared/presentation/organisms/CardFanPreview";
import { GameCard } from "../../../../shared/presentation/organisms/GameCard";
import { usePistiText } from "../i18n";
import { pistiUrl } from "../route";

/** Lobide sunulan bitiş puanları. */
const TARGET_OPTIONS = [51, 101, PISTI_TARGET.default];

/** Lobide pişti kartı: zorluk ve bitiş puanı seçimi, "Oyna". */
export function PistiLobbyCard() {
  const nav = useNavigate();
  const { t } = useI18n();
  const { t: pt } = usePistiText();
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [target, setTarget] = useState(PISTI_TARGET.default);
  return (
    <GameCard
      title={pt("lobby.title")}
      image={<CardFanPreview cards={["JS", "AH", "10D", "2C"]} spread={40} tilt={12} />}
      playLabel={pt("lobby.play")}
      onPlay={() => nav(pistiUrl({ difficulty, target }))}
    >
      <SectionLabel>{t("common.difficulty")}</SectionLabel>
      <DifficultyPicker value={difficulty} onChange={setDifficulty} />
      <SectionLabel>{pt("lobby.endScore")}</SectionLabel>
      <OptionGroup value={target} onChange={setTarget} options={TARGET_OPTIONS.map((v) => [v, String(v)] as const)} />
    </GameCard>
  );
}
