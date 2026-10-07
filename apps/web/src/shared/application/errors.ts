import type { ApiErrorCode } from "@salon/contracts";

export type ClientErrorCode = ApiErrorCode | "network";

/** API çağrısı hatası: metin değil kod taşır; sunum katmanı kullanıcının dilinde gösterir. */
export class ApiError extends Error {
  constructor(
    public readonly code: ClientErrorCode,
    public readonly params: Record<string, string | number> = {},
  ) {
    super(code);
    this.name = "ApiError";
  }
}

export const toApiError = (e: unknown): ApiError => (e instanceof ApiError ? e : new ApiError("network"));
