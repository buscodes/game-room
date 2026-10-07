import { useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import type { ChessColor, ChessGameDTO } from "@salon/contracts";
import { useChessGame } from "../../application/useChessGame";
import { useI18n } from "../../../../shared/presentation/i18n/I18nProvider";
import { useFormat } from "../../../../shared/presentation/i18n/useFormat";
import { Button } from "../../../../shared/presentation/atoms/Button";
import { ChessPlayerStrip } from "../molecules/ChessPlayerStrip";
import { AiPanel } from "../../../../shared/presentation/organisms/AiPanel";
import { ChessBoard } from "../organisms/ChessBoard";
import { MoveList } from "../organisms/MoveList";
import { PromotionPicker } from "../organisms/PromotionPicker";
import { ResultDialog } from "../../../../shared/presentation/organisms/ResultDialog";
import { GameTemplate } from "../../../../shared/presentation/templates/GameTemplate";
import { useChessText } from "../i18n";
import { readChessSettings } from "../route";
import { useChessIntro } from "../organisms/chessIntro";

function useResultText(game: ChessGameDTO | null): string | null {
  const { t: ct } = useChessText();
  return useMemo(() => {
    if (!game || game.status === "playing") return null;
    if (game.status === "stalemate") return ct("stalemate");
    if (game.status === "draw") return ct("draw", { r: ct(`drawReasons.${game.drawReason ?? "other"}`) });
    if (game.status === "resigned") return ct("resigned");
    return game.winner === game.playerColor ? ct("youWon") : ct("cpuWon");
  }, [game, ct]);
}

export function ChessPage() {
  const [params] = useSearchParams();
  const nav = useNavigate();
  const { t } = useI18n();
  const { t: ct } = useChessText();
  const intro = useChessIntro();
  const f = useFormat();
  const { difficulty, color } = readChessSettings(params);

  const g = useChessGame(difficulty, color);
  const { game, captured: caps } = g;
  const resultText = useResultText(game);
  const playerColor = game?.playerColor ?? "w";
  const botColor: ChessColor = playerColor === "w" ? "b" : "w";

  const board = (
    <section className="mx-auto w-full max-w-[min(720px,calc(100vh-200px))]">
      <ChessPlayerStrip
        name={t("common.cpu")}
        color={botColor}
        captured={botColor === "w" ? caps.w : caps.b}
        advantage={botColor === "w" ? caps.diff : -caps.diff}
        active={g.thinking}
      />
      <div className="board-frame relative my-3">
        <ChessBoard
          fen={g.fen}
          orientation={playerColor === "b" ? "black" : "white"}
          position={g.position}
          lastMove={g.lastMove}
          selected={g.selected}
          canDrag={g.myTurn}
          onDrop={g.tryMove}
          onSquareClick={g.clickSquare}
        />
        <AnimatePresence>
          {g.promotion && (
            <PromotionPicker color={playerColor} onPick={g.choosePromotion} onCancel={g.cancelPromotion} />
          )}
          {resultText && (
            <ResultDialog
              title={resultText}
              width="px-8"
              actions={
                <>
                  <Button variant="primary" onClick={() => void g.newGame()}>
                    {t("common.newGame")}
                  </Button>
                  <Button onClick={() => nav("/")}>{t("common.home")}</Button>
                </>
              }
            />
          )}
        </AnimatePresence>
      </div>
      <ChessPlayerStrip
        name={t("common.you")}
        color={playerColor}
        captured={playerColor === "b" ? caps.b : caps.w}
        advantage={playerColor === "b" ? -caps.diff : caps.diff}
        active={g.myTurn}
      />
      {g.error && <p className="mt-2 text-sm text-rose-300">{f.error(g.error)}</p>}
    </section>
  );

  const sidebar = (
    <>
      <AiPanel ai={game?.ai} thinking={g.thinking} />
      <MoveList history={game?.history ?? []} />
      <div className="flex gap-2">
        <Button className="flex-1" onClick={() => void g.newGame()} disabled={g.thinking}>
          {t("common.newGame")}
        </Button>
        <Button
          className="flex-1"
          disabled={!game || game.status !== "playing" || g.thinking}
          onClick={() => void g.resign()}
        >
          {ct("resign")}
        </Button>
      </div>
    </>
  );

  return (
    <GameTemplate title={ct("title", { d: f.difficulty(difficulty) })} intro={intro} board={board} sidebar={sidebar} />
  );
}
