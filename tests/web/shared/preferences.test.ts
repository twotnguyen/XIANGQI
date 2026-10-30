// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  getPieceStyle,
  isMusicEnabled,
  isSfxEnabled,
  playClickSound,
  setMusicEnabled,
  setPieceStyle,
  setSfxEnabled,
} from "@web/shared/preferences";

const oscillators: { start: ReturnType<typeof vi.fn> }[] = [];
class MockAudioContext {
  state = "running";
  currentTime = 0;
  destination = {};
  resume = vi.fn(async () => {});
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
    return {
      gain: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
      connect: vi.fn(),
      disconnect: vi.fn(),
    };
  }
}

beforeEach(() => {
  localStorage.clear();
  delete document.documentElement.dataset.pieceStyle;
  oscillators.length = 0;
  vi.stubGlobal("AudioContext", MockAudioContext);
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  setMusicEnabled(false);
  setSfxEnabled(true);
  setPieceStyle("classic");
});

describe("shared preferences", () => {
  it("defaults to classic pieces, SFX on and music off", () => {
    expect(getPieceStyle()).toBe("classic");
    expect(isSfxEnabled()).toBe(true);
    expect(isMusicEnabled()).toBe(false);
  });

  it("persists choices under the existing keys and applies the piece style", () => {
    setPieceStyle("jade");
    setSfxEnabled(false);
    setMusicEnabled(true);
    expect(localStorage.getItem("xq-piece-style")).toBe("jade");
    expect(localStorage.getItem("xq-sfx-enabled")).toBe("false");
    expect(localStorage.getItem("xq-music-enabled")).toBe("true");
    expect(getPieceStyle()).toBe("jade");
    expect(isSfxEnabled()).toBe(false);
    expect(isMusicEnabled()).toBe(true);
    expect(document.documentElement.dataset.pieceStyle).toBe("jade");
  });

  it("falls back to classic for unknown stored piece styles", () => {
    localStorage.setItem("xq-piece-style", "neon");
    expect(getPieceStyle()).toBe("classic");
  });

  it("keeps choices in-session and does not throw when storage is blocked", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new DOMException("blocked", "SecurityError");
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("blocked", "SecurityError");
    });
    expect(() => setMusicEnabled(true)).not.toThrow();
    expect(() => setSfxEnabled(false)).not.toThrow();
    expect(() => setPieceStyle("ebony")).not.toThrow();
    expect(isMusicEnabled()).toBe(true);
    expect(isSfxEnabled()).toBe(false);
    expect(getPieceStyle()).toBe("ebony");
  });

  it("plays no click while SFX is off and a synthesized click when on", () => {
    setSfxEnabled(false);
    playClickSound();
    expect(oscillators).toHaveLength(0);
    setSfxEnabled(true);
    playClickSound();
    expect(oscillators).toHaveLength(1);
    expect(oscillators[0]!.start).toHaveBeenCalledOnce();
  });

  it("applies the in-session value when reads work but writes throw", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("quota", "QuotaExceededError");
    });
    setSfxEnabled(false);
    expect(isSfxEnabled()).toBe(false);
    setMusicEnabled(true);
    expect(isMusicEnabled()).toBe(true);
  });
});
