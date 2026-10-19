import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve, sep } from "node:path";
import ts from "typescript";

function requiredDatabases(files, known, root = resolve("tests")) {
  const visited = new Set();
  const required = new Set();
  const options = {
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    allowJs: true,
  };
  const resolutionCache = ts.createModuleResolutionCache(
    root,
    (path) => path,
    options,
  );
  function visit(file) {
    file = resolve(file);
    if (!file.startsWith(root + sep))
      throw new Error(`Not a test file: ${file}`);
    if (visited.has(file)) return;
    visited.add(file);
    const source = readFileSync(file, "utf8");
    for (const [variable] of source.matchAll(
      /\b[A-Z][A-Z0-9_]*_TEST_DATABASE_URL\b/g,
    )) {
      const name =
        variable === "DRAW_WORKER_TEST_DATABASE_URL"
          ? "ROOM_RUNTIME_TEST_DATABASE_URL"
          : variable;
      if (!known.includes(name))
        throw new Error(`Unknown test database: ${variable} (${file})`);
      required.add(name);
    }
    // Database dependencies are declared in tests/helpers, not production modules.
    for (const { fileName } of ts.preProcessFile(source, true, true)
      .importedFiles) {
      if (!fileName.startsWith(".")) continue;
      const target = ts.resolveModuleName(
        fileName,
        file,
        options,
        ts.sys,
        resolutionCache,
      ).resolvedModule;
      if (!target)
        throw new Error(`Cannot resolve test import: ${fileName} (${file})`);
      if (target.resolvedFileName.startsWith(root + sep))
        visit(target.resolvedFileName);
    }
  }
  for (const file of files) visit(file);
  return known.filter((name) => required.has(name));
}

function selfTest() {
  const root = mkdtempSync(join(tmpdir(), "xq-db-scope-"));
  const known = [
    "ROOM_TEST_DATABASE_URL",
    "MATCH_TEST_DATABASE_URL",
    "ROOM_RUNTIME_TEST_DATABASE_URL",
  ];
  const file = (name, source) => {
    const path = join(root, name);
    writeFileSync(path, source);
    return path;
  };
  try {
    const unit = file("unit.test.ts", "export const value = 1;");
    file(
      "room.ts",
      'import "./cycle.js"; export const url = process.env.ROOM_TEST_DATABASE_URL;',
    );
    file("cycle.ts", 'export * from "./room.js";');
    const room = file("room.test.ts", 'import "./cycle.js";');
    const match = file(
      "match.test.ts",
      "export const url = process.env.MATCH_TEST_DATABASE_URL;",
    );
    const draw = file(
      "draw.test.ts",
      "export const url = process.env.DRAW_WORKER_TEST_DATABASE_URL;",
    );
    const unknown = file(
      "unknown.test.ts",
      "export const url = process.env.NEW_TEST_DATABASE_URL;",
    );
    const missing = file("missing.test.ts", 'import "./missing-helper.js";');
    assert.deepEqual(requiredDatabases([unit], known, root), []);
    assert.deepEqual(requiredDatabases([room], known, root), [known[0]]);
    assert.deepEqual(
      requiredDatabases([match, room, room, draw], known, root),
      known,
    );
    assert.throws(
      () => requiredDatabases([unknown], known, root),
      /Unknown test database/,
    );
    assert.throws(
      () => requiredDatabases([missing], known, root),
      /Cannot resolve test import/,
    );
    assert.throws(
      () => requiredDatabases([join(root, "absent.ts")], known, root),
      /ENOENT/,
    );
    assert.throws(
      () => requiredDatabases([resolve(root, "..", "outside.ts")], known, root),
      /Not a test file/,
    );
    console.log(
      "PASS: database scope follows transitive imports/cycles, unions clusters, shares draw/runtime, and rejects unknown dependencies.",
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

try {
  if (process.argv[2] === "--self-test") {
    selfTest();
  } else {
    const files = readFileSync(0, "utf8").split(/\r?\n/).filter(Boolean);
    console.log(requiredDatabases(files, process.argv.slice(2)).join(" "));
  }
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
