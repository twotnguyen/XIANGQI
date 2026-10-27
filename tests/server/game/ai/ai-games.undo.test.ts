import { expect, it, vi } from "vitest";
import { type EngineResult } from "@xiangqi/engine";
import { legalMoves, parsePosition } from "@xiangqi/xiangqi-core";
import type { AiGames } from "@server/game/ai/ai-games.js";
import { owner, fixture } from "./ai-games.test-helper.js";

const firstMove = (position: string) => legalMoves(parsePosition(position))[0]!;

const engineReply = (position: string): EngineResult => ({
  move: firstMove(position),
  terminal: null,
  completedDepth: 2,
  targetDepth: 2,
  elapsedMs: 1,
  nodes: 1,
  timedOut: false,
});

function thrown(run: () => unknown): unknown {
  try {
    run();
  } catch (error) {
    return error;
  }
  throw new Error("expected synchronous throw");
}

// One human move followed by the engine reply, waited to IDLE; returns the fresh snapshot.
async function play(games: AiGames, id: string) {
  const before = games.read(owner, id);
  await games.move(owner, id, {
    version: before.version,
    move: firstMove(before.position),
  });
  await games.waitForEngine(owner, id);
  return games.read(owner, id);
}

it("allows three undos per game and refuses the fourth while plies remain", async () => {
  const f = fixture();
  await f.games.ready();
  const created = await f.games.create(owner, {
    requestedSide: "red",
    level: "easy",
  });
  let game = created;
  for (let used = 0; used < 3; used++) {
    game = await play(f.games, game.id);
    expect(game.history).toHaveLength(3);
    game = await f.games.undo(owner, game.id, { version: game.version });
    expect(game).toMatchObject({ undoUsed: used + 1, engineState: "IDLE" });
    expect(game.history).toEqual([created.position]);
    expect(game.position).toBe(created.position);
  }
  game = await play(f.games, game.id);
  const before = f.games.read(owner, game.id);
  await expect(
    f.games.undo(owner, game.id, { version: game.version }),
  ).rejects.toMatchObject({ code: "AI_UNDO_EXHAUSTED" });
  expect(f.games.read(owner, game.id)).toEqual(before);
  expect(before).toMatchObject({ undoUsed: 3 });
  expect(before.history).toHaveLength(3);
  await f.games.close();
});

it("refuses undo while an engine-opened game is still thinking with no human ply", async () => {
  const f = fixture();
  await f.games.ready();
  f.engine.search.mockImplementationOnce(
    () => new Promise<EngineResult>(() => {}),
  );
  const created = await f.games.create(owner, {
    requestedSide: "black",
    level: "easy",
  });
  expect(created).toMatchObject({ engineState: "THINKING", undoUsed: 0 });
  await expect(
    f.games.undo(owner, created.id, { version: created.version }),
  ).rejects.toMatchObject({ code: "AI_UNDO_UNAVAILABLE" });
  expect(f.games.read(owner, created.id)).toEqual(created);
  await f.games.close();
});

it("refuses undo after the engine opening move when no human ply exists", async () => {
  const f = fixture();
  await f.games.ready();
  const created = await f.games.create(owner, {
    requestedSide: "black",
    level: "easy",
  });
  await f.games.waitForEngine(owner, created.id);
  const opened = f.games.read(owner, created.id);
  expect(opened).toMatchObject({ engineState: "IDLE", undoUsed: 0 });
  expect(opened.history).toHaveLength(2);
  await expect(
    f.games.undo(owner, opened.id, { version: opened.version }),
  ).rejects.toMatchObject({ code: "AI_UNDO_UNAVAILABLE" });
  expect(f.games.read(owner, opened.id)).toEqual(opened);
  await f.games.close();
});

it("refuses undo after the game has finished", async () => {
  const f = fixture();
  await f.games.ready();
  const created = await f.games.create(owner, {
    requestedSide: "red",
    level: "easy",
  });
  const played = await play(f.games, created.id);
  const resigned = await f.games.resign(owner, played.id, {
    version: played.version,
  });
  expect(resigned.status).toBe("FINISHED");
  const finished = f.games.read(owner, created.id);
  await expect(
    f.games.undo(owner, created.id, { version: finished.version }),
  ).rejects.toMatchObject({ code: "AI_FINISHED" });
  expect(f.games.read(owner, created.id)).toEqual(finished);
  await f.games.close();
});

