import express, { type NextFunction, type Request, type Response } from "express";
import { RuleViolation } from "@salon/domain";
import type { ApiErrorBody, AppErrorCode } from "@salon/contracts";
import { AppError } from "../../application/errors";
import type { HttpModule } from "./module";

const STATUS: Record<AppErrorCode, number> = {
  gameNotFound: 404,
  gameOver: 409,
  invalidMove: 400,
  badRequest: 400,
  serverError: 500,
};

/**
 * HTTP uygulaması: oyun modüllerini adreslerine bağlar, hataları dilden bağımsız kodlarla döndürür.
 * Hiçbir oyunu tanımaz; modüller bileşim kökünden gelir.
 */
export function createApp(modules: HttpModule[]) {
  const app = express();
  app.disable("x-powered-by");
  app.use(express.json({ limit: "256kb" }));
  app.use((req, res, next) => {
    // Gövdesiz/JSON olmayan isteklerde route'lar `undefined` yerine boş nesne görsün.
    req.body ??= {};
    res.set({ "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" });
    next();
  });

  app.get("/api/health", (_req, res) => res.json({ ok: true }));
  for (const m of modules) app.use(m.basePath, m.router);

  app.use("/api", (_req, res) => {
    res.status(404).json({ error: { code: "gameNotFound" } } satisfies ApiErrorBody);
  });

  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    let body: ApiErrorBody;
    let status: number;
    if (err instanceof RuleViolation) {
      status = 400;
      body = { error: { code: err.code, params: err.params } };
    } else if (err instanceof AppError) {
      status = STATUS[err.code];
      body = { error: { code: err.code } };
    } else if (err instanceof SyntaxError || (err as { type?: string })?.type === "entity.parse.failed") {
      status = 400;
      body = { error: { code: "badRequest" } };
    } else {
      console.error(err);
      status = 500;
      body = { error: { code: "serverError" } };
    }
    res.status(status).json(body);
  });

  return app;
}
