import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { ReactNode } from "react";
import { PreferencesDep } from "../../../application/ports/preferences";
import { useI18n } from "../../i18n/I18nProvider";
import { onboardingKey } from "./useOnboarding";

/** Tek bir tanıtım sahnesi: başlık, kısa metin ve animasyonlu görsel. */
export interface IntroScene {
  title: string;
  text: string;
  visual: () => ReactNode;
}

const SCENE_MS = 5200;

/** Fragman tarzı oyun tanıtımı: sahneler kendiliğinden ilerler, fareyle üzerine gelince durur. */
export function Onboarding({
  id,
  scenes,
  open,
  onClose,
}: {
  id: string;
  scenes: IntroScene[];
  open: boolean;
  onClose: () => void;
}) {
  const { t, lang } = useI18n();
  const preferences = PreferencesDep.use();
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const [dontShow, setDontShow] = useState(false);
  const last = i === scenes.length - 1;

  const finish = useCallback(() => {
    preferences.set(onboardingKey(id), dontShow ? "1" : null);
    onClose();
  }, [dontShow, id, onClose, preferences]);

  useEffect(() => {
    if (open) setI(0);
  }, [open]);

  // Fragman gibi kendiliğinden ilerle
  useEffect(() => {
    if (!open || paused || last) return;
    const id = setTimeout(() => setI((x) => x + 1), SCENE_MS);
    return () => clearTimeout(id);
  }, [open, paused, last, i]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") setI((x) => Math.min(scenes.length - 1, x + 1));
      if (e.key === "ArrowLeft") setI((x) => Math.max(0, x - 1));
      if (e.key === "Escape") finish();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, scenes.length, finish]);

  const Visual = scenes[i].visual;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
        >
          <motion.div
            className="relative flex w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#11151b] shadow-2xl"
            initial={{ scale: 0.92, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            {/* hikâye tarzı ilerleme çubukları */}
            <div className="flex gap-1.5 px-5 pt-4">
              {scenes.map((_, k) => (
                <button
                  key={k}
                  className="h-1 flex-1 overflow-hidden rounded bg-white/15"
                  onClick={() => setI(k)}
                  aria-label={`${k + 1}`}
                >
                  <motion.div
                    key={`${k}-${i}-${paused}`}
                    className="h-full bg-accent"
                    initial={{ width: k < i ? "100%" : "0%" }}
                    animate={{ width: k < i ? "100%" : k === i ? (paused && !last ? undefined : "100%") : "0%" }}
                    transition={k === i && !last ? { duration: SCENE_MS / 1000, ease: "linear" } : { duration: 0.2 }}
                  />
                </button>
              ))}
            </div>
            <button className="absolute right-4 top-6 text-sm text-zinc-400 hover:text-zinc-100" onClick={finish}>
              {t("onboarding.skip")} ✕
            </button>

            <div className="relative mx-5 mt-5 h-64 sm:h-80">
              <AnimatePresence mode="wait">
                <motion.div
                  key={i}
                  className="absolute inset-0"
                  initial={{ opacity: 0, scale: 1.04 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.35 }}
                >
                  <Visual />
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="px-6 pb-2 pt-5 text-center sm:px-10">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${i}-${lang}`}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                >
                  <div className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500">
                    {i + 1} / {scenes.length}
                  </div>
                  <h2 className="mt-1 font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                    {scenes[i].title}
                  </h2>
                  <p className="mx-auto mt-3 max-w-xl text-zinc-300">{scenes[i].text}</p>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 px-6 pb-5 pt-4">
              <label className="flex cursor-pointer items-center gap-2 text-xs text-zinc-400">
                <input
                  type="checkbox"
                  checked={dontShow}
                  onChange={(e) => setDontShow(e.target.checked)}
                  className="accent-amber-400"
                />
                {t("onboarding.dontShow")}
              </label>
              <div className="flex gap-2">
                <button className="btn btn-ghost py-2" disabled={i === 0} onClick={() => setI((x) => x - 1)}>
                  {t("onboarding.back")}
                </button>
                {last ? (
                  <button className="btn btn-primary py-2" onClick={finish}>
                    {t("onboarding.play")} ▶
                  </button>
                ) : (
                  <button className="btn btn-primary py-2" onClick={() => setI((x) => x + 1)}>
                    {t("onboarding.next")}
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
