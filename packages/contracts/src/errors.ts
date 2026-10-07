import type { ErrorParams, RuleViolationCode } from "@salon/domain";

/** Uygulama katmanının hata kodları (kural ihlalleri dışındakiler). */
export type AppErrorCode = "gameNotFound" | "gameOver" | "invalidMove" | "badRequest" | "serverError";

export type ApiErrorCode = RuleViolationCode | AppErrorCode;

/** Tüm hata yanıtlarının gövdesi. Metin yoktur; istemci kodu kendi dilinde gösterir. */
export interface ApiErrorBody {
  error: { code: ApiErrorCode; params?: ErrorParams };
}
