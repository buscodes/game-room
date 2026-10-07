import {
  SUITS,
  choosePis7Action,
  createPis7Game,
  isDifficulty,
  PIS7_PLAYERS,
  PIS7_TARGET,
  readInRange,
  pis7Draw,
  pis7NextRound,
  pis7Pass,
  pis7Play,
  RuleViolation,
  type BotDecision,
  type BotOption,
  type Difficulty,
  type Pis7Event,
  type Pis7State,
  type Suit,
} from "@salon/domain";
import type { GameStateStore } from "../../../shared/application/ports";

/** Jetonda saklanan Pis Yedili oyunu. */
export interface Pis7Game {
  state: Pis7State;
  difficulty: Difficulty;
}

export interface Pis7GameView {
  token: string;
  game: Pis7Game;
  events: Pis7Event[];
  decision?: BotDecision;
}

export interface Pis7HintView {
  action: "play" | "draw" | "pass";
  cardId?: string;
  suit?: Suit;
  option: BotOption;
}

type Step = (s: Pis7State) => { state: Pis7State; events: Pis7Event[] };

export function makePis7UseCases(deps: { store: GameStateStore }) {
  /** Sıra tekrar insana gelene kadar botları oynatır. */
  const runBots = (g: Pis7Game) => {
    const events: Pis7Event[] = [];
    let decision: BotDecision | undefined;
    for (let guard = 0; guard < 300 && g.state.phase === "playing" && g.state.turn !== 0; guard++) {
      const p = g.state.turn;
      const a = choosePis7Action(g.state, p, g.difficulty);
      const r =
        a.action === "play"
          ? pis7Play(g.state, p, a.cardId!, a.suit)
          : a.action === "draw"
            ? pis7Draw(g.state, p)
            : pis7Pass(g.state, p);
      g.state = r.state;
      decision = a.decision;
      events.push(...r.events);
    }
    return { events, decision };
  };

  /** İnsan hamlesini uygular, ardından botları oynatır. */
  const act = (token: unknown, step: Step): Pis7GameView => {
    const g = deps.store.open<Pis7Game>(token);
    const r = step(g.state);
    g.state = r.state;
    const bots = runBots(g);
    return { token: deps.store.seal(g), game: g, events: [...r.events, ...bots.events], decision: bots.decision };
  };

  return {
    newGame(input: { difficulty?: unknown; target?: unknown; players?: unknown }): Pis7GameView {
      const difficulty = isDifficulty(input.difficulty) ? input.difficulty : "medium";
      const g: Pis7Game = {
        state: createPis7Game({
          target: readInRange(input.target, PIS7_TARGET),
          players: readInRange(input.players, PIS7_PLAYERS),
        }),
        difficulty,
      };
      return { token: deps.store.seal(g), game: g, events: [] };
    },

    play(input: { token: unknown; cardId: string; suit?: unknown }): Pis7GameView {
      const suit = SUITS.includes(input.suit as Suit) ? (input.suit as Suit) : undefined;
      return act(input.token, (s) => pis7Play(s, 0, String(input.cardId), suit));
    },

    draw: (input: { token: unknown }) => act(input.token, (s) => pis7Draw(s, 0)),
    pass: (input: { token: unknown }) => act(input.token, (s) => pis7Pass(s, 0)),
    nextRound: (input: { token: unknown }) => act(input.token, (s) => ({ state: pis7NextRound(s), events: [] })),

    /** "İpucu": oyuncu için zor seviye mantığıyla en iyi hamleyi önerir. */
    hint(input: { token: unknown }): Pis7HintView {
      const g = deps.store.open<Pis7Game>(input.token);
      if (g.state.phase !== "playing" || g.state.turn !== 0) throw new RuleViolation("notYourTurn");
      const a = choosePis7Action(g.state, 0, "hard");
      return { action: a.action, cardId: a.cardId, suit: a.suit, option: a.option };
    },
  };
}

export type Pis7UseCases = ReturnType<typeof makePis7UseCases>;
