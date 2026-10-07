/**
 * Vercel için tek komutluk derleme (Build Output API v3).
 *
 *   .vercel/output/
 *     config.json                 yönlendirmeler
 *     static/                     Vite çıktısı (CDN'den sunulur)
 *     functions/api.func/
 *       index.mjs                 esbuild ile tek dosyaya paketlenmiş Express API
 *       stockfish/                Stockfish 19 Lite WASM (≈1.7 MB)
 *       .vc-config.json
 *
 * Vercel, derleme komutu `.vercel/output` ürettiğinde onu doğrudan yayınlar;
 * ayrıca sunucu, veritabanı ya da yapılandırma gerekmez.
 */
import { execSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import { cpSync, mkdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const out = path.join(root, ".vercel", "output");
const fn = path.join(out, "functions", "api.func");
const require = createRequire(path.join(root, "apps/server/package.json"));

const step = (msg) => console.log(`\n▶ ${msg}`);

step("Eski çıktı temizleniyor");
rmSync(out, { recursive: true, force: true });
mkdirSync(fn, { recursive: true });

step("Web derleniyor (Vite)");
execSync("npm run build -w @salon/web", { cwd: root, stdio: "inherit" });
cpSync(path.join(root, "apps/web/dist"), path.join(out, "static"), { recursive: true });

step("API paketleniyor (esbuild)");
await build({
  entryPoints: [path.join(root, "apps/server/src/main/vercel.ts")],
  outfile: path.join(fn, "index.mjs"),
  bundle: true,
  platform: "node",
  format: "esm",
  target: "node22",
  minify: false,
  sourcemap: false,
  legalComments: "none",
  // CommonJS bağımlılıklar (express vb.) ESM paket içinde `require` kullanabilsin
  banner: { js: "import { createRequire as __cr } from 'node:module'; const require = __cr(import.meta.url);" },
  logLevel: "warning",
});

step("Stockfish motoru kopyalanıyor");
const sfBin = path.join(path.dirname(require.resolve("stockfish/package.json")), "bin");
mkdirSync(path.join(fn, "stockfish"));
for (const f of ["stockfish-19-lite-single.js", "stockfish-19-lite-single.wasm"]) {
  cpSync(path.join(sfBin, f), path.join(fn, "stockfish", f));
}
// Stockfish yükleyicisi CommonJS; fonksiyon kökündeki "type" ayarından etkilenmesin.
writeFileSync(path.join(fn, "stockfish", "package.json"), JSON.stringify({ type: "commonjs" }));

step("Fonksiyon yapılandırması yazılıyor");
// GAME_SECRET proje ayarlarında tanımlıysa o kullanılır; değilse her dağıtıma özel rastgele
// bir anahtar üretilir (yeni dağıtımda eski oyunlar geçersiz olur — sorun değil).
const environment = process.env.GAME_SECRET ? {} : { GAME_SECRET: randomBytes(32).toString("hex") };
writeFileSync(
  path.join(fn, ".vc-config.json"),
  JSON.stringify(
    {
      runtime: "nodejs22.x",
      handler: "index.mjs",
      launcherType: "Nodejs",
      shouldAddHelpers: false,
      supportsResponseStreaming: false,
      maxDuration: 60,
      memory: 1024,
      environment: { NODE_ENV: "production", ...environment },
    },
    null,
    2,
  ),
);

step("Yönlendirmeler yazılıyor");
writeFileSync(
  path.join(out, "config.json"),
  JSON.stringify(
    {
      version: 3,
      routes: [
        // Tüm yanıtlara (API dahil) temel güvenlik başlıkları; `continue` ile sonraki kurallara geçer.
        {
          src: "/(.*)",
          headers: {
            "X-Content-Type-Options": "nosniff",
            "X-Frame-Options": "DENY",
            "Referrer-Policy": "strict-origin-when-cross-origin",
            "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
          },
          continue: true,
        },
        // Tüm /api/* istekleri tek fonksiyona; asıl yol __p parametresiyle taşınır.
        { src: "^/api/(.*)$", dest: "/api?__p=$1" },
        // Vite'ın içerik karmalı dosyaları uzun süre önbelleğe alınabilir.
        {
          src: "^/assets/index-[^/]+\\.(js|css)$",
          headers: { "cache-control": "public, max-age=31536000, immutable" },
          continue: true,
        },
        { handle: "filesystem" },
        // İstemci tarafı yönlendirme (/satranc, /pisti, /pis7li …)
        { src: "/(.*)", dest: "/index.html" },
      ],
    },
    null,
    2,
  ),
);

const mb = (p) => (statSync(p).size / 1024 / 1024).toFixed(2);
console.log(
  `\n✔ Hazır: .vercel/output  (api: ${mb(path.join(fn, "index.mjs"))} MB + stockfish wasm ${mb(
    path.join(fn, "stockfish", "stockfish-19-lite-single.wasm"),
  )} MB)`,
);
