import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

// Guards the Controller → Service → Store layering described in
// docs/engineering/server/patterns.md: SQL lives only in stores.
const root = fileURLToPath(
  new URL("../../../apps/server/src", import.meta.url),
);
function files(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return files(path);
    return entry.name.endsWith(".ts") ? [path] : [];
  });
}
// Strip comments so prose that mentions `.query(` or "pg" never counts.
function code(file: string) {
  return readFileSync(file, "utf8")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^\s*\/\/.*$/gm, "");
}
const sql = /\.query\s*[<(]/;
const pgImport = /from\s+["']pg["']/;
const all = files(root);
const controllers = all.filter((f) => /\.controller\.ts$/.test(f));
const services = all.filter((f) => /(\.|-)service\.ts$/.test(f));
const stores = all.filter((f) => /(^|[./-])store(-[a-z]+)?\.ts$/.test(f));
const name = (file: string) => relative(root, file);

describe("server layering: Controller → Service → Store", () => {
  it("finds the files it is meant to guard", () => {
    expect(controllers.length).toBeGreaterThanOrEqual(8);
    expect(services.length).toBeGreaterThanOrEqual(10);
    expect(stores.length).toBeGreaterThanOrEqual(15);
  });

  it("keeps SQL and the pg driver out of controllers", () => {
    expect(
      controllers
        .filter((f) => sql.test(code(f)) || pgImport.test(code(f)))
        .map(name),
    ).toEqual([]);
  });

  it("keeps SQL out of services; put queries in the matching *.store.ts", () => {
    expect(services.filter((f) => sql.test(code(f))).map(name)).toEqual([]);
  });

  it("keeps SQL in stores; a *.store.ts without queries is misnamed", () => {
    expect(stores.filter((f) => !sql.test(code(f))).map(name)).toEqual([]);
  });
});
