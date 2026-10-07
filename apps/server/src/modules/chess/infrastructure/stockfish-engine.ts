import { existsSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { ChessEngine, EngineLine } from "../application/ports";

/**
 * Stockfish 19 Lite (WASM) aynı süreç içinde çalışır — ayrı süreç açılmadığı için
 * Vercel Functions gibi sunucusuz ortamlarda da sorunsuzdur.
 * `ChessEngine` portunu uygular: satrançta aday hamleleri (MultiPV) ve puanlarını üretir.
 */

const require = createRequire(import.meta.url);
const ENGINE = "stockfish-19-lite-single";

/** Paketlenmiş fonksiyonda motor dosyaları yanımızda, geliştirmede node_modules'ta. */
function engineFiles(): { js: string; wasm: string } {
  const here = path.dirname(fileURLToPath(import.meta.url));
  const bundled = path.join(here, "stockfish", `${ENGINE}.js`);
  const dir = existsSync(bundled)
    ? path.dirname(bundled)
    : path.join(path.dirname(require.resolve("stockfish/package.json")), "bin");
  return { js: path.join(dir, `${ENGINE}.js`), wasm: path.join(dir, `${ENGINE}.wasm`) };
}

interface WasmEngine {
  listener?: (line: string) => void;
  locateFile: (p: string) => string;
  _isReady?: () => boolean;
  ccall: (name: string, ret: null, types: string[], args: string[], opts: { async: boolean }) => void;
}

async function createEngine(): Promise<(cmd: string) => void> {
  const { js, wasm } = engineFiles();
  const init = require(js) as () => (m: WasmEngine) => Promise<unknown>;
  const engine = { locateFile: (p: string) => (p.includes(".wasm") ? wasm : js) } as WasmEngine;
  await init()(engine);
  while (engine._isReady && !engine._isReady()) await new Promise((r) => setTimeout(r, 10));
  engine.listener = (line) => {
    for (const l of [...listeners]) l(line);
  };
  // "go" komutları asenkron çalışır; stockfish paketinin kendi yükleyicisi de böyle yapar.
  return (cmd) => setImmediate(() => engine.ccall("command", null, ["string"], [cmd], { async: /^go\b/.test(cmd) }));
}

let enginePromise: Promise<(cmd: string) => void> | null = null;
let listeners: ((line: string) => void)[] = [];
let queue: Promise<unknown> = Promise.resolve();

function send(): Promise<(cmd: string) => void> {
  enginePromise ??= createEngine().catch((e) => {
    enginePromise = null; // bir sonraki istekte yeniden dene
    throw e;
  });
  return enginePromise;
}

const MATE = 100_000;

export function parseInfo(line: string): { index: number; line: EngineLine } | null {
  const tokens = line.split(" ");
  const get = (key: string) => {
    const i = tokens.indexOf(key);
    return i >= 0 ? tokens[i + 1] : undefined;
  };
  const index = Number(get("multipv"));
  const pvIdx = tokens.indexOf("pv");
  if (!index || pvIdx < 0) return null;
  const pv = tokens.slice(pvIdx + 1);
  const scoreIdx = tokens.indexOf("score");
  const kind = tokens[scoreIdx + 1];
  const value = Number(tokens[scoreIdx + 2]);
  let score: number;
  let mate: number | undefined;
  if (kind === "mate") {
    mate = value;
    score = value > 0 ? MATE - value : -MATE - value;
  } else {
    score = value;
  }
  return { index, line: { uci: pv[0], score, mate, pv } };
}

async function runAnalysis(
  fen: string,
  opts: { depth: number; multiPv: number; timeoutMs?: number },
): Promise<EngineLine[]> {
  const cmd = await send();
  return new Promise<EngineLine[]>((resolve, reject) => {
    const lines = new Map<number, EngineLine>();
    const timer = setTimeout(() => cmd("stop"), opts.timeoutMs ?? 5000);
    const onLine = (line: string) => {
      if (line.startsWith("info") && line.includes(" multipv ") && line.includes(" pv ")) {
        const parsed = parseInfo(line);
        if (parsed) lines.set(parsed.index, parsed.line);
      } else if (line.startsWith("bestmove")) {
        clearTimeout(timer);
        listeners = listeners.filter((l) => l !== onLine);
        const result = [...lines.entries()].sort((a, b) => a[0] - b[0]).map(([, l]) => l);
        if (result.length === 0) {
          const best = line.split(" ")[1];
          if (best && best !== "(none)") result.push({ uci: best, score: 0, pv: [best] });
        }
        if (result.length) resolve(result);
        else reject(new Error("Stockfish found no move"));
      }
    };
    listeners.push(onLine);
    cmd("ucinewgame");
    cmd(`setoption name MultiPV value ${opts.multiPv}`);
    cmd(`position fen ${fen}`);
    cmd(`go depth ${opts.depth}`);
  });
}

/** `ChessEngine` portunun Stockfish uygulaması. Analizler tek motor üzerinde sırayla çalışır. */
export const stockfishEngine: ChessEngine = {
  analyse(fen: string, opts: { depth: number; multiPv: number; timeoutMs?: number }): Promise<EngineLine[]> {
    const job = queue.then(() => runAnalysis(fen, opts));
    queue = job.catch(() => undefined);
    return job;
  },
};
