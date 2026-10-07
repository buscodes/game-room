import { useNavigate, useSearchParams } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import type { PlayerIndex } from "@salon/domain";
import { usePistiGame } from "../../application/usePistiGame";
import { useI18n } from "../../../../shared/presentation/i18n/I18nProvider";
import { usePistiText } from "../i18n";
import { readPistiSettings } from "../route";
import { usePistiIntro } from "../organisms/pistiIntro";
import { useFormat } from "../../../../shared/presentation/i18n/useFormat";
import { Button } from "../../../../shared/presentation/atoms/Button";
import { Panel, PanelTitle } from "../../../../shared/presentation/atoms/Panel";
import { BigToast } from "../../../../shared/presentation/molecules/BigToast";
import { CardStack } from "../../../../shared/presentation/molecules/CardStack";
import { PlayerBadge } from "../../../../shared/presentation/molecules/PlayerBadge";
import { ScoreBox } from "../../../../shared/presentation/molecules/ScoreBox";
import { AiPanel } from "../../../../shared/presentation/organisms/AiPanel";
import { ResultDialog } from "../../../../shared/presentation/organisms/ResultDialog";
import { RulesPanel } from "../../../../shared/presentation/organisms/RulesPanel";
import { OpponentHand } from "../organisms/OpponentHand";
import { PlayerHand } from "../organisms/PlayerHand";
import { ScoreSheet } from "../organisms/ScoreSheet";
import { TablePile } from "../organisms/TablePile";
import { CARD_WIDTH, SIDE_WIDTH } from "../layout";
import { CapturedPile } from "../molecules/CapturedPile";
import { GameTemplate } from "../../../../shared/presentation/templates/GameTemplate";

export function PistiPage() {
  const [params] = useSearchParams();
  const nav = useNavigate();
  const { t } = useI18n();
  const { t: pt, dict: pdict } = usePistiText();
  const intro = usePistiIntro();
  const f = useFormat();
  const { difficulty, target } = readPistiSettings(params);

  const g = usePistiGame(difficulty, target);
  const { game, view, myTurn } = g;
  const badgeLines = (p: PlayerIndex) => [
    t("common.cards", { n: game?.capturedCount[p] ?? 0 }),
    pt("pistiCount", { n: game?.pistiCount[p] ?? 0 }),
  ];

  const board = (
    <section className="felt relative flex min-h-[640px] flex-col justify-between rounded-3xl p-4 sm:p-6">
      {/* Rakip */}
      <div className="flex items-start justify-between">
        <PlayerBadge name={t("common.cpu")} lines={badgeLines(1)} active={g.busy && !myTurn} className={SIDE_WIDTH} />
        <OpponentHand count={view.opponentCount} />
        <CapturedPile count={game?.capturedCount[1] ?? 0} />
      </div>

      {/* Masa */}
      <div className="flex items-center justify-center gap-8 sm:gap-16">
        <div className="relative text-center">
          <CardStack count={game?.deckCount ?? 0} variant="deck" per={8} className={CARD_WIDTH} />
          <div className="mt-2 text-xs text-emerald-100/80">{t("common.deck", { n: game?.deckCount ?? 0 })}</div>
        </div>
        <TablePile cards={view.table} landFrom={view.landFrom} collector={view.collector} />
      </div>

      {/* Oyuncu */}
      <div className="flex items-end justify-between">
        <PlayerBadge name={t("common.you")} lines={badgeLines(0)} active={myTurn} className={SIDE_WIDTH} />
        <PlayerHand
          cards={view.hand}
          enabled={myTurn}
          highlight={(c) => difficulty === "easy" && g.captures(c)}
          onPlay={(c) => void g.play(c)}
        />
        <CapturedPile count={game?.capturedCount[0] ?? 0} />
      </div>

      <AnimatePresence>
        {g.toast && (
          <BigToast
            text={`${g.toast.player === 0 ? pt("youPisti") : pt("cpuPisti")} +${g.toast.kind === "jack" ? 20 : 10}`}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {game && game.phase !== "playing" && !g.busy && game.lastHandScore && (
          <ResultDialog
            rounded="rounded-3xl"
            title={
              game.phase === "gameOver"
                ? game.winner === 0
                  ? pt("youWonGame")
                  : pt("cpuWonGame")
                : pt("handOver", { n: game.handNo })
            }
            actions={
              game.phase === "handOver" ? (
                <Button variant="primary" onClick={() => void g.nextHand()}>
                  {pt("nextHand")}
                </Button>
              ) : (
                <>
                  <Button variant="primary" onClick={() => void g.newGame()}>
                    {t("common.newGame")}
                  </Button>
                  <Button onClick={() => nav("/")}>{t("common.home")}</Button>
                </>
              )
            }
          >
            <div className="mt-3 text-left">
              <ScoreSheet score={game.lastHandScore} />
            </div>
            <p className="mt-3 text-sm text-zinc-300">
              {pt("total")}:{" "}
              <b>
                {t("common.you")} {game.scores[0]}
              </b>{" "}
              ·{" "}
              <b>
                {t("common.cpu")} {game.scores[1]}
              </b>{" "}
              / {game.target}
            </p>
          </ResultDialog>
        )}
      </AnimatePresence>
    </section>
  );

  const sidebar = (
    <>
      <Panel>
        <PanelTitle>{pt("score")}</PanelTitle>
        <div className="grid grid-cols-2 gap-2 text-center">
          <ScoreBox label={t("common.you")} value={game?.scores[0] ?? 0} />
          <ScoreBox label={t("common.cpu")} value={game?.scores[1] ?? 0} />
        </div>
        <p className="mt-2 text-center text-xs text-zinc-400">
          {game ? pt("handTarget", { h: game.handNo, t: game.target }) : ""}
          {game && game.phase === "playing" && (myTurn ? pt("yourTurn") : pt("cpuTurn"))}
        </p>
        {g.error && <p className="mt-2 text-sm text-rose-300">{f.error(g.error)}</p>}
      </Panel>
      <AiPanel ai={game?.ai} thinking={g.busy && !!game && game.turn === 1} />
      <RulesPanel rules={pdict.rules} />
      <Button className="w-full" onClick={() => void g.newGame()} disabled={g.busy}>
        {t("common.newGame")}
      </Button>
    </>
  );

  return (
    <GameTemplate title={pt("title", { d: f.difficulty(difficulty) })} intro={intro} board={board} sidebar={sidebar} />
  );
}
