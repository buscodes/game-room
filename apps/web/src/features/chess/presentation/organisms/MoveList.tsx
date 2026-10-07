import { useChessText } from "../i18n";
import { Panel, PanelTitle } from "../../../../shared/presentation/atoms/Panel";

/** Satranç hamle listesi (1. e4 e5 …). */
export function MoveList({ history }: { history: string[] }) {
  const { t: ct } = useChessText();
  return (
    <Panel>
      <PanelTitle>{ct("moves")}</PanelTitle>
      <ol className="grid max-h-64 grid-cols-[2rem_1fr_1fr] gap-x-2 gap-y-0.5 overflow-y-auto text-sm tabular-nums">
        {Array.from({ length: Math.ceil(history.length / 2) }).map((_, i) => (
          <li key={i} className="contents">
            <span className="text-zinc-500">{i + 1}.</span>
            <span>{history[i * 2]}</span>
            <span>{history[i * 2 + 1] ?? ""}</span>
          </li>
        ))}
      </ol>
      {history.length === 0 && <p className="text-sm text-zinc-400">{ct("noMoves")}</p>}
    </Panel>
  );
}
