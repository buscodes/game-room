import { AnimatePresence } from "framer-motion";
import { useI18n } from "../../../../shared/presentation/i18n/I18nProvider";
import { PlayingCard } from "../../../../shared/presentation/atoms/PlayingCard";
import { PulseDot } from "../../../../shared/presentation/atoms/PulseDot";

/** Bir bilgisayar oyuncusunun koltuğu: isim, kart sayısı ve kapalı kart yelpazesi. */
export function OpponentSeat({
  name,
  count,
  active,
  big,
  cardWidth,
}: {
  name: string;
  count: number;
  active: boolean;
  big: boolean;
  cardWidth: string;
}) {
  const { t } = useI18n();
  // Küçük koltuklarda yelpaze koltuk genişliğini aşmasın: en fazla 8 kart, sıkı üst üste binme.
  const shown = Math.min(count, big ? 14 : 8);
  const w = big ? cardWidth : "w-8 sm:w-10";
  const overlapPx = big ? (count <= 7 ? -30 : -Math.min(72, 30 + (count - 7) * 5)) : -24;
  return (
    <div
      className={`flex gap-2 overflow-hidden rounded-2xl px-3 py-2 transition ${
        active ? "bg-amber-300/15 ring-2 ring-amber-300/60" : "bg-black/20"
      } ${big ? "items-center justify-between" : "flex-col items-center"}`}
    >
      <div className={`text-xs ${big ? "min-w-16" : "flex w-full items-center justify-between gap-2"}`}>
        <div className="flex items-center gap-2 text-sm font-semibold">
          {name}
          {active && <PulseDot />}
        </div>
        <div className="text-emerald-100/80">{t("common.cards", { n: count })}</div>
        {count === 1 && <div className="font-bold text-amber-300">{t("common.oneCardLeft")}</div>}
      </div>
      <div className="flex flex-1 justify-center">
        <AnimatePresence>
          {Array.from({ length: shown }).map((_, i) => (
            <PlayingCard
              key={i}
              card={null}
              className={w}
              style={{ marginLeft: i ? overlapPx : 0 }}
              initial={{ y: -40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
            />
          ))}
        </AnimatePresence>
      </div>
      {big && <div className="w-16" />}
    </div>
  );
}
