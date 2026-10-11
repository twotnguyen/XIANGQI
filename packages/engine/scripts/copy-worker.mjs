import { copyFile, readFile, rm, writeFile } from "node:fs/promises";
import { join, relative } from "node:path";
import { URL, fileURLToPath } from "node:url";
import ts from "typescript";

const core = new URL("../../xiangqi-core/", import.meta.url);
const entry = new URL("../dist/index.js", import.meta.url);
try {
  // Direct engine builds must not silently reuse stale workspace dependency code.
  // Recursive pnpm builds already build xiangqi-core first in dependency order.
  const corePath = fileURLToPath(core);
  const config = ts.readConfigFile(
    join(corePath, "tsconfig.json"),
    ts.sys.readFile,
  );
  if (config.error) throw Error("Missing core compiler configuration");
  const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, corePath);
  if (parsed.errors.length) throw Error("Invalid core compiler configuration");
  for (const source of parsed.fileNames) {
    if (source.endsWith(".d.ts")) continue;
    const path = relative(join(corePath, "src"), source);
    if (path.startsWith("..") || !path.endsWith(".ts"))
      throw Error("Unexpected core source layout");
    const expected = ts.transpileModule(await readFile(source, "utf8"), {
      compilerOptions: parsed.options,
      fileName: source,
    }).outputText;
    const actual = await readFile(
      new URL("dist/" + path.replace(/\.ts$/, ".js"), core),
      "utf8",
    );
    if (actual !== expected) throw Error("Stale core artifact: " + path);
  }
  for (const filename of ["search.js", "engine-worker.js"]) {
    const artifact = new URL("../dist/" + filename, import.meta.url);
    const generated = await readFile(artifact, "utf8");
    const specifier = 'from "@xiangqi/xiangqi-core"';
    if (generated.split(specifier).length !== 2)
      throw Error("Unexpected generated engine core import: " + filename);
    await writeFile(
      artifact,
      generated.replace(specifier, 'from "../../xiangqi-core/dist/index.js"'),
    );
  }
  await copyFile(
    new URL("../src/worker-bootstrap.mjs", import.meta.url),
    new URL("../dist/worker-bootstrap.mjs", import.meta.url),
  );
} catch (error) {
  // A failed post-build must not leave an apparently usable compiled subpath.
  await rm(entry, { force: true });
  throw new Error(
    "Build @xiangqi/xiangqi-core before @xiangqi/engine: " +
      (error instanceof Error && !error.message.includes("ENOENT")
        ? error.message
        : "missing core/build artifact"),
    { cause: error },
  );
}
