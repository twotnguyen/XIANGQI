// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as music from "@web/shared/background-music";
import * as prefs from "@web/shared/preferences";

class MockAudio {
  src: string;
  loop = false;
  volume = 1;
  preload = "";
  currentTime = 0;
  play = vi.fn().mockResolvedValue(undefined);
  pause = vi.fn();
  static instances: MockAudio[] = [];

  constructor(src?: string) {
    this.src = src ?? "";
    MockAudio.instances.push(this);
  }
}

beforeEach(() => {
  localStorage.clear();
  MockAudio.instances = [];
  vi.stubGlobal("Audio", MockAudio);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("background music runtime", () => {
  it("creates no Audio before a user gesture, then plays after one", () => {
    prefs.setMusicEnabled(true);
    const dispose = music.startBackgroundMusic();
    expect(MockAudio.instances).toHaveLength(0);
    window.dispatchEvent(new Event("pointerdown"));
    expect(MockAudio.instances).toHaveLength(1);
    expect(MockAudio.instances[0]!.play).toHaveBeenCalledOnce();
    expect(MockAudio.instances[0]!.src).toBe(music.BGM_URL);
    expect(MockAudio.instances[0]!.loop).toBe(true);
    dispose();
  });

  it("pauses and resets time once music is turned off", () => {
    prefs.setMusicEnabled(true);
    const dispose = music.startBackgroundMusic();
    window.dispatchEvent(new Event("pointerdown"));
    const audio = MockAudio.instances[0]!;
    expect(audio.play).toHaveBeenCalledOnce();
    prefs.setMusicEnabled(false);
    expect(audio.pause).toHaveBeenCalledOnce();
    expect(audio.currentTime).toBe(0);
    dispose();
  });

  it("cleans up listeners and pauses on dispose", () => {
    prefs.setMusicEnabled(true);
    const dispose = music.startBackgroundMusic();
    window.dispatchEvent(new Event("pointerdown"));
    const audio = MockAudio.instances[0]!;
    dispose();
    expect(audio.pause).toHaveBeenCalledOnce();
    expect(audio.src).toBe("");
  });

  it("stays silent without throwing when autoplay is blocked", () => {
    prefs.setMusicEnabled(true);
    const dispose = music.startBackgroundMusic();
    MockAudio.prototype.play = vi
      .fn()
      .mockRejectedValue(new Error("Autoplay prevented"));
    expect(() => window.dispatchEvent(new Event("pointerdown"))).not.toThrow();
    dispose();
  });
});
