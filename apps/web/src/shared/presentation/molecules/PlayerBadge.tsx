import { PulseDot } from "../atoms/PulseDot";

/** Masa kenarındaki oyuncu etiketi: ad, sıra göstergesi ve birkaç bilgi satırı. */
export function PlayerBadge({
  name,
  active,
  lines,
  warning,
  className = "w-24",
}: {
  name: string;
  active: boolean;
  lines: string[];
  warning?: string;
  className?: string;
}) {
  return (
    <div className={`rounded-xl bg-black/35 px-3 py-2 text-xs ${className}`}>
      <div className="flex items-center gap-2 text-sm font-semibold">
        {name}
        {active && <PulseDot />}
      </div>
      {lines.map((l) => (
        <div key={l} className="text-emerald-100/80">
          {l}
        </div>
      ))}
      {warning && <div className="font-bold text-amber-300">{warning}</div>}
    </div>
  );
}
