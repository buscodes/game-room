import type { ChessColor } from "@salon/contracts";
import type { Promotion } from "../../application/useChessGame";
import { useI18n } from "../../../../shared/presentation/i18n/I18nProvider";
import { useChessText } from "../i18n";
import { Panel } from "../../../../shared/presentation/atoms/Panel";
import { PieceImage } from "../atoms/PieceImage";
import { Overlay } from "../../../../shared/presentation/molecules/Overlay";

const PIECES: Promotion[] = ["q", "r", "b", "n"];

/** Piyon son sıraya ulaşınca hangi taşa terfi edeceğini sorar. */
export function PromotionPicker({
  color,
  onPick,
  onCancel,
}: {
  color: ChessColor;
  onPick: (p: Promotion) => void;
  onCancel: () => void;
}) {
  const { t } = useI18n();
  const { t: ct } = useChessText();
  return (
    <Overlay className="z-10">
      <Panel className="text-center">
        <p className="mb-3 font-display text-base font-semibold text-white">{ct("promotion")}</p>
        <div className="flex gap-2">
          {PIECES.map((p) => (
            <button
              key={p}
              className="rounded-lg bg-[url('/assets/chess/board/board.jpg')] bg-[length:400%] p-1 hover:ring-2 hover:ring-accent"
              onClick={() => onPick(p)}
            >
              <PieceImage code={`${color}${p.toUpperCase()}`} className="h-16 w-16" />
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
