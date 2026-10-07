/**
 * Oyun durumunu istemciye verilecek bir jetona çevirip geri okur.
 * Sunucu durumsuzdur; durum her istekte jetonla gelir.
 */
export interface GameStateStore {
  seal(state: unknown): string;
  /** Geçersiz/değiştirilmiş jetonda `AppError("gameNotFound")` fırlatır. */
  open<T>(token: unknown): T;
}
