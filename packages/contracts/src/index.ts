export * from "./errors";
export * from "./chess";
export * from "./pisti";
export * from "./pis7";

/** Yalnızca jeton gönderen istekler (pas, kart çek, sonraki el …). */
export interface TokenRequest {
  token: string;
}
