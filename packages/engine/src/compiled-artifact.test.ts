import { spawnSync } from "node:child_process";
import {
  cp,
  mkdir,
  mkdtemp,
  readFile,
  rename,
  rm,
  symlink,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterAll, beforeAll, expect, it } from "vitest";
import { historyCases } from "./history.test-helper.js";
import {
  legalMoves,
  parsePosition,
  playMove,
  serializePosition,
} from "@xiangqi/xiangqi-core";
import midgames from "../fixtures/midgames-50.json";

const root = fileURLToPath(new URL("../../../", import.meta.url));
let temporary: string;
let engine: string;
let core: string;
const buildScript = () =>
  spawnSync(process.execPath, [join(engine, "scripts/copy-worker.mjs")], {
    cwd: temporary,
    encoding: "utf8",
    timeout: 10000,
  });
function compile(directory: string) {
  const result = spawnSync(
    process.execPath,
    [join(root, "node_modules/typescript/bin/tsc"), "-p", directory],
    { encoding: "utf8", timeout: 10000 },
  );
  expect(result.status, result.stdout).toBe(0);
}
async function restoreBuild() {
  compile(engine);
  expect(buildScript().status).toBe(0);
}
function child(script: string, input?: unknown) {
  const result = spawnSync(
    process.execPath,
    ["--input-type=module", "--eval", script],
    {
      cwd: temporary,
      encoding: "utf8",
      timeout: 10000,
      input: input === undefined ? undefined : JSON.stringify(input),
    },
  );
  expect(result.status, result.stderr).toBe(0);
  return JSON.parse(result.stdout) as Record<string, unknown>;
}
async function withoutCoreSource(script: string, input?: unknown) {
  await rename(join(core, "src"), join(core, "hidden-src"));
  try {
    return child(script, input);
  } finally {
    await rename(join(core, "hidden-src"), join(core, "src"));
  }
}
const imports = `
import {EngineWorker} from '@xiangqi/engine/compiled';
import {initialPosition,serializePosition,parsePosition,legalMoves,playMove} from './packages/xiangqi-core/dist/index.js';
const input={position:serializePosition(initialPosition()),side:'red',level:'easy'};
const legal=(input,result)=>legalMoves(parsePosition(input.position)).some(m=>m.from===result.move?.from&&m.to===result.move?.to);
`;
beforeAll(async () => {
  temporary = await mkdtemp(join(tmpdir(), "xiangqi-compiled-"));
  engine = join(temporary, "packages/engine");
  core = join(temporary, "packages/xiangqi-core");
  await mkdir(join(temporary, "node_modules/@types"), { recursive: true });
  await mkdir(join(temporary, "node_modules/@xiangqi"), { recursive: true });
  await writeFile(
    join(temporary, "package.json"),
    JSON.stringify({ type: "module" }),
  );
  for (const [source, target] of [
    ["node_modules/typescript", "node_modules/typescript"],
    ["node_modules/@types/node", "node_modules/@types/node"],
  ] as const)
    await symlink(join(root, source), join(temporary, target), "dir");
  await cp(
    join(root, "tsconfig.base.json"),
    join(temporary, "tsconfig.base.json"),
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
  }
  await cp(join(root, "packages/engine/scripts"), join(engine, "scripts"), {
    recursive: true,
  });
  await mkdir(join(engine, "node_modules/@xiangqi"), { recursive: true });
  await symlink(
    core,
    join(engine, "node_modules/@xiangqi/xiangqi-core"),
    "dir",
  );
  await symlink(engine, join(temporary, "node_modules/@xiangqi/engine"), "dir");
  await symlink(
    join(root, "packages/engine/node_modules/tsx"),
    join(engine, "node_modules/tsx"),
    "dir",
  );
  compile(core);
  await restoreBuild();
}, 20000);
afterAll(async () => {
  if (temporary) await rm(temporary, { recursive: true, force: true });
});
it("preserves source exports and exposes an explicit compiled runtime with source types", async () => {
  const manifest = JSON.parse(
    await readFile(join(engine, "package.json"), "utf8"),
  );
  expect(manifest.exports).toEqual({
    ".": "./src/index.ts",
    "./compiled": { types: "./src/index.ts", default: "./dist/index.js" },
  });
  const search = await readFile(join(engine, "dist/search.js"), "utf8");
  expect(search).toContain('from "../../xiangqi-core/dist/index.js"');
  expect(search).not.toContain("@xiangqi/xiangqi-core");
});
it("preserves every legal move, resulting counter and input board on all fifty verified positions", async () => {
  const expected = midgames.positions.map(({ fen }) => {
    const p = parsePosition(fen),
      moves = legalMoves(p);
    return {
      fen,
      moves,
      next: moves.map((m) => serializePosition(playMove(p, m))),
    };
  });
  const result = await withoutCoreSource(
    `${imports}
import {readFileSync} from 'node:fs';
const cases=JSON.parse(readFileSync(0,'utf8'));
const matches=cases.map(c=>{const p=parsePosition(c.fen),before=serializePosition(p),moves=legalMoves(p),next=moves.map(m=>serializePosition(playMove(p,m)));return JSON.stringify(moves)===JSON.stringify(c.moves)&&JSON.stringify(next)===JSON.stringify(c.next)&&serializePosition(p)===before;});
console.log(JSON.stringify({count:matches.length,allMatch:matches.every(Boolean)}));
`,
    expected,
  );
  expect(result).toEqual({ count: 50, allMatch: true });
});
it("runs a prepared compiled worker with no core TypeScript, including canonical history endings", async () => {
  const result = await withoutCoreSource(`${imports}
const worker=new EngineWorker();
try {
 await worker.ready();
 const frozen=Object.freeze({...input}),before=JSON.stringify(frozen),result=await worker.search(frozen);
 const histories=${JSON.stringify([
   ...historyCases(),
   ...[
     ["4k4/3RPR3/9/9/9/9/9/9/9/4K4 b - - 120 1", "CHECKMATE"],
     ["4k4/3R1R3/4P4/9/9/9/9/9/9/4K4 b - - 120 1", "STALEMATE"],
   ].map(([position, reason]) => ({
     input: { position, side: "black", level: "easy" },
     terminal: { reason, winner: "red" },
   })),
 ])};
 const endings=[];
 for(const c of histories){const r=await worker.search(c.input);endings.push({expected:c.terminal,actual:r.terminal,move:r.move});}
 console.log(JSON.stringify({legal:legal(input,result),depth:result.completedDepth,target:result.targetDepth,immutable:JSON.stringify(frozen)===before,endings}));
}finally{await worker.close();}
`);
  expect(result).toMatchObject({
    legal: true,
    depth: 2,
    target: 2,
    immutable: true,
  });
  for (const ending of result.endings as {
    expected: unknown;
    actual: unknown;
    move: unknown;
  }[])
    expect(ending).toEqual({
      expected: ending.expected,
      actual: ending.expected,
      move: null,
    });
});
it("counts cold compiled startup against the original budget", async () => {
  const result = await withoutCoreSource(`${imports}
const bootstrap=new URL('./packages/engine/dist/worker-bootstrap.mjs',import.meta.url);
const delay=new URL('data:text/javascript,'+encodeURIComponent('await new Promise(r=>setTimeout(r,400));await import('+JSON.stringify(bootstrap.href)+');'));
const worker=new EngineWorker({workerURL:delay});
try {const r=await worker.search(input);console.log(JSON.stringify({depth:r.completedDepth,timedOut:r.timedOut,nodes:r.nodes,legal:legal(input,r),elapsed:r.elapsedMs}));}finally{await worker.close();}
`);
  expect(result).toMatchObject({
    depth: 0,
    timedOut: true,
    nodes: 0,
    legal: true,
  });
  expect(result.elapsed as number).toBeGreaterThanOrEqual(400);
});
it("keeps HTTP responsive during compiled work and drains cancellation before reinitializing", async () => {
  const result = await withoutCoreSource(`${imports}
import {createServer} from 'node:http';
const server=createServer((q,r)=>r.end('ok'));await new Promise(r=>server.listen(0,'127.0.0.1',r));
const worker=new EngineWorker();let done=false;
try {
 await worker.ready();const controller=new AbortController();
 const pending=worker.search({...input,level:'hard'},{signal:controller.signal}).then(r=>{done=true;return r},e=>{done=true;return e.code});
 const response=await fetch('http://127.0.0.1:'+server.address().port);const health=await response.text(),whileActive=!done;
 const busy=await worker.search(input).then(()=>null,e=>e.code);controller.abort();const cancelled=await pending;
 await worker.ready();const after=await worker.search(input);
 await worker.close();const closed=await worker.search(input).then(()=>null,e=>e.code);
 console.log(JSON.stringify({health,whileActive,busy,cancelled,afterLegal:legal(input,after),closed}));
}finally{await worker.close();await new Promise(r=>server.close(r));}
`);
  expect(result).toEqual({
    health: "ok",
    whileActive: true,
    busy: "ENGINE_BUSY",
    cancelled: "ENGINE_CANCELLED",
    afterLegal: true,
    closed: "ENGINE_CLOSED",
  });
});
it.each(["missing", "stale", "tampered"])(
  "fails closed for %s core artifacts and invalidates the compiled entry",
  async (condition) => {
    const source = join(core, "src/moves.ts"),
      output = join(core, "dist/moves.js");
    const previousSource = await readFile(source, "utf8"),
      previousOutput = await readFile(output, "utf8");
    try {
      if (condition === "missing") await rm(output);
      else if (condition === "tampered")
        await writeFile(
          output,
          previousOutput.replace("isInCheck(next, position.turn)", "true"),
        );
      else
        await writeFile(
          source,
          previousSource.replace(
            "if (isInCheck(next, position.turn))",
            "if (true || isInCheck(next, position.turn))",
          ),
        );
      expect(buildScript().status).not.toBe(0);
      await expect(
        readFile(join(engine, "dist/index.js")),
      ).rejects.toMatchObject({ code: "ENOENT" });
    } finally {
      await writeFile(source, previousSource);
      await writeFile(output, previousOutput);
      await restoreBuild();
    }
  },
);
