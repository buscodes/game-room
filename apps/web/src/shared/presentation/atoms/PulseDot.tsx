const COLORS = { amber: "bg-amber-300", emerald: "bg-emerald-400" } as const;

/** Sıranın kimde olduğunu gösteren yanıp sönen nokta. */
export function PulseDot({ color = "amber", ping = false }: { color?: keyof typeof COLORS; ping?: boolean }) {
  return <span className={`h-2 w-2 rounded-full ${COLORS[color]} ${ping ? "animate-ping" : "animate-pulse"}`} />;
}
