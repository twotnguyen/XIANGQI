import { spawnSync } from "node:child_process";
import {
  cp,
  mkdir,
  mkdtemp,
  rename,
  rm,
  symlink,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { afterAll, beforeAll, expect, it } from "vitest";

const root = fileURLToPath(new URL("../../../../../", import.meta.url));
let temporary: string;
function execute(script: string) {
  const result = spawnSync(
    process.execPath,
    [
      "--import",
      pathToFileURL(
        join(root, "packages/engine/node_modules/tsx/dist/loader.mjs"),
      ).href,
      "--input-type=module",
      "--eval",
      script,
    ],
    {
      cwd: temporary,
      encoding: "utf8",
      timeout: 10000,
    },
  );
  expect(result.status, result.stderr).toBe(0);
  return JSON.parse(result.stdout) as Record<string, unknown>;
}
const imports = `
import {createCompiledAiEngine} from './apps/server/src/game/ai/ai-engine.ts';
import {EngineError} from '@xiangqi/engine';
import {initialPosition,serializePosition,parsePosition,legalMoves} from './packages/xiangqi-core/dist/index.js';
const input={position:serializePosition(initialPosition()),side:'red',level:'easy'};
`;
beforeAll(async () => {
  temporary = await mkdtemp(join(tmpdir(), "xiangqi-ai-engine-"));
  await mkdir(join(temporary, "node_modules/@types"), { recursive: true });
  await mkdir(join(temporary, "node_modules/@xiangqi"), { recursive: true });
  await mkdir(join(temporary, "apps/server/src/game/ai"), { recursive: true });
  await writeFile(
    join(temporary, "package.json"),
    JSON.stringify({ type: "module" }),
  );
  for (const name of ["typescript", "@types/node"])
    await symlink(
      join(root, "node_modules", name),
      join(temporary, "node_modules", name),
      "dir",
    );
  await cp(
    join(root, "tsconfig.base.json"),
    join(temporary, "tsconfig.base.json"),
  );
  await cp(
    join(root, "apps/server/src/game/ai/ai-engine.ts"),
    join(temporary, "apps/server/src/game/ai/ai-engine.ts"),
  );
  for (const name of ["engine", "xiangqi-core"]) {
    const destination = join(temporary, "packages", name);
    await mkdir(destination, { recursive: true });
    await cp(join(root, "packages", name, "src"), join(destination, "src"), {
      recursive: true,
      filter: (path) => !/\.(test|test-helper)\.ts$/.test(path),
    });
    for (const file of ["package.json", "tsconfig.json"])
      await cp(join(root, "packages", name, file), join(destination, file));
    await symlink(
      destination,
      join(temporary, "node_modules/@xiangqi", name),
      "dir",
    );
  }
  const engine = join(temporary, "packages/engine");
  await cp(join(root, "packages/engine/scripts"), join(engine, "scripts"), {
    recursive: true,
  });
  await symlink(
    join(root, "packages/engine/node_modules/tsx"),
    join(temporary, "node_modules/tsx"),
    "dir",
  );
  for (const name of ["xiangqi-core", "engine"]) {
    const result = spawnSync(
      process.execPath,
      [
        join(root, "node_modules/typescript/bin/tsc"),
        "-p",
        join(temporary, "packages", name),
      ],
      { encoding: "utf8", timeout: 10000 },
    );
    expect(result.status, result.stdout + result.stderr).toBe(0);
  }
  const copied = spawnSync(
    process.execPath,
    [join(engine, "scripts/copy-worker.mjs")],
    { encoding: "utf8", timeout: 10000 },
  );
  expect(copied.status, copied.stderr).toBe(0);
}, 20000);
afterAll(async () => {
  if (temporary) await rm(temporary, { recursive: true, force: true });
});
it("uses an actual prepared compiled worker and returns a legal depth-two move", () => {
  const value = execute(`${imports}
const engine=await createCompiledAiEngine();
try{await engine.ready();const result=await engine.search(input);console.log(JSON.stringify({legal:legalMoves(parsePosition(input.position)).some(m=>m.from===result.move?.from&&m.to===result.move?.to),depth:result.completedDepth}));}finally{await engine.close();}
`);
  expect(value).toEqual({ legal: true, depth: 2 });
});
it("maps compiled busy and cancellation errors to the AI service's source error contract", () => {
  const value = execute(`${imports}
const engine=await createCompiledAiEngine(),abort=new AbortController();
try {
 await engine.ready();const pending=engine.search({...input,level:'hard'},{signal:abort.signal}).catch(error=>({code:error.code,typed:error instanceof EngineError}));
 let busy;try{await engine.search(input);}catch(error){busy={code:error.code,typed:error instanceof EngineError};}
 abort.abort();const cancelled=await pending;await engine.ready();const next=await engine.search(input);
 console.log(JSON.stringify({busy,cancelled,recovered:next.completedDepth===2}));
}finally{await engine.close();}
`);
  expect(value).toEqual({
    busy: { code: "ENGINE_BUSY", typed: true },
    cancelled: { code: "ENGINE_CANCELLED", typed: true },
    recovered: true,
  });
});
it("maps actual compiled readiness timeout and closed errors without leaving a live worker", () => {
  const value = execute(`${imports}
const engine=await createCompiledAiEngine({watchdogMs:1});let timeout,closed;
try{try{await engine.ready();}catch(error){timeout={code:error.code,typed:error instanceof EngineError};}}finally{await engine.close();}
try{await engine.ready();}catch(error){closed={code:error.code,typed:error instanceof EngineError};}
console.log(JSON.stringify({timeout,closed}));
`);
  expect(value).toEqual({
    timeout: { code: "ENGINE_TIMEOUT", typed: true },
    closed: { code: "ENGINE_CLOSED", typed: true },
  });
});
it("refuses missing compiled artifacts rather than falling back to the source worker", async () => {
  const entry = join(temporary, "packages/engine/dist/index.js");
  await rename(entry, entry + ".hidden");
  try {
    expect(
      execute(`${imports}
let failed=false;try{const engine=await createCompiledAiEngine();await engine.close();}catch{failed=true;}console.log(JSON.stringify({failed}));
`),
    ).toEqual({ failed: true });
  } finally {
    await rename(entry + ".hidden", entry);
  }
});
