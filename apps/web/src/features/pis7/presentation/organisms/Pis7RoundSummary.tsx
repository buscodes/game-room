import { cardPenalty, type Card, type Pis7RoundResult } from "@salon/domain";
import { usePis7Text } from "../i18n";
import { PlayingCard } from "../../../../shared/presentation/atoms/PlayingCard";

/** Pis Yedili el sonu: bu eldeki ve toplam ceza puanları, rakiplerin elde kalan kartları. */
export function Pis7RoundSummary({
  scores,
  lastRound,
  target,
  reveal,
  name,
}: {
  scores: number[];
  lastRound: Pis7RoundResult;
  target: number;
  reveal?: Card[][];
  name: (p: number) => string;
}) {
  const { t: p7 } = usePis7Text();
  return (
    <>
      <table className="mt-4 w-full text-sm tabular-nums">
        <thead>
          <tr className="text-zinc-400">
            <th className="py-1 text-left font-normal" />
            <th className="py-1 text-right font-normal">{p7("thisRound")}</th>
            <th className="py-1 text-right font-normal">{p7("totalCol")}</th>
          </tr>
        </thead>
        <tbody>
          {scores.map((sc, p) => (
            <tr key={p} className={p === lastRound.winner ? "font-bold text-emerald-300" : ""}>
              <td className="py-0.5 text-left">
                {name(p)}
                {p === lastRound.winner && " 🏁"}
              </td>
              <td className="py-0.5 text-right">+{lastRound.points[p]}</td>
              <td className="py-0.5 text-right">{sc}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-1 text-right text-xs text-zinc-500">{p7("limit", { t: target })}</p>
      {reveal && (
        <div className="mt-3 space-y-2 text-left">
          {reveal.map((cards, p) =>
            p !== 0 && cards.length > 0 ? (
              <div key={p} className="flex items-center gap-2">
                <span className="w-14 shrink-0 text-xs text-zinc-400">{name(p)}</span>
                <div className="flex flex-wrap gap-1">
                  {cards.map((c) => (
                    <div key={c.id} className="text-center">
                      <PlayingCard card={c} className="w-9" />
                      <span className="text-[10px] text-zinc-400">{cardPenalty(c)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null,
          )}
        </div>
      )}
    </>
  );
}
