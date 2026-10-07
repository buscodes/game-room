/** Aday hamle üreten satranç motoru (ör. Stockfish). Altyapı katmanında uygulanır. */
export interface EngineLine {
  uci: string;
  /** Sıradaki taraf açısından santipiyon; mat için ±(100000 - hamle). */
  score: number;
  mate?: number;
  pv: string[];
}

export interface ChessEngine {
  analyse(fen: string, opts: { depth: number; multiPv: number; timeoutMs?: number }): Promise<EngineLine[]>;
}
