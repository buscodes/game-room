import { CardStack } from "../../../../shared/presentation/molecules/CardStack";
import { SIDE_WIDTH } from "../layout";

/** Oyuncunun topladığı kartlar (yan yatık yığın). */
export function CapturedPile({ count }: { count: number }) {
  return (
    <div className={`flex justify-end ${SIDE_WIDTH}`}>
      <CardStack count={count} variant="captured" per={6} max={5} className="w-12 sm:w-14" />
    </div>
  );
}
