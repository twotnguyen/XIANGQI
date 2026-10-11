import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { RoomSnapshot } from "@xiangqi/shared";
import { createGameAudio } from "./game-audio";

const initial =
  "rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR w - - 0 1";
const pawn =
  "rnbakabnr/9/1c5c1/p1p1p1p1p/9/P8/2P1P1P1P/1C5C1/9/RNBAKABNR b - - 1 1";
const oscillators: {
  frequency: { value: number };
  start: ReturnType<typeof vi.fn>;
  stop: ReturnType<typeof vi.fn>;
  onended: (() => void) | null;
}[] = [];
const contexts: MockAudioContext[] = [];
class MockAudioContext {
  state = "suspended";
  currentTime = 0;
  destination = {};
  resume = vi.fn(async () => {
    this.state = "running";
  });
  close = vi.fn(async () => {
    this.state = "closed";
  });
  constructor() {
    contexts.push(this);
  }
  createOscillator() {
    const oscillator = {
      frequency: { value: 0 },
      type: "sine",
      start: vi.fn(),
      stop: vi.fn(),
      connect: vi.fn(),
      disconnect: vi.fn(),
      onended: null as (() => void) | null,
    };
    oscillators.push(oscillator);
    return oscillator;
  }
  createGain() {
    return {
      gain: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
      connect: vi.fn(),
      disconnect: vi.fn(),
    };
  }
}
function snapshot(
  overrides: Partial<NonNullable<RoomSnapshot["match"]>> = {},
): RoomSnapshot {
  return {
    serverNow: "2026-10-11T00:00:00Z",
    roomId: "room",
    version: 1,
    room: {
      status: "PLAYING",
      hostId: "red",
      name: "Fixture",
      visibility: "PUBLIC",
      inviteCode: null,
      timeMinutes: 10,
      viewerLimit: 5,
      seats: { red: "red", black: "black" },
      ready: { red: true, black: true },
      connected: { red: true, black: true },
      graceUntil: { red: null, black: null },
      countdown: null,
    },
    match: {
      id: "match",
      version: 0,
      position: initial,
      lastMove: null,
      turn: "red",
      status: "ACTIVE",
      winner: null,
      endedAt: null,
      result: null,
      ...overrides,
    },
    clocks: null,
    role: "red",
    control: { mode: "writable", generation: 1, reason: null },
  };
}
const helpers: ReturnType<typeof createGameAudio>[] = [];
function audio() {
  const helper = createGameAudio();
  helpers.push(helper);
  return helper;
}
const moved = () =>
  snapshot({
    version: 1,
    position: pawn,
    turn: "black",
    lastMove: { from: 54, to: 45, eventVersion: 1 },
  });
