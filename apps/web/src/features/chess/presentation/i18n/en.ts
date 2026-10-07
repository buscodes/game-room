import type { tr } from "./tr";

export const en: typeof tr = {
  title: "Chess · {d}",
  promotion: "Promotion: which piece?",
  moves: "Moves",
  noMoves: "No moves yet.",
  resign: "Resign",
  stalemate: "Stalemate — draw",
  draw: "Draw ({r})",
  drawReasons: {
    threefold: "threefold repetition",
    insufficient: "insufficient material",
    fifty: "50-move rule",
    other: "draw",
  },
  resigned: "You resigned — the computer wins",
  youWon: "Checkmate! You win 🎉",
  cpuWon: "Checkmate — the computer wins",
  lobby: {
    title: "Chess",
    play: "Play chess",
    yourColor: "Your color",
    white: "White",
    black: "Black",
    random: "Random",
  },
  intro: [
    {
      title: "Your opponent: the computer",
      text: "The computer chooses among candidate moves found by the Stockfish chess engine, according to its level.",
    },
    {
      title: "Drag or click a piece",
      text: "Click a piece and the squares it can reach are marked with dots. You can also drag and drop.",
    },
    {
      title: "Inside your opponent's mind",
      text: "The side panel shows live the probability the computer gives each candidate move and how it rates the position.",
    },
    {
      title: "Three levels",
      text: "Easy: random candidates, chosen by dice. Medium: strong candidates. Hard: the best, with engine scores.",
    },
    {
      title: "Goal: checkmate",
      text: "Attack the enemy king so it cannot escape. Stalemate, threefold repetition and the 50-move rule are draws.",
    },
  ],
};
