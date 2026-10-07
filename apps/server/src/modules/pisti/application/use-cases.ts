import {
  choosePistiCard,
  createPistiGame,
  isDifficulty,
  PISTI_TARGET,
  readInRange,
  playCard,
  startNextHand,
  type BotDecision,
  type Difficulty,
  type PistiState,
  type PlayEvent,
} from "@salon/domain";
import type { GameStateStore } from "../../../shared/application/ports";

/** Jetonda saklanan pişti oyunu. */
export interface PistiGame {
  state: PistiState;
  difficulty: Difficulty;
}

export interface PistiGameView {
  token: string;
  game: PistiGame;
  events: PlayEvent[];
  decision?: BotDecision;
}

export function makePistiUseCases(deps: { store: GameStateStore }) {
  /** Sıra bottaysa oynatır; oynadığı hamleleri ve son kararını döner. */
  const runBot = (g: PistiGame) => {
    const events: PlayEvent[] = [];
    let decision: BotDecision | undefined;
    while (g.state.phase === "playing" && g.state.turn === 1) {
      const choice = choosePistiCard(g.state, g.difficulty);
      const r = playCard(g.state, 1, choice.cardId);
      g.state = r.state;
      decision = choice.decision;
      events.push(r.event);
    }
    return { events, decision };
  };

  const view = (g: PistiGame, events: PlayEvent[], decision?: BotDecision): PistiGameView => ({
    token: deps.store.seal(g),
    game: g,
    events,
    decision,
  });

  return {
    newGame(input: { difficulty?: unknown; target?: unknown }): PistiGameView {
      const difficulty = isDifficulty(input.difficulty) ? input.difficulty : "medium";
      const g: PistiGame = { state: createPistiGame({ target: readInRange(input.target, PISTI_TARGET) }), difficulty };
      const bot = runBot(g);
      return view(g, bot.events, bot.decision);
    },

    play(input: { token: unknown; cardId: string }): PistiGameView {
      const g = deps.store.open<PistiGame>(input.token);
      const r = playCard(g.state, 0, String(input.cardId));
      g.state = r.state;
      const bot = runBot(g);
      return view(g, [r.event, ...bot.events], bot.decision);
    },

    nextHand(input: { token: unknown }): PistiGameView {
      const g = deps.store.open<PistiGame>(input.token);
      g.state = startNextHand(g.state);
      const bot = runBot(g);
      return view(g, bot.events, bot.decision);
    },
  };
}

export type PistiUseCases = ReturnType<typeof makePistiUseCases>;
