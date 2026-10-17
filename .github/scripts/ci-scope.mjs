import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { appendFileSync } from "node:fs";

function isMainGate({ event, baseRef, ref }) {
  return event === "pull_request"
    ? baseRef === "main"
    : ref === "refs/heads/main";
}

function scopeForPaths(paths, full) {
  const scope = {
    full,
    web: false,
    server: false,
  };
  const all = () => ({
    ...scope,
    web: true,
    server: true,
  });
  if (full || paths === null) return all();
  for (const path of paths) {
    if (
      path.endsWith(".md") ||
      path.startsWith("docs/") ||
      path === ".env.example"
    )
      continue;
    if (path.startsWith("apps/web/") || path.startsWith("tests/web/")) {
      scope.web = true;
    } else if (
      path.startsWith("apps/server/") ||
      path.startsWith("tests/server/") ||
      path.startsWith("supabase/")
    ) {
      scope.server = true;
    } else if (
      path.startsWith("packages/") ||
      path.startsWith("tests/packages/")
    ) {
      scope.web = scope.server = true;
    } else {
      return all();
    }
  }
  return scope;
}

function changedPaths({ event, baseRef, before }) {
  const revisions =
    event === "pull_request" && baseRef
      ? [`origin/${baseRef}...HEAD`]
      : before && !/^0+$/.test(before)
        ? [before, "HEAD"]
        : null;
  if (!revisions) return null;
  try {
    // Include both sides of a rename so moving code cannot hide its old consumers.
    return execFileSync(
      "git",
      ["diff", "--no-renames", "--name-only", "-z", ...revisions, "--"],
      {
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
      },
    )
      .split("\0")
      .filter(Boolean);
  } catch {
    console.error(
      "Cannot read changed paths; enabling both application builds.",
    );
    return null;
  }
}

if (process.argv.includes("--self-test")) {
  const enabled = (scope) =>
    Object.keys(scope)
      .filter((key) => scope[key])
      .sort();
  const cases = [
    [["apps/web/src/main.tsx"], ["web"]],
    [["tests/web/features/rooms/RoomPage.test.ts"], ["web"]],
    [["apps/server/src/main.ts"], ["server"]],
    [["tests/server/game/room/room.test.ts"], ["server"]],
    [["supabase/migrations/example.sql"], ["server"]],
    [["packages/xiangqi-core/src/legal.ts"], ["server", "web"]],
    [["tests/packages/xiangqi-core/legal.test.ts"], ["server", "web"]],
    [["packages/engine/src/index.ts"], ["server", "web"]],
    [["tests/packages/worker-fixtures/worker.ts"], ["server", "web"]],
    [["packages/shared/src/index.ts"], ["server", "web"]],
    [["tests/packages/shared/validation.test.ts"], ["server", "web"]],
    [
      ["apps/web/src/main.tsx", "apps/server/src/main.ts"],
      ["server", "web"],
    ],
    [["docs/setup/example.md", "README.md", ".env.example"], []],
    [[], []],
  ];
  for (const [paths, expected] of cases)
    assert.deepEqual(
      enabled(scopeForPaths(paths, false)),
      expected,
      paths.join(", "),
    );
  const everyScope = ["server", "web"];
  for (const path of [
    "pnpm-lock.yaml",
    "package.json",
    "tsconfig.base.json",
    "tests/tsconfig.json",
    ".node-version",
    ".github/workflows/ci.yml",
    ".github/scripts/ci-scope.mjs",
    "packages/new-package/index.ts",
    "tests/packages/new-package/test.ts",
  ]) {
    assert.deepEqual(enabled(scopeForPaths([path], false)), everyScope, path);
  }
  assert.deepEqual(enabled(scopeForPaths(null, false)), everyScope);
  assert.deepEqual(enabled(scopeForPaths(["apps/web/src/main.tsx"], true)), [
    "full",
    "server",
    "web",
  ]);
  assert.equal(
    isMainGate({
      event: "pull_request",
      baseRef: "main",
      ref: "refs/pull/1/merge",
    }),
    true,
  );
  assert.equal(isMainGate({ event: "push", ref: "refs/heads/main" }), true);
  assert.equal(
    isMainGate({
      event: "pull_request",
      baseRef: "develop",
      ref: "refs/pull/1/merge",
    }),
    false,
  );
  assert.equal(isMainGate({ event: "push", ref: "refs/heads/develop" }), false);
  const { mkdtempSync, mkdirSync, writeFileSync, renameSync, rmSync } =
    await import("node:fs");
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  const originalDirectory = process.cwd();
  const fixture = mkdtempSync(join(tmpdir(), "xiangqi-ci-scope-"));
  try {
    process.chdir(fixture);
    const git = (...args) =>
      execFileSync(
        "git",
        [
          "-c",
          "core.hooksPath=/dev/null",
          "-c",
          "commit.gpgsign=false",
          ...args,
        ],
        { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] },
      ).trim();
    git("init", "--initial-branch=develop");
    git("config", "user.name", "CI Scope");
    git("config", "user.email", "ci-scope@example.invalid");
    writeFileSync("baseline.txt", "baseline\n");
    git("add", ".");
    git("commit", "-m", "baseline");
    const before = git("rev-parse", "HEAD");
    git("update-ref", "refs/remotes/origin/develop", before);
    mkdirSync("apps/web", { recursive: true });
    writeFileSync("apps/web/page.txt", "web\n");
    git("add", ".");
    git("commit", "-m", "web");
    assert.deepEqual(changedPaths({ event: "push", before }), [
      "apps/web/page.txt",
    ]);
    assert.deepEqual(
      changedPaths({ event: "pull_request", baseRef: "develop" }),
      ["apps/web/page.txt"],
    );
    const webCommit = git("rev-parse", "HEAD");
    mkdirSync("apps/server", { recursive: true });
    renameSync("apps/web/page.txt", "apps/server/page.txt");
    git("add", ".");
    git("commit", "-m", "move");
    assert.deepEqual(
      enabled(
        scopeForPaths(
          changedPaths({ event: "push", before: webCommit }),
          false,
        ),
      ),
      ["server", "web"],
    );
    assert.equal(changedPaths({ event: "push", before: "missing-ref" }), null);
    assert.equal(changedPaths({ event: "push", before: "0".repeat(40) }), null);
  } finally {
    process.chdir(originalDirectory);
    rmSync(fixture, { recursive: true, force: true });
  }
  console.log(
    "CI scope self-check passed: affected builds, shared consumers, main gates and conservative fallbacks.",
  );
} else {
  const context = {
    event: process.env.CI_EVENT,
    baseRef: process.env.CI_BASE_REF,
    before: process.env.CI_BEFORE,
    ref: process.env.CI_REF,
  };
  const scope = scopeForPaths(changedPaths(context), isMainGate(context));
  const outputs =
    Object.entries(scope)
      .map(([key, value]) => `${key}=${value}`)
      .join("\n") + "\n";
  if (process.env.GITHUB_OUTPUT)
    appendFileSync(process.env.GITHUB_OUTPUT, outputs);
  process.stdout.write(outputs);
}
