import { useMemo, type ReactNode } from "react";
import { motion } from "framer-motion";
import { Piece, Pop, ProbBars } from "../../../../shared/presentation/organisms/onboarding/scene-kit";
import type { IntroScene } from "../../../../shared/presentation/organisms/onboarding/Onboarding";
import { useChessText } from "../i18n";

/** Satranç tanıtımının sahne görselleri. Metinler modülün sözlüğünde (`intro`). */
const CHESS_INTRO_VISUALS: (() => ReactNode)[] = [
  () => (
    <div className="relative h-full w-full rounded-2xl bg-[url('/assets/chess/board/board.jpg')] bg-[length:50%]">
      <div className="absolute inset-0 rounded-2xl bg-black/40" />
      <Piece
        code="wN"
        className="left-1/2 top-6 h-24 w-24"
        style={{ marginLeft: -48 }}
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      />
      <ProbBars
        items={[
          ["Nf3", 0.46],
          ["e4", 0.31],
          ["d4", 0.23],
        ]}
        delay={0.6}
      />
    </div>
  ),
  () => {
    // 4x4 tahta parçası üzerinde at ve gidebileceği kareler
    const dots = [
      [0, 2],
      [2, 0],
      [2, 3],
    ];
    return (
      <div className="relative mx-auto aspect-square h-full rounded-xl bg-[url('/assets/chess/board/board.jpg')] bg-[length:200%] shadow-2xl">
        {dots.map(([r, c], i) => (
          <motion.span
            key={i}
            className="absolute h-[8%] w-[8%] rounded-full bg-green-900/60"
            style={{ top: `${r * 25 + 12.5}%`, left: `${c * 25 + 12.5}%`, x: "-50%", y: "-50%" }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.8 + i * 0.15 }}
          />
        ))}
        <motion.span
          className="absolute h-1/4 w-1/4 bg-green-500/40"
          style={{ top: "75%", left: "25%" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 1, 0.3] }}
          transition={{ duration: 2.4 }}
        />
        <Piece
          code="wN"
          className="h-1/4 w-1/4"
          style={{ top: "75%", left: "25%" }}
          initial={{ top: "75%", left: "25%" }}
          animate={{ top: ["75%", "75%", "50%"], left: ["25%", "25%", "75%"] }}
          transition={{ duration: 3.2, times: [0, 0.7, 1] }}
        />
      </div>
    );
  },
  () => (
    <div className="panel relative h-full w-full">
      <div className="p-4 text-left font-display text-base font-semibold text-white">🤖</div>
      <div className="absolute left-6 right-6 top-14 h-2 rounded bg-gradient-to-r from-emerald-400/60 via-zinc-500/40 to-rose-400/60">
        <motion.div
          className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent"
          initial={{ left: "50%" }}
          animate={{ left: ["50%", "30%", "62%"] }}
          transition={{ duration: 3 }}
        />
      </div>
      <ProbBars
        items={[
          ["Qxf7#", 0.91],
          ["Qh4", 0.06],
          ["Bb5", 0.03],
        ]}
      />
    </div>
  ),
  () => (
    <div className="flex h-full items-center justify-center gap-4 sm:gap-8">
      {["🎲", "⚖️", "🧠"].map((icon, i) => (
        <motion.div
          key={icon}
          className="panel flex h-32 w-24 flex-col items-center justify-center text-5xl sm:h-40 sm:w-32"
          initial={{ y: 60, opacity: 0, rotate: -8 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          transition={{ delay: 0.2 + i * 0.35, type: "spring" }}
        >
          {icon}
          <div className="mt-2 flex gap-1">
            {Array.from({ length: i + 1 }).map((_, k) => (
              <span key={k} className="h-2 w-2 rounded-full bg-accent" />
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  ),
  () => (
    <div className="relative h-full w-full rounded-2xl bg-[url('/assets/chess/board/board.jpg')] bg-[length:50%]">
      <div className="absolute inset-0 rounded-2xl bg-black/30" />
      <motion.div
        className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full"
        animate={{ boxShadow: ["0 0 0px red", "0 0 80px 20px rgba(255,0,0,.7)", "0 0 30px 5px rgba(255,0,0,.5)"] }}
        transition={{ duration: 1.6, repeat: Infinity }}
      />
      <Piece
        code="bK"
        className="left-1/2 top-1/2 h-28 w-28"
        style={{ x: "-50%", y: "-50%" }}
        animate={{ rotate: [0, -8, 8, -8, 0] }}
        transition={{ delay: 1, duration: 0.6 }}
      />
      <Piece
        code="wQ"
        className="left-[12%] top-[20%] h-20 w-20"
        initial={{ x: -120, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      />
      <Pop className="right-[12%] top-[15%] text-6xl text-red-400" delay={1.2}>
        #
      </Pop>
    </div>
  ),
];

/** Satranç tanıtımı: sözlükteki başlık/metin + sahne görselleri. */
export function useChessIntro(): { id: string; scenes: IntroScene[] } {
  const { dict } = useChessText();
  return useMemo(
    () => ({ id: "chess", scenes: dict.intro.map((s, i) => ({ ...s, visual: CHESS_INTRO_VISUALS[i] })) }),
    [dict],
  );
}
