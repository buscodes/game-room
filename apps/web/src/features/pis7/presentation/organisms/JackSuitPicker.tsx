import { SUITS, type Card, type Suit } from "@salon/domain";
import { useI18n } from "../../../../shared/presentation/i18n/I18nProvider";
import { usePis7Text } from "../i18n";
import { useFormat } from "../../../../shared/presentation/i18n/useFormat";
import { Panel } from "../../../../shared/presentation/atoms/Panel";
import { SuitIcon } from "../../../../shared/presentation/atoms/SuitIcon";
import { Overlay } from "../../../../shared/presentation/molecules/Overlay";

/** Vale atıldığında yeni türü seçtirir; her türden elde kaç kart olduğunu gösterir. */
export function JackSuitPicker({
  hand,
  jack,
  onPick,
  onCancel,
}: {
  hand: Card[];
  jack: Card;
  onPick: (s: Suit) => void;
  onCancel: () => void;
}) {
  const { t } = useI18n();
  const { t: p7 } = usePis7Text();
  const f = useFormat();
  return (
    <Overlay className="rounded-3xl">
      <Panel className="p-5 text-center">
        <p className="mb-1 font-display text-xl font-semibold text-white">{p7("jackTitle")}</p>
        <p className="mb-4 text-xs text-zinc-400">{p7("jackTip")}</p>
        <div className="grid grid-cols-4 gap-2">
          {SUITS.map((s) => (
            <button
              key={s}
              className="flex flex-col items-center rounded-xl bg-zinc-100 px-3 py-2 hover:ring-4 hover:ring-accent"
              onClick={() => onPick(s)}
            >
              <SuitIcon suit={s} className="text-4xl" />
              <span className="text-xs font-semibold text-zinc-700">{f.suit(s)}</span>
              <span className="text-[10px] text-zinc-500">
                {p7("inHand", { n: hand.filter((c) => c.suit === s && c.id !== jack.id).length })}
              </span>
            </button>
          ))}
        </div>
        <button className="mt-3 text-xs text-zinc-400 hover:text-zinc-200" onClick={onCancel}>
          {t("common.cancel")}
        </button>
      </Panel>
    </Overlay>
  );
}
