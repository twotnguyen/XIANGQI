// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as music from "@web/shared/background-music";
import * as prefs from "@web/shared/preferences";

const oscillators: { start: ReturnType<typeof vi.fn> }[] = [];
const gains: { disconnect: ReturnType<typeof vi.fn> }[] = [];
const contexts: MockAudioContext[] = [];
let nextState: "running" | "suspended" = "running";
let pendingResume: Promise<void> | null = null;

class MockAudioContext {
  state = nextState;
  currentTime = 0;
  destination = {};
  resume = vi.fn(async () => {
    if (pendingResume) await pendingResume;
    if (nextState === "running") this.state = "running";
  });
  close = vi.fn(async () => {
    this.state = "suspended";
  });
  constructor() {
    contexts.push(this);
  }
  createOscillator() {
    const oscillator = {
      type: "sine",
      frequency: { value: 0 },
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
    const gain = {
      gain: {
        value: 1,
        setValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
      },
      connect: vi.fn(),
      disconnect: vi.fn(),
    };
    gains.push(gain);
    return gain;
  }
}

const gesture = () => window.dispatchEvent(new Event("pointerdown"));

beforeEach(() => {
  vi.useFakeTimers();
  localStorage.clear();
  nextState = "running";
  pendingResume = null;
  oscillators.length = 0;
  gains.length = 0;
  contexts.length = 0;
  vi.stubGlobal("AudioContext", MockAudioContext);
});
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("background music runtime", () => {
  it("creates no AudioContext before a user gesture, then plays after one", async () => {
    prefs.setMusicEnabled(true);
    const dispose = music.startBackgroundMusic();
    expect(contexts).toHaveLength(0);
    gesture();
    expect(contexts).toHaveLength(1);
    expect(oscillators.length).toBeGreaterThan(0);
    dispose();
  });

  it("stops scheduling and disconnects once music is turned off", async () => {
    prefs.setMusicEnabled(true);
    const dispose = music.startBackgroundMusic();
    gesture();
    const before = oscillators.length;
    prefs.setMusicEnabled(false);
    expect(gains[0]!.disconnect).toHaveBeenCalled();
    vi.advanceTimersByTime(5000);
    expect(oscillators).toHaveLength(before);
    dispose();
  });

  it("cleans up listeners and timers on dispose", async () => {
    prefs.setMusicEnabled(true);
    const dispose = music.startBackgroundMusic();
    gesture();
    const before = oscillators.length;
    dispose();
    vi.advanceTimersByTime(5000);
    expect(oscillators).toHaveLength(before);
    gesture();
    expect(oscillators).toHaveLength(before);
    expect(contexts[0]!.close).toHaveBeenCalledOnce();
  });

  it("stays silent without throwing when autoplay keeps the context suspended", async () => {
    nextState = "suspended";
    prefs.setMusicEnabled(true);
    const dispose = music.startBackgroundMusic();
    expect(() => gesture()).not.toThrow();
    await vi.advanceTimersByTimeAsync(0);
    expect(oscillators).toHaveLength(0);
    dispose();
  });
  it("does not restart after disposal while an autoplay resume is pending", async () => {
    nextState = "suspended";
    prefs.setMusicEnabled(true);
    const { promise, resolve } = Promise.withResolvers<void>();
    pendingResume = promise;
    const dispose = music.startBackgroundMusic();
    gesture();
    dispose();
    contexts[0]!.state = "running";
    resolve();
    await vi.advanceTimersByTimeAsync(0);
    expect(oscillators).toHaveLength(0);
  });
});
