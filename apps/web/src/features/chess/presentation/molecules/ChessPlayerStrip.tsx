import type { ChessColor } from "@salon/contracts";
import { PieceImage } from "../atoms/PieceImage";
import { PulseDot } from "../../../../shared/presentation/atoms/PulseDot";

/** Tahtanın üstünde/altında oyuncu: şah simgesi, ad, aldığı taşlar ve materyal farkı. */
export function ChessPlayerStrip({
  name,
  color,
  captured,
  advantage,
  active,
}: {
  name: string;
  color: ChessColor;
  captured: string[];
  advantage: number;
  active: boolean;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-black/35 px-3 py-2">
      <div className="flex items-center gap-2">
        <PieceImage code={`${color}K`} className="h-7 w-7" />
        <span className="font-semibold">{name}</span>
        {active && <PulseDot color="emerald" />}
      </div>
      <div className="flex items-center">
        {captured.map((p, i) => (
          <PieceImage key={i} code={p} className="-ml-1.5 h-5 w-5 first:ml-0" />
        ))}
        {advantage > 0 && <span className="ml-2 text-xs text-zinc-300">+{advantage}</span>}
      </div>
    </div>
  );
}
