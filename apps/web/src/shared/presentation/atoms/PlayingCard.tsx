import { motion, type HTMLMotionProps } from "framer-motion";
import type { Card } from "@salon/domain";
import { useI18n } from "../i18n/I18nProvider";
import { useFormat } from "../i18n/useFormat";

/** Gerçek iskambil kartı görseli (Vector Playing Cards) ya da kart arkası. */
export function PlayingCard({
  card,
  className = "",
  ...rest
}: { card: Card | null; className?: string } & HTMLMotionProps<"div">) {
  const { t } = useI18n();
  const f = useFormat();
  return (
    <motion.div className={`playing-card ${className}`} {...rest}>
      <img
        src={card ? `/assets/cards/${card.id}.svg` : "/assets/cards/back.svg"}
        alt={card ? f.card(card) : t("names.faceDown")}
        draggable={false}
        className="block h-full w-full select-none"
      />
    </motion.div>
  );
}

/** Boş kart yeri (kesikli çerçeve). */
export function CardSlot({ className = "" }: { className?: string }) {
  return (
    <div className={`playing-card border-2 border-dashed border-white/20 bg-transparent! shadow-none! ${className}`} />
  );
}

/** Kart kimliğinden deterministik küçük bir dağınıklık (masadaki doğal görünüm için). */
export function jitter(id: string) {
  let h = 0;
  for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) | 0;
  const r = (n: number) => ((Math.abs(h >> n) % 1000) / 1000) * 2 - 1;
  return { rotate: r(0) * 9, x: r(3) * 8, y: r(7) * 6 };
}
