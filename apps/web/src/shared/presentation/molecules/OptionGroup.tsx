import { Button } from "../atoms/Button";

const COLS = { 2: "grid-cols-2", 3: "grid-cols-3", 4: "grid-cols-4" } as const;

/** Tek seçimli düğme grubu (zorluk, renk, hedef puan …). */
export function OptionGroup<T extends string | number>({
  value,
  onChange,
  options,
  cols = 3,
}: {
  value: T;
  onChange: (v: T) => void;
  options: readonly (readonly [T, string])[];
  cols?: keyof typeof COLS;
}) {
  return (
    <div className={`grid gap-2 ${COLS[cols]}`}>
      {options.map(([v, label]) => (
        <Button
          key={String(v)}
          variant={value === v ? "primary" : "ghost"}
          className="py-2"
          onClick={() => onChange(v)}
        >
          {label}
        </Button>
      ))}
    </div>
  );
}
