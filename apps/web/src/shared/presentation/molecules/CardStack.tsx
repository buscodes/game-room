import { CardSlot, PlayingCard } from "../atoms/PlayingCard";

/**
 * Kapalı kart yığını: "deck" desteyi (hafif kaydırmalı), "captured" toplanan kartları (yan yatık) gösterir.
 * Görünen kart sayısı `count`'a göre azalıp çoğalır.
 */
export function CardStack({
  count,
  variant,
  per = 7,
  max = 6,
  className = "",
}: {
  count: number;
  variant: "deck" | "captured";
  per?: number;
  max?: number;
  className?: string;
}) {
  const layers = Math.min(max, Math.ceil(count / per));
  if (count <= 0 || layers === 0)
    return (
      <CardSlot
        className={`${variant === "captured" ? "rotate-90 border border-white/15" : "border-white/25"} ${className}`}
      />
    );
  return (
    <div className={`relative ${className}`}>
      {Array.from({ length: layers }).map((_, i) => (
        <PlayingCard
          key={i}
          card={null}
          className={`${i ? "absolute inset-0" : ""} w-full`}
          style={{
            transform: variant === "deck" ? `translate(${-i * 1.5}px, ${-i * 1.5}px)` : `rotate(${90 + i * 3}deg)`,
          }}
        />
      ))}
    </div>
  );
}
