/**
 * Kural ihlali kodları. Domain dil bilmez; metne çevirme sunum katmanının işidir.
 */
export type RuleViolationCode =
  | "notYourTurn"
  | "handNotPlaying"
  | "cardNotInHand"
  | "cannotStartNextHand"
  | "mustChooseSuit"
  | "alreadyDrew"
  | "mustDrawFirst"
  | "onlyDrawnCard"
  | "penaltyPending"
  | "doesNotMatch";

export type ErrorParams = Record<string, string | number>;

export class RuleViolation extends Error {
  constructor(
    public readonly code: RuleViolationCode,
    public readonly params: ErrorParams = {},
  ) {
    super(code);
    this.name = "RuleViolation";
  }
}
