import { useMemo, type ReactNode } from "react";
import { Card, Felt, Pop } from "../../../../shared/presentation/organisms/onboarding/scene-kit";
import type { IntroScene } from "../../../../shared/presentation/organisms/onboarding/Onboarding";
import { usePistiText } from "../i18n";

/** Sahnedeki "PİŞTİ!" yazısı (dile göre). */
function PistiShout() {
  return <>{usePistiText().t("shout")}</>;
}

/** Pişti tanıtımının sahne görselleri. Metinler modülün sözlüğünde (`intro`). */
const PISTI_INTRO_VISUALS: (() => ReactNode)[] = [
  () => (
    <Felt>
      {["back", "back", "back", "9H"].map((c, i) => (
        <Card
          key={i}
          id={c}
          className="left-1/2 top-[18%]"
          initial={{ x: -400, rotate: -40 }}
          animate={{ x: -40 + i * 6, rotate: -6 + i * 4 }}
          transition={{ delay: i * 0.25 }}
        />
      ))}
      {["AS", "7C", "JD", "5H"].map((c, i) => (
        <Card
          key={c}
          id={c}
          className="bottom-3 left-1/2"
          initial={{ y: 300 }}
          animate={{ y: 0, x: -170 + i * 90 }}
          transition={{ delay: 1.2 + i * 0.2 }}
        />
      ))}
    </Felt>
  ),
  () => (
    <Felt>
      {["3S", "KD", "7H"].map((c, i) => (
        <Card
          key={c}
          id={c}
          className="left-1/2 top-[28%]"
          style={{ marginLeft: -40 }}
          animate={{ rotate: -8 + i * 8, x: [0, 0, 0, 360], opacity: [1, 1, 1, 0] }}
          transition={{ duration: 3.4, times: [0, 0.5, 0.75, 1] }}
        />
      ))}
      <Card
        id="7C"
        className="left-1/2 top-[28%]"
        style={{ marginLeft: -40 }}
        initial={{ y: 320 }}
        animate={{ y: [320, 0, 0, 0], x: [0, 0, 0, 360], opacity: [1, 1, 1, 0] }}
        transition={{ duration: 3.4, times: [0, 0.4, 0.75, 1] }}
      />
      <Pop className="bottom-4 left-1/2 -translate-x-1/2 text-4xl text-accent" delay={1.4}>
        7 = 7 ✓
      </Pop>
    </Felt>
  ),
  () => (
    <Felt>
      {["2H", "9C", "QS", "4D"].map((c, i) => (
        <Card
          key={c}
          id={c}
          className="left-1/2 top-[28%]"
          style={{ marginLeft: -40 }}
          animate={{ rotate: -12 + i * 8, x: [0, 0, 0, 360], opacity: [1, 1, 1, 0] }}
          transition={{ duration: 3.4, times: [0, 0.5, 0.75, 1] }}
        />
      ))}
      <Card
        id="JS"
        className="left-1/2 top-[28%]"
        style={{ marginLeft: -40 }}
        initial={{ y: 320 }}
        animate={{ y: [320, 0, 0, 0], x: [0, 0, 0, 360], opacity: [1, 1, 1, 0] }}
        transition={{ duration: 3.4, times: [0, 0.4, 0.75, 1] }}
      />
    </Felt>
  ),
  () => (
    <Felt>
      <Card id="5D" className="left-1/2 top-[28%]" style={{ marginLeft: -40 }} />
      <Card
        id="5S"
        className="left-1/2 top-[28%]"
        style={{ marginLeft: -40 }}
        initial={{ y: 320, rotate: 20 }}
        animate={{ y: 6, rotate: 6 }}
        transition={{ delay: 0.5, type: "spring" }}
      />
      <Pop className="left-1/2 top-[12%] -translate-x-1/2 text-6xl text-accent" delay={1.2}>
        <PistiShout /> +10
      </Pop>
      <Pop className="bottom-[10%] left-1/2 -translate-x-1/2 text-2xl text-amber-200" delay={2.2}>
        J + J = +20
      </Pop>
    </Felt>
  ),
  () => (
    <Felt>
      {[
        ["AS", "+1"],
        ["JH", "+1"],
        ["2C", "+2"],
        ["10D", "+3"],
      ].map(([c, p], i) => (
        <div key={c}>
          <Card
            id={c}
            className="top-[28%]"
            style={{ left: `${8 + i * 23}%` }}
            initial={{ y: 200, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: i * 0.25 }}
          />
          <Pop
            className="top-[8%] text-3xl text-accent"
            style={{ left: `calc(${8 + i * 23}% + 24px)` }}
            delay={0.8 + i * 0.25}
          >
            {p}
          </Pop>
        </div>
      ))}
    </Felt>
  ),
];

/** Pişti tanıtımı: sözlükteki başlık/metin + sahne görselleri. */
export function usePistiIntro(): { id: string; scenes: IntroScene[] } {
  const { dict } = usePistiText();
  return useMemo(
    () => ({ id: "pisti", scenes: dict.intro.map((s, i) => ({ ...s, visual: PISTI_INTRO_VISUALS[i] })) }),
    [dict],
  );
}
