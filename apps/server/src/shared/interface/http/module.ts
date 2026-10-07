import type { Router } from "express";

/** Bir oyun modülünün HTTP'ye açtığı yüz: hangi adreste hangi router. */
export interface HttpModule {
  basePath: string;
  router: Router;
}
