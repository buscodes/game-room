import type { IncomingMessage, ServerResponse } from "node:http";
import { buildApp } from "./container";

const app = buildApp();

/**
 * Vercel Function giriş noktası. Yönlendirme kuralı `/api/<yol>` isteklerini
 * `/api?__p=<yol>` olarak bu fonksiyona gönderir; burada asıl yolu geri kurarız.
 * (Vercel özgün yolu koruyorsa `req.url` zaten `/api/...` olur, dokunmayız.)
 */
export default function handler(req: IncomingMessage, res: ServerResponse) {
  const url = new URL(req.url ?? "/", "http://localhost");
  const p = url.searchParams.get("__p");
  if (p !== null && !url.pathname.startsWith("/api/")) {
    url.searchParams.delete("__p");
    const qs = url.searchParams.toString();
    req.url = `/api/${p}${qs ? `?${qs}` : ""}`;
  }
  return app(req as Parameters<typeof app>[0], res as Parameters<typeof app>[1]);
}
