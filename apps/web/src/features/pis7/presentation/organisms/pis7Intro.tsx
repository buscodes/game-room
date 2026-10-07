import { useMemo, type ReactNode } from "react";
import { motion } from "framer-motion";
import { Card, Felt, Pop } from "../../../../shared/presentation/organisms/onboarding/scene-kit";
import type { IntroScene } from "../../../../shared/presentation/organisms/onboarding/Onboarding";
import { usePis7Text } from "../i18n";

/** Pis Yedili tanıtımının sahne görselleri. Metinler modülün sözlüğünde (`intro`). */
const PIS7_INTRO_VISUALS: (() => ReactNode)[] = [
  () => (
    <Felt>
      {["3H", "7S", "QC", "8D", "JH", "5S", "10C"].map((c, i) => (
        <Card
          key={c}
          id={c}
          className="bottom-4 left-1/2"
          style={{ marginLeft: -40 }}
          initial={{ y: 300, rotate: 0 }}
          animate={{ y: 0, x: (i - 3) * 46, rotate: (i - 3) * 7 }}
          transition={{ delay: i * 0.18, type: "spring" }}
        />
      ))}
      <Pop className="left-1/2 top-[12%] -translate-x-1/2 text-5xl text-accent" delay={1.6}>
        7 → 0 🏁
      </Pop>
    </Felt>
  ),
  () => (
    <Felt>
      <Card id="9H" className="left-1/2 top-[14%]" style={{ marginLeft: -40 }} />
      {[
        { id: "9S", ok: true },
        { id: "4H", ok: true },
        { id: "KC", ok: false },
      ].map(({ id, ok }, i) => (
        <Card
          key={id}
          id={id}
          className="bottom-3"
          style={{
            left: `${22 + i * 22}%`,
            boxShadow: ok ? "0 0 0 4px #facc15, 0 0 22px #facc15" : undefined,
            filter: ok ? undefined : "brightness(.5)",
          }}
          initial={{ y: 200 }}
          animate={{ y: ok ? -14 : 0 }}
          transition={{ delay: 0.3 + i * 0.2 }}
        />
      ))}
    </Felt>
  ),
  () => (
    <Felt>
      <Card
        id="7S"
        className="left-1/2 top-[28%]"
        style={{ marginLeft: -40 }}
        initial={{ y: -300 }}
        animate={{ y: 0, rotate: -6 }}
        transition={{ type: "spring" }}
      />
      <Pop className="right-[18%] top-[20%] rounded-full bg-red-600 px-4 py-1 text-3xl text-white" delay={0.7}>
        +3
      </Pop>
      <Card
        id="7H"
        className="left-1/2 top-[28%]"
        style={{ marginLeft: -40 }}
        initial={{ y: 300 }}
        animate={{ y: 6, rotate: 8 }}
        transition={{ delay: 1.8, type: "spring" }}
      />
      <Pop className="right-[18%] top-[45%] rounded-full bg-red-700 px-4 py-1 text-4xl text-white" delay={2.4}>
        +6
      </Pop>
    </Felt>
  ),
  () => (
    <Felt>
      <Card id="8C" className="left-[20%] top-[28%]" initial={{ x: -200 }} animate={{ x: 0 }} />
      <Pop className="left-[20%] top-[8%] text-5xl" delay={0.6}>
        ⏭
      </Pop>
      <Card
        id="JD"
        className="right-[22%] top-[28%]"
        initial={{ x: 200 }}
        animate={{ x: 0 }}
        transition={{ delay: 1.2 }}
      />
      {["♠", "♥", "♦", "♣"].map((s, i) => (
        <motion.span
          key={s}
          className={`absolute text-3xl ${i % 3 === 0 ? "text-zinc-900" : "text-red-600"}`}
          style={{ right: "calc(22% + 30px)", top: "46%" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, x: Math.cos((i * Math.PI) / 2) * 90, y: Math.sin((i * Math.PI) / 2) * 90 }}
          transition={{ delay: 1.8 + i * 0.15 }}
        >
          <span className="rounded-full bg-zinc-100 px-1.5">{s}</span>
        </motion.span>
      ))}
    </Felt>
  ),
  () => (
    <Felt>
      {["6H", "QH", "2S", "9D"].map((c, i) => (
        <Card
          key={c}
          id={c}
          className="bottom-4"
          style={{
            left: `${14 + i * 19}%`,
            boxShadow: i === 1 ? "0 0 0 4px #38bdf8, 0 0 24px #38bdf8" : i === 0 ? "0 0 0 3px #facc15" : undefined,
            filter: i > 1 ? "brightness(.5)" : undefined,
          }}
          initial={{ y: 200 }}
          animate={{ y: i < 2 ? -14 : 0 }}
          transition={{ delay: i * 0.15 }}
        />
      ))}
      <Pop
        className="left-1/2 top-[12%] -translate-x-1/2 rounded-xl bg-sky-500/90 px-4 py-2 text-xl text-white"
        delay={1}
      >
        💡 QH
      </Pop>
    </Felt>
  ),
  () => (
    <Felt>
      {["JS", "AH", "KD", "4C"].map((c, i) => (
        <Card
          key={c}
          id={c}
          className="top-[30%]"
          style={{ left: `${8 + i * 23}%` }}
          initial={{ y: 200, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: i * 0.2 }}
        />
      ))}
      <Pop className="bottom-[8%] left-1/2 -translate-x-1/2 text-4xl text-red-400" delay={1.4}>
        −50
      </Pop>
    </Felt>
  ),
];

/** Pis Yedili tanıtımı: sözlükteki başlık/metin + sahne görselleri. */
export function usePis7Intro(): { id: string; scenes: IntroScene[] } {
  const { dict } = usePis7Text();
  return useMemo(
    () => ({ id: "pis7", scenes: dict.intro.map((s, i) => ({ ...s, visual: PIS7_INTRO_VISUALS[i] })) }),
    [dict],
  );
}
