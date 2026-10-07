import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Mimari kurallar:
 *  - Katmanlar: bağımlılıklar yalnızca içe doğru akar (presentation/interface → application → domain).
 *  - Modüller: her oyun ayrı modüldür; bir modül diğerine yalnızca onun `index.ts`'i üzerinden erişir,
 *    `shared` hiçbir modülü bilmez.
 *  - Atomic Design (her modülün içinde): atoms → molecules → organisms → templates → pages.
 */
const root = path.resolve(__dirname, "..");
const rel = (p: string) => path.relative(root, p).split(path.sep).join("/");

function files(dir: string): string[] {
  return readdirSync(dir).flatMap((f) => {
    const p = path.join(dir, f);
    return statSync(p).isDirectory() ? files(p) : /\.(ts|tsx)$/.test(f) ? [p] : [];
  });
}

/** Dosyadaki import edilen modüller; göreli olanlar kök dizine göre yola çevrilir. */
function imports(file: string): string[] {
  const src = readFileSync(file, "utf8");
  return [...src.matchAll(/(?:import|export)[^"']*from\s+["']([^"']+)["']/g)].map(([, m]) =>
    m.startsWith(".") ? rel(path.resolve(path.dirname(file), m)) : m,
  );
}

const all = [
  ...files(path.join(root, "packages")),
  ...files(path.join(root, "apps/server/src")),
  ...files(path.join(root, "apps/web/src")),
].map((f) => ({ file: rel(f), imports: imports(f) }));

function violations(where: RegExp, forbidden: (m: string, file: string) => boolean): string[] {
  return all
    .filter((f) => where.test(f.file))
    .flatMap((f) => f.imports.filter((m) => forbidden(m, f.file)).map((m) => `${f.file} → ${m}`));
}

/** "apps/web/src/features/chess/..." → { kind: "features", name: "chess" } */
function moduleOf(p: string): { app: string; name: string } | null {
  const m = p.match(/^apps\/(web|server)\/src\/(features|modules)\/([^/]+)/);
  return m ? { app: m[1], name: m[3] } : null;
}

describe("katman kuralları", () => {
  const cases: [string, RegExp, (m: string) => boolean][] = [
    [
      "domain saf kalır",
      /^packages\/domain\//,
      (m) => m.startsWith("@salon/contracts") || m.startsWith("apps/") || ["react", "express"].includes(m),
    ],
    [
      "contracts uygulamaları bilmez",
      /^packages\/contracts\//,
      (m) => m.startsWith("apps/") || ["react", "express"].includes(m),
    ],
    [
      "sunucu application → altyapı/arayüz/main yok",
      /^apps\/server\/src\/(shared|modules\/[^/]+)\/application\//,
      (m) => /\/(infrastructure|interface|main)\//.test(m) || m === "express",
    ],
    [
      "sunucu infrastructure → arayüz/main yok",
      /^apps\/server\/src\/(shared|modules\/[^/]+)\/infrastructure\//,
      (m) => /\/(interface|main)\//.test(m) || m === "express",
    ],
    [
      "sunucu interface → altyapı/main yok",
      /^apps\/server\/src\/(shared|modules\/[^/]+)\/interface\//,
      (m) => /\/(infrastructure|main)\//.test(m),
    ],
    [
      "web application → altyapı/sunum yok",
      /^apps\/web\/src\/(shared|features\/[^/]+)\/application\//,
      (m) => /\/(infrastructure|presentation)\//.test(m),
    ],
    [
      "web infrastructure → sunum yok",
      /^apps\/web\/src\/(shared|features\/[^/]+)\/infrastructure\//,
      (m) => /\/presentation\//.test(m) || m === "react",
    ],
    [
      "web presentation → altyapı yok",
      /^apps\/web\/src\/(shared|features\/[^/]+)\/presentation\//,
      (m) => /\/infrastructure\//.test(m),
    ],
  ];
  for (const [name, where, forbidden] of cases) it(name, () => expect(violations(where, forbidden)).toEqual([]));
});

describe("modül kuralları", () => {
  it("shared hiçbir oyun modülünü bilmez", () => {
    expect(violations(/^apps\/(web|server)\/src\/shared\//, (m) => /\/(features|modules|app|main)\//.test(m))).toEqual(
      [],
    );
  });

  it("modüller birbirine yalnızca index.ts üzerinden erişir", () => {
    expect(
      violations(/^apps\/(web|server)\/src\/(features|modules)\//, (m, file) => {
        const from = moduleOf(file);
        const to = moduleOf(m);
        if (!from || !to || from.name === to.name) return false;
        return !/^apps\/(web|server)\/src\/(features|modules)\/[^/]+(\/index)?$/.test(m);
      }),
    ).toEqual([]);
  });

  it("dışarıdan (app/main) modüllere yalnızca index.ts üzerinden erişilir", () => {
    expect(
      violations(/^apps\/(web\/src\/app|server\/src\/main)\//, (m) => {
        const to = moduleOf(m);
        return !!to && !/^apps\/(web|server)\/src\/(features|modules)\/[^/]+(\/index)?$/.test(m);
      }),
    ).toEqual([]);
  });
});

describe("atomic design (her modülün içinde)", () => {
  const order = ["atoms", "molecules", "organisms", "templates", "pages"];
  order.forEach((level, i) => {
    const higher = order.slice(i + 1);
    if (!higher.length) return;
    it(`${level} yalnızca kendinden küçük seviyeleri kullanır`, () => {
      const re = new RegExp(`/presentation/(${higher.join("|")})/`);
      expect(
        violations(new RegExp(`^apps/web/src/(shared|features/[^/]+)/presentation/${level}/`), (m) => re.test(m)),
      ).toEqual([]);
    });
  });
});
