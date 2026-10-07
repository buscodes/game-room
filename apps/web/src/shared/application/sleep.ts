/** Animasyon adımları arasında beklemek için. */
export const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));
