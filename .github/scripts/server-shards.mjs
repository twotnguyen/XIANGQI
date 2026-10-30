// Chia tests/server thành SHARD_COUNT shard cân bằng theo thời gian đo được.
//   node .github/scripts/server-shards.mjs --plan     in JSON {shards:[{id,files,estimatedMs}]}
//   node .github/scripts/server-shards.mjs --run N    chạy shard N qua tests/server/db.sh test
//   node .github/scripts/server-shards.mjs --self-test
// Vitest lọc đường dẫn theo substring, nên shard được chọn bằng cách đưa đúng file
// làm bộ lọc và --exclude=<mọi file khác>; không dùng --shard của Vitest.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import console from "node:console";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const TIMINGS_FILE = resolve(ROOT, ".github/scripts/server-test-timings.json");
export const SHARD_COUNT = 6;
// Chi phí dùng cho test chưa có timing khi không có timing nào để lấy median.
const DEFAULT_MS = 1000;
// Chỉ ký tự an toàn: không có ký tự glob, nên --exclude= khớp đúng một file.
const TEST_PATH = /^tests\/server\/[\w./-]+\.test\.ts$/;

export function validateTests(files) {
  const seen = new Set();
  for (const file of files) {
    if (!TEST_PATH.test(file)) throw new Error(`Unexpected test path: ${file}`);
    if (seen.has(file)) throw new Error(`Duplicate test path: ${file}`);
    seen.add(file);
  }
  return [...files].sort();
}

export function discoverTests() {
  const result = spawnSync(
    "pnpm",
    ["exec", "vitest", "list", "--filesOnly", "tests/server"],
    { cwd: ROOT, encoding: "utf8" },
  );
  if (result.error) throw result.error;
  if (result.status !== 0)
    throw new Error(`vitest list failed:\n${result.stderr}`);
  return validateTests(result.stdout.split(/\r?\n/).filter(Boolean));
}

export function parseTimings(json) {
  if (typeof json !== "object" || json === null || Array.isArray(json))
    throw new Error("Timings must be a JSON object {file: milliseconds}");
  const timings = new Map();
  for (const [file, ms] of Object.entries(json)) {
    if (!TEST_PATH.test(file)) throw new Error(`Invalid timing key: ${file}`);
    if (typeof ms !== "number" || !Number.isFinite(ms) || ms <= 0)
      throw new Error(`Invalid timing for ${file}: ${JSON.stringify(ms)}`);
    timings.set(file, ms);
  }
  return timings;
}

function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = sorted.length >> 1;
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

// Longest-processing-time greedy: test đắt nhất vào shard đang nhẹ nhất.
// Ties: theo đường dẫn; shard có id nhỏ hơn thắng. Kết quả luôn giống nhau.
export function planShards(tests, timings, count = SHARD_COUNT) {
  if (!Number.isInteger(count) || count < 1)
    throw new Error(`Shard count must be a positive integer: ${count}`);
  const known = tests.filter((file) => timings.has(file));
  const fallback = known.length
    ? median(known.map((file) => timings.get(file)))
    : DEFAULT_MS;
  const costed = tests
    .map((file) => ({ file, ms: timings.get(file) ?? fallback }))
    .sort(
      (a, b) => b.ms - a.ms || (a.file < b.file ? -1 : a.file > b.file ? 1 : 0),
    );
  const shards = Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    files: [],
    estimatedMs: 0,
  }));
  for (const { file, ms } of costed) {
    const shard = shards.reduce((best, s) =>
      s.estimatedMs < best.estimatedMs ? s : best,
    );
    shard.files.push(file);
    shard.estimatedMs += ms;
  }
  for (const shard of shards) shard.files.sort();
  return shards;
}

// Đối số cho db.sh test: chọn đúng `selected` và loại mọi file tests/server khác.
export function vitestArgs(selected, all) {
  const chosen = new Set(selected);
  if (chosen.size !== selected.length) throw new Error("Duplicate selection");
  for (const file of selected)
    if (!all.includes(file)) throw new Error(`Unknown test: ${file}`);
  const excluded = all.filter((file) => !chosen.has(file));
  return [
    "--bail=1",
    ...excluded.map((file) => `--exclude=${file}`),
    ...selected,
  ];
}

export function parseRunIndex(value) {
  const id = Number(value);
  if (!Number.isInteger(id) || id < 1 || id > SHARD_COUNT)
    throw new Error(`--run must be an integer 1..${SHARD_COUNT}: ${value}`);
  return id;
}

function loadTimings() {
  return parseTimings(JSON.parse(readFileSync(TIMINGS_FILE, "utf8")));
}

function warnTimings(tests, timings) {
  const known = new Set(tests);
  const unused = [...timings.keys()].filter((file) => !known.has(file));
  const missing = tests.filter((file) => !timings.has(file));
  if (unused.length)
    console.error(`Ignoring ${unused.length} timing(s) for removed tests.`);
  if (missing.length)
    console.error(
      `Using median cost for ${missing.length} test(s) without timing.`,
    );
}

