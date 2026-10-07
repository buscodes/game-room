import { useI18n } from "../../../../shared/presentation/i18n/I18nProvider";
import { CardStack } from "../../../../shared/presentation/molecules/CardStack";
import { usePis7Text } from "../i18n";
import { CARD_WIDTH } from "../layout";

/** Tıklanabilir deste; atacak kart yoksa parlayarak çekmeyi önerir. */
export function DrawPile({
  deckCount,
  canDraw,
  mustDraw,
  pendingDraw,
  onDraw,
}: {
  deckCount: number;
  canDraw: boolean;
  /** Uyan kart yok: deste vurgulanır */
  mustDraw: boolean;
  pendingDraw: number;
  onDraw: () => void;
}) {
  const { t } = useI18n();
  const { t: p7 } = usePis7Text();
  return (
    <button
      type="button"
      onClick={() => canDraw && onDraw()}
      disabled={!canDraw}
      className="group relative text-center disabled:cursor-default"
    >
      <div className={`relative ${CARD_WIDTH}`}>
        <CardStack count={Math.max(1, deckCount)} variant="deck" className="w-full" />
        {mustDraw && <span className="absolute -inset-2 animate-pulse rounded-xl ring-4 ring-amber-300/80" />}
      </div>
      <div className="mt-2 text-xs text-emerald-100/80">
        {t("common.deck", { n: deckCount })}
        {canDraw && (
          <span className="block text-amber-200">{pendingDraw ? p7("drawN", { n: pendingDraw }) : p7("drawHint")}</span>
        )}
      </div>
    </button>
  );
}
