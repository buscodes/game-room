import { useNavigate, useSearchParams } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { usePis7Game } from "../../application/usePis7Game";
import { useI18n } from "../../../../shared/presentation/i18n/I18nProvider";
import { useFormat } from "../../../../shared/presentation/i18n/useFormat";
import { usePis7Text } from "../i18n";
import { readPis7Settings } from "../route";
import { usePis7Narration } from "../i18n/usePis7Narration";
import { usePis7Intro } from "../organisms/pis7Intro";
import { Button } from "../../../../shared/presentation/atoms/Button";
import { Panel, PanelTitle } from "../../../../shared/presentation/atoms/Panel";
import { BigToast } from "../../../../shared/presentation/molecules/BigToast";
import { PlayerBadge } from "../../../../shared/presentation/molecules/PlayerBadge";
import { ScoreBox } from "../../../../shared/presentation/molecules/ScoreBox";
import { AiPanel } from "../../../../shared/presentation/organisms/AiPanel";
import { EventLog } from "../organisms/EventLog";
import { HelpBar } from "../organisms/HelpBar";
import { HintNotice } from "../organisms/HintNotice";
import { JackSuitPicker } from "../organisms/JackSuitPicker";
import { DiscardPile } from "../organisms/DiscardPile";
import { DrawPile } from "../organisms/DrawPile";
import { OpponentSeats } from "../organisms/OpponentSeats";
import { Pis7Hand } from "../organisms/Pis7Hand";
import { Pis7RoundSummary } from "../organisms/Pis7RoundSummary";
import { ResultDialog } from "../../../../shared/presentation/organisms/ResultDialog";
import { RulesPanel } from "../../../../shared/presentation/organisms/RulesPanel";
import { GameTemplate } from "../../../../shared/presentation/templates/GameTemplate";

export function Pis7Page() {
  const [params] = useSearchParams();
  const nav = useNavigate();
  const { t } = useI18n();
  const { t: p7, dict: p7dict } = usePis7Text();
  const intro = usePis7Intro();
  const f = useFormat();
  const { difficulty, target, players: playerCount } = readPis7Settings(params);

  const g = usePis7Game(difficulty, target, playerCount);
  const { game, display, hand, myTurn, players } = g;
  const text = usePis7Narration(game, players, g.busy);

  const actor = game?.ai?.actor;

  const board = (
    <section className="flex flex-col gap-3">
      <div className="felt relative flex min-h-[620px] flex-col justify-between gap-4 rounded-3xl p-4 sm:p-6">
        <OpponentSeats
          players={players}
          counts={display?.counts ?? []}
          activePlayer={game?.phase === "playing" ? game.turn : null}
          name={text.name}
        />

        <div className="flex items-center justify-center gap-10 sm:gap-20">
          <DrawPile
            deckCount={game?.deckCount ?? 0}
            canDraw={myTurn && !!game?.canDraw}
            mustDraw={myTurn && !!game?.canDraw && game.playable.length === 0}
            pendingDraw={game?.pendingDraw ?? 0}
            onDraw={g.draw}
          />
          <DiscardPile pile={display?.pile ?? []} suit={display?.suit} pendingDraw={display?.pendingDraw ?? 0} />
        </div>

        <div className="flex items-end justify-between gap-3">
          <PlayerBadge
            name={t("common.you")}
            active={myTurn}
            lines={[t("common.cards", { n: hand.length })]}
            warning={hand.length === 1 ? t("common.oneCardLeft") : undefined}
          />
          <Pis7Hand
            cards={hand}
            myTurn={myTurn}
            playable={(c) => !!game?.playable.includes(c.id)}
            hintedId={g.hint?.cardId}
            titleFor={(c) => text.reasonFor(c) ?? p7(c.rank === "J" ? "playTitleJack" : "playTitle", { c: f.card(c) })}
            onPlay={g.playCard}
          />
          <div className="hidden w-24 sm:block" />
        </div>

        <AnimatePresence>
          {g.toast && (
            <BigToast
              className="text-red-400"
              text={g.toast.sevenToYou ? p7("toastSevenYou") : p7("toastSevenOther")}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {g.jackCard && (
            <JackSuitPicker
              hand={hand}
              jack={g.jackCard}
              onPick={(s) => g.jackCard && g.playCard(g.jackCard, s)}
              onCancel={g.cancelJack}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {game && game.phase !== "playing" && !g.busy && game.lastRound && (
            <ResultDialog
              rounded="rounded-3xl"
              width="w-[min(96%,520px)]"
              title={
                game.phase === "gameOver"
                  ? game.winner === 0
                    ? p7("youWonGame")
                    : p7("otherWonGame", { name: text.name(game.winner ?? 1) })
                  : game.lastRound.winner === 0
                    ? p7("youFinished")
                    : p7("otherFinished", { name: text.name(game.lastRound.winner) })
              }
              actions={
                game.phase === "roundOver" ? (
                  <Button variant="primary" onClick={g.nextRound}>
                    {p7("nextRound")}
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
              <Pis7RoundSummary
                scores={game.scores}
                lastRound={game.lastRound}
                target={game.target}
                reveal={game.reveal}
                name={text.name}
              />
            </ResultDialog>
          )}
        </AnimatePresence>
      </div>

      <HelpBar text={text.helpText}>
        <Button className="py-2" onClick={() => void g.askHint()} disabled={!myTurn || g.hintLoading}>
          {g.hintLoading ? p7("hintLoading") : p7("hint")}
        </Button>
        {game?.canPass && myTurn && (
          <Button className="py-2" onClick={g.pass}>
            {p7("pass")}
          </Button>
        )}
        {game?.canDraw && myTurn && (
          <Button variant="primary" className="py-2" onClick={g.draw}>
            {game.pendingDraw ? p7("drawN", { n: game.pendingDraw }) : p7("draw")}
          </Button>
        )}
      </HelpBar>
      <AnimatePresence>{g.hint && <HintNotice text={text.hintText(g.hint)} />}</AnimatePresence>
      {g.error && <p className="text-sm text-rose-300">{f.error(g.error)}</p>}
    </section>
  );

  const sidebar = (
    <>
      <Panel>
        <PanelTitle>{p7("penalty")}</PanelTitle>
        <div className={`grid gap-2 text-center ${players === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
          {(game?.scores ?? Array<number>(players).fill(0)).map((v, p) => (
            <ScoreBox key={p} label={text.name(p)} value={v} active={game?.turn === p && game.phase === "playing"} />
          ))}
        </div>
        <p className="mt-2 text-center text-xs text-zinc-400">
          {game ? p7("roundInfo", { r: game.round, t: game.target }) : ""}
        </p>
      </Panel>
      <AiPanel
        ai={game?.ai}
        thinking={g.busy && !!game && game.turn !== 0}
        title={actor !== undefined && players > 2 ? t("aiPanel.titleOf", { name: text.name(actor) }) : undefined}
      />
      <EventLog
        title={p7("events")}
        entries={g.log.map(({ id, event }) => ({
          id,
          text: text.describe(event),
          player: "player" in event ? event.player : undefined,
        }))}
      />
      <RulesPanel rules={p7dict.rules} open />
      <Button className="w-full" onClick={() => void g.newGame()} disabled={g.busy}>
        {t("common.newGame")}
      </Button>
    </>
  );

  return (
    <GameTemplate title={p7("title", { d: f.difficulty(difficulty) })} intro={intro} board={board} sidebar={sidebar} />
  );
}