function selfTest() {
  const tests = [
    "tests/server/a.test.ts",
    "tests/server/b.test.ts",
    "tests/server/c.test.ts",
    "tests/server/d.test.ts",
    "tests/server/e.test.ts",
    "tests/server/f.test.ts",
    "tests/server/g.test.ts",
    "tests/server/new.test.ts",
  ];
  const timings = parseTimings({
    "tests/server/a.test.ts": 9000,
    "tests/server/b.test.ts": 7000,
    "tests/server/c.test.ts": 6000,
    "tests/server/d.test.ts": 5000,
    "tests/server/e.test.ts": 4000,
    "tests/server/f.test.ts": 3000,
    "tests/server/g.test.ts": 2000,
    "tests/server/gone.test.ts": 100000,
  });

  const plan = planShards(tests, timings);
  assert.deepEqual(planShards(tests, timings), plan, "deterministic");
  assert.equal(plan.length, SHARD_COUNT);
  assert.deepEqual(
    plan.flatMap((s) => s.files).sort(),
    [...tests].sort(),
    "every test exactly once",
  );
  const fallback = median(
    tests.filter((f) => timings.has(f)).map((f) => timings.get(f)),
  );
  const costOf = (file) => timings.get(file) ?? fallback;
  for (const shard of plan) {
    const sum = shard.files.reduce((total, file) => total + costOf(file), 0);
    assert.equal(shard.estimatedMs, sum, `estimate shard ${shard.id}`);
  }
  // Test chưa có timing dùng median của 7 timing thật (5000ms) cho new.test.ts.
  assert.ok(plan.some((s) => s.files.includes("tests/server/new.test.ts")));
  assert.equal(costOf("tests/server/new.test.ts"), 5000);

  // LPT guarantee: spread ≤ largest single item.
  const spread =
    Math.max(...plan.map((s) => s.estimatedMs)) -
    Math.min(...plan.map((s) => s.estimatedMs));
  assert.ok(spread <= 9000, `spread ${spread}`);

  // Ties broken by path, lower shard id first.
  const tied = planShards(
    [
      "tests/server/c.test.ts",
      "tests/server/a.test.ts",
      "tests/server/b.test.ts",
    ],
    parseTimings({
      "tests/server/a.test.ts": 5,
      "tests/server/b.test.ts": 5,
      "tests/server/c.test.ts": 5,
    }),
    3,
  );
  assert.deepEqual(
    tied.map((s) => s.files),
    [
      ["tests/server/a.test.ts"],
      ["tests/server/b.test.ts"],
      ["tests/server/c.test.ts"],
    ],
  );

  // No timings at all → default cost, even split.
  const blind = planShards(tests, new Map());
  assert.deepEqual(
    blind.map((s) => s.files.length),
    [2, 2, 1, 1, 1, 1],
  );

  // Removed-test timings are harmless.
  assert.deepEqual(
    planShards(tests, parseTimings({ "tests/server/a.test.ts": 9000 })),
    planShards(
      tests,
      parseTimings({
        "tests/server/a.test.ts": 9000,
        "tests/server/gone.test.ts": 1,
      }),
    ),
  );

  const invalid = [
    [{ "tests/server/a.test.ts": 0 }, /Invalid timing/],
    [{ "tests/server/a.test.ts": -1 }, /Invalid timing/],
    [{ "tests/server/a.test.ts": Number.NaN }, /Invalid timing/],
    [{ "tests/server/a.test.ts": Infinity }, /Invalid timing/],
    [{ "tests/server/a.test.ts": "5" }, /Invalid timing/],
    [{ "tests/web/a.test.ts": 5 }, /Invalid timing key/],
    [{ "tests/server/*.test.ts": 5 }, /Invalid timing key/],
    [[1, 2], /must be a JSON object/],
    [null, /must be a JSON object/],
  ];
  for (const [json, error] of invalid)
    assert.throws(() => parseTimings(json), error);

  assert.throws(
    () => validateTests(["tests/server/a.test.ts", "tests/server/a.test.ts"]),
    /Duplicate/,
  );
  assert.throws(() => validateTests(["Duration 1s"]), /Unexpected test path/);
  assert.throws(() => planShards(tests, timings, 0), /positive integer/);

  assert.throws(
    () => vitestArgs(["tests/server/x.test.ts"], tests),
    /Unknown test/,
  );
  assert.throws(
    () =>
      vitestArgs(["tests/server/a.test.ts", "tests/server/a.test.ts"], tests),
    /Duplicate/,
  );

  assert.equal(parseRunIndex("1"), 1);
  assert.equal(parseRunIndex(String(SHARD_COUNT)), SHARD_COUNT);
  for (const bad of ["0", String(SHARD_COUNT + 1), "x", ""])
    assert.throws(() => parseRunIndex(bad), /--run/);

  console.log(
    "PASS: shards are deterministic, exhaustive, LPT-balanced, and validate input.",
  );
}

function main(argv) {
  if (argv[0] === "--self-test") return selfTest();
  const mode = argv[0];
  if (mode !== "--plan" && mode !== "--run")
    throw new Error("Usage: --plan | --run N | --self-test");
  const tests = discoverTests();
  const timings = loadTimings();
  warnTimings(tests, timings);
  const plan = planShards(tests, timings);
  if (mode === "--plan") {
    console.log(JSON.stringify({ shards: plan }, null, 2));
    return;
  }
  const id = parseRunIndex(argv[1]);
  const shard = plan.find((s) => s.id === id);
  if (shard.files.length === 0) throw new Error(`Shard ${id} has no tests`);
  const result = spawnSync(
    "bash",
    ["tests/server/db.sh", "test", ...vitestArgs(shard.files, tests)],
    { cwd: ROOT, stdio: "inherit" },
  );
  if (result.error) throw result.error;
  process.exitCode = result.status ?? 1;
}

try {
  main(process.argv.slice(2));
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
