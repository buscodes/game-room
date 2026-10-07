import type { tr } from "./tr";

export const en: typeof tr = {
  title: "Pishti · {d}",
  tableCount: "{n} cards on table",
  tableEmpty: "Table is empty",
  pistiCount: "{n} pishti",
  youPisti: "Pishti!",
  cpuPisti: "The computer made a Pishti!",
  score: "Score",
  handTarget: "Hand {h} · target {t}",
  yourTurn: " · Your turn",
  cpuTurn: " · Computer is playing",
  youWonGame: "You won the game! 🎉",
  cpuWonGame: "The computer won the game",
  handOver: "Hand {n} is over",
  total: "Total",
  nextHand: "Next hand",
  sheet: {
    cards: "Cards captured",
    majority: "Most cards (3)",
    pistis: "Pishti",
    aces: "Aces",
    jacks: "Jacks",
    clubs2: "2 of clubs",
    diamonds10: "10 of diamonds",
    total: "Hand total",
  },
  rules: [
    "Playing a card of the same rank as the top card, or a Jack, captures the whole pile.",
    "Capturing a single-card pile with the same rank is a Pishti: 10 points (Jack on Jack: 20).",
    "Ace 1, Jack 1, 2 of clubs 2, 10 of diamonds 3, most cards 3 points.",
    "When the deck runs out, the last player to capture takes the remaining table.",
  ],
  lobby: { title: "Pishti", play: "Play Pishti", endScore: "Target score" },
  intro: [
    {
      title: "Welcome to Pishti",
      text: "4 cards are laid on the table and each of you gets 4. You take turns playing one card.",
    },
    {
      title: "Same rank captures",
      text: "Play a card with the same rank as the top card and you capture every card on the table.",
    },
    { title: "A Jack takes it all", text: "A Jack captures the pile no matter which card it lands on." },
    {
      title: "PISHTI!",
      text: "Capturing a single card with the same rank is a Pishti: 10 points. Jack on Jack is 20!",
    },
    {
      title: "Points",
      text: "Ace 1, Jack 1, 2 of clubs 2, 10 of diamonds 3; most cards captured gets 3. First to the target wins.",
    },
  ],
  shout: "PISHTI!",
};