it("cancels a pending engine search on undo and ignores its late completion", async () => {
  const f = fixture();
  await f.games.ready();
  const created = await f.games.create(owner, {
    requestedSide: "red",
    level: "easy",
  });
  let release!: (result: EngineResult) => void;
  let signal: AbortSignal | undefined;
  f.engine.search.mockImplementationOnce((_request, options) => {
    signal = options?.signal;
    return new Promise<EngineResult>((r) => (release = r));
  });
  const moved = await f.games.move(owner, created.id, {
    version: created.version,
    move: firstMove(created.position),
  });
  expect(moved.engineState).toBe("THINKING");
  await vi.waitFor(() => expect(signal).toBeDefined());
  const commits = f.commit.mock.calls.length;
  const undone = await f.games.undo(owner, created.id, {
    version: moved.version,
  });
  expect(signal?.aborted).toBe(true);
  expect(undone).toMatchObject({
    engineState: "IDLE",
    engineError: null,
    undoUsed: 1,
    position: created.position,
    version: moved.version + 1,
  });
  expect(undone.history).toEqual([created.position]);
  release(engineReply(created.position));
  await f.games.waitForEngine(owner, created.id);
  expect(f.games.read(owner, created.id)).toEqual(undone);
  // Only the undo commits; the cancelled job never reaches a transaction.
  expect(f.commit).toHaveBeenCalledTimes(commits + 1);
  await f.games.close();
});

it("does not spend an undo when the commit fails", async () => {
  const f = fixture();
  await f.games.ready();
  const created = await f.games.create(owner, {
    requestedSide: "red",
    level: "easy",
  });
  await play(f.games, created.id);
  const before = f.games.read(owner, created.id);
  f.commit.mockImplementationOnce(async () => {
    throw Error("commit failed");
  });
  await expect(
    f.games.undo(owner, created.id, { version: before.version }),
  ).rejects.toMatchObject({ code: "AI_UNAVAILABLE" });
  expect(f.games.read(owner, created.id)).toEqual(before);
  const undone = await f.games.undo(owner, created.id, {
    version: before.version,
  });
  expect(undone).toMatchObject({ undoUsed: 1, version: before.version + 1 });
  expect(undone.history).toEqual([created.position]);
  await f.games.close();
});

it("drop cancels pending engine work, removes RAM without history, and frees the slot", async () => {
  const f = fixture();
  await f.games.ready();
  const created = await f.games.create(owner, {
    requestedSide: "red",
    level: "easy",
  });
  let release!: (result: EngineResult) => void;
  let signal: AbortSignal | undefined;
  f.engine.search.mockImplementationOnce((_request, options) => {
    signal = options?.signal;
    return new Promise<EngineResult>((r) => (release = r));
  });
  await f.games.move(owner, created.id, {
    version: created.version,
    move: firstMove(created.position),
  });
  await vi.waitFor(() => expect(signal).toBeDefined());
  const commits = f.commit.mock.calls.length;
  const runs = f.origins.length;
  f.games.drop(owner, created.id);
  expect(signal?.aborted).toBe(true);
  expect(thrown(() => f.games.read(owner, created.id))).toMatchObject({
    code: "AI_NOT_FOUND",
  });
  release(engineReply(created.position));
  // The cancelled job still enters the owner transaction gate once, then discards its work.
  await vi.waitFor(() => expect(f.origins).toHaveLength(runs + 1));
  // Owner transactions are serialized, so this create runs after the cancelled job's transaction.
  const next = await f.games.create(owner, {
    requestedSide: "red",
    level: "easy",
  });
  expect(next.id).not.toBe(created.id);
  expect(f.games.read(owner, next.id)).toMatchObject({ status: "ACTIVE" });
  expect(thrown(() => f.games.read(owner, created.id))).toMatchObject({
    code: "AI_NOT_FOUND",
  });
  // Only the new game's reservation commits; the dropped game wrote no canonical state.
  expect(f.commit).toHaveBeenCalledTimes(commits + 1);
  expect(f.lifecycle.finish).not.toHaveBeenCalled();
  await f.games.close();
});
