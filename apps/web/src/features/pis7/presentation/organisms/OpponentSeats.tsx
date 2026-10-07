import { CARD_WIDTH } from "../layout";
import { OpponentSeat } from "./OpponentSeat";

/** Rakip sayısına göre sütun düzeni (2 kişide tek büyük koltuk, 5 kişide 2×2 / 4 sütun). */
const SEAT_COLS: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-2 sm:grid-cols-4",
};

/** Masanın üstünde bütün botların koltukları. */
export function OpponentSeats({
  players,
  counts,
  activePlayer,
  name,
}: {
  players: number;
  counts: number[];
  activePlayer: number | null;
  name: (p: number) => string;
}) {
  const opponents = Array.from({ length: players - 1 }, (_, k) => k + 1);
  return (
    <div className={`grid gap-3 ${SEAT_COLS[opponents.length]}`}>
      {opponents.map((p) => (
        <OpponentSeat
          key={p}
          name={name(p)}
          count={counts[p] ?? 0}
          active={activePlayer === p}
          big={players === 2}
          cardWidth={CARD_WIDTH}
        />
      ))}
    </div>
  );
}