beforeEach(() => {
  vi.useFakeTimers();
  vi.stubGlobal("AudioContext", MockAudioContext);
  oscillators.length = 0;
  contexts.length = 0;
});
afterEach(() => {
  for (const helper of helpers.splice(0)) {
    helper.setMuted(false);
    helper.close();
  }
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe("accepted game audio", () => {
  it("separates the accepted terminal move and result, including duplicate delivery", async () => {
    const helper = audio();
    await helper.unlock();
    const ended = {
      ...moved(),
      match: {
        ...moved().match!,
        version: 2,
        status: "FINISHED" as const,
        result: "CHECKMATE",
      },
    };
    helper.accept(snapshot(), ended);
    helper.accept(snapshot(), ended);
    expect(oscillators.map((item) => item.frequency.value)).toEqual([440]);
    vi.advanceTimersByTime(179);
    expect(oscillators).toHaveLength(1);
    vi.advanceTimersByTime(1);
    expect(oscillators.map((item) => item.frequency.value)).toEqual([440, 660]);
  });
  it("consumes muted events without replay after unmute and stops all live helpers", async () => {
    const first = audio();
    const second = audio();
    await first.unlock();
    await second.unlock();
    first.accept(snapshot(), moved());
    second.setMuted(true);
    expect(oscillators[0]!.stop).toHaveBeenCalledTimes(2);
    second.accept(snapshot(), moved());
    second.setMuted(false);
    second.accept(snapshot(), moved());
    expect(oscillators).toHaveLength(1);
  });
  it("skips a multi-move resync rather than guessing its capture from an old board", async () => {
    const helper = audio();
    await helper.unlock();
    helper.accept(
      snapshot(),
      snapshot({
        version: 3,
        position: pawn,
        lastMove: { from: 54, to: 45, eventVersion: 3 },
      }),
    );
    expect(oscillators).toHaveLength(0);
  });
  it("creates audio only on gesture unlock and never plays initial historical state", async () => {
    const helper = audio();
    helper.accept(null, moved());
    expect(contexts).toHaveLength(0);
    await helper.unlock();
    helper.accept(null, moved());
    expect(oscillators).toHaveLength(0);
    expect(contexts[0]!.resume).toHaveBeenCalledOnce();
  });
  it("plays one quiet move for duplicate acknowledgement/broadcast", async () => {
    const helper = audio();
    await helper.unlock();
    helper.accept(snapshot(), moved());
    helper.accept(snapshot(), moved());
    expect(oscillators).toHaveLength(1);
    expect(oscillators[0]!.frequency.value).toBe(440);
  });
  it("distinguishes capture from previous canonical board and check from target position", async () => {
    const helper = audio();
    await helper.unlock();
    helper.accept(
      snapshot(),
      snapshot({
        version: 1,
        position:
          "rCbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/7C1/9/RNBAKABNR b - - 0 1",
        turn: "black",
        lastMove: { from: 64, to: 1, eventVersion: 1 },
      }),
    );
    const previous = snapshot({
      id: "check",
      position: "4k4/9/3R5/9/4p4/9/9/9/9/4K4 w - - 0 1",
    });
    helper.accept(
      previous,
      snapshot({
        id: "check",
        version: 1,
        position: "4k4/9/4R4/9/4p4/9/9/9/9/4K4 b - - 1 1",
        turn: "black",
        lastMove: { from: 21, to: 22, eventVersion: 1 },
      }),
    );
    expect(oscillators.map((item) => item.frequency.value)).toEqual([220, 880]);
  });
  it("plays result once and skips reload, new match historical moves and stale events", async () => {
    const helper = audio();
    await helper.unlock();
    const ended = snapshot({
      version: 1,
      status: "FINISHED",
      result: "RESIGN",
      winner: "black",
    });
    helper.accept(snapshot(), ended);
    helper.accept(snapshot(), ended);
    helper.accept(null, ended);
    helper.accept(
      ended,
      snapshot({
        id: "other",
        version: 9,
        lastMove: { from: 54, to: 45, eventVersion: 9 },
        position: pawn,
      }),
    );
    helper.accept(moved(), snapshot());
    expect(oscillators.map((item) => item.frequency.value)).toEqual([660]);
  });
  it("mute stops active tones and cancels scheduled result; preference survives remount", async () => {
    const helper = audio();
    await helper.unlock();
    helper.accept(snapshot(), {
      ...moved(),
      match: {
        ...moved().match!,
        version: 2,
        status: "FINISHED",
        result: "CHECKMATE",
      },
    });
    expect(oscillators).toHaveLength(1);
    helper.setMuted(true);
    expect(oscillators[0]!.stop).toHaveBeenCalledTimes(2);
    vi.runAllTimers();
    expect(oscillators).toHaveLength(1);
    const remounted = audio();
    expect(remounted.muted).toBe(true);
    expect(remounted.toggle()).toBe(false);
  });
  it("close cancels pending tones and rejects further unlock/play", async () => {
    const helper = audio();
    await helper.unlock();
    helper.accept(snapshot(), {
      ...moved(),
      match: {
        ...moved().match!,
        version: 2,
        status: "FINISHED",
        result: "CHECKMATE",
      },
    });
    helper.close();
    vi.runAllTimers();
    await helper.unlock();
    helper.accept(snapshot(), moved());
    expect(oscillators).toHaveLength(1);
    expect(contexts).toHaveLength(1);
    expect(contexts[0]!.close).toHaveBeenCalledOnce();
  });
  it("does not replay events observed while locked or muted, and fails safely without WebAudio", async () => {
    const helper = audio();
    helper.accept(snapshot(), moved());
    await helper.unlock();
    helper.accept(snapshot(), moved());
    expect(oscillators).toHaveLength(0);
    vi.stubGlobal("AudioContext", undefined);
    await audio().unlock();
  });
});
