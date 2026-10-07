import type { Suit } from "@salon/domain";

const SUIT_SYMBOL: Record<Suit, string> = { S: "♠", H: "♥", D: "♦", C: "♣" };
const SUIT_COLOR: Record<Suit, string> = {
  S: "text-zinc-900",
  C: "text-zinc-900",
  H: "text-red-600",
  D: "text-red-600",
};

/** Kart türü sembolü (renkli). */
export function SuitIcon({ suit, className = "" }: { suit: Suit; className?: string }) {
  return <span className={`${SUIT_COLOR[suit]} ${className}`}>{SUIT_SYMBOL[suit]}</span>;
}
