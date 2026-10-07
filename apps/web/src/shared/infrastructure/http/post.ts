import type { ApiErrorBody } from "@salon/contracts";
import { ApiError } from "../../application/errors";

/** API'ye JSON POST; hata yanıtını dilden bağımsız `ApiError`'a çevirir. */
export async function post<T>(path: string, body: unknown): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`/api${path}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    throw new ApiError("network");
  }
  const data = (await res.json().catch(() => null)) as unknown;
  if (!res.ok) {
    const err = (data as Partial<ApiErrorBody> | null)?.error;
    throw new ApiError(err?.code ?? "serverError", err?.params);
  }
  return data as T;
}
