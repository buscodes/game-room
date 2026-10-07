import type { AppErrorCode } from "@salon/contracts";

/** Uygulama katmanı hatası (kural ihlalleri domain'deki `RuleViolation` ile gelir). */
export class AppError extends Error {
  constructor(public readonly code: AppErrorCode) {
    super(code);
    this.name = "AppError";
  }
}
