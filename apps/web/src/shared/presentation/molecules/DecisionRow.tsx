import { ProbabilityBar } from "../atoms/ProbabilityBar";

/** Botun değerlendirdiği tek seçenek: ad, olasılık çubuğu ve (seçildiyse) gerekçe. */
export function DecisionRow({
  label,
  probability,
  chosen,
  description,
}: {
  label: string;
  probability: number;
  chosen: boolean;
  description?: string;
}) {
  return (
    <li title={description}>
      <div className="flex items-center justify-between text-xs">
        <span className={chosen ? "font-semibold text-accent" : "text-zinc-300"}>
          {chosen && "▶ "}
          {label}
        </span>
        <span className="tabular-nums text-zinc-400">{(probability * 100).toFixed(1)}%</span>
      </div>
      <ProbabilityBar value={probability} highlight={chosen} />
      {chosen && description && <p className="mt-1 text-[11px] text-zinc-400">{description}</p>}
    </li>
  );
}
