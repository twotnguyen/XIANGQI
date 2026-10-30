import { isMusicEnabled, subscribePreferences } from "./preferences.js";

// Giai điệu ngũ cung nhẹ tổng hợp bằng WebAudio: không tải tệp ngoài.
const NOTES = [523.25, 587.33, 659.25, 783.99, 659.25, 587.33, 523.25, 392];
const STEP = 0.5;
const LOOKAHEAD = 0.6;
const TICK_MS = 200;
const VOLUME = 0.035;
const GESTURES = ["pointerdown", "keydown"] as const;

/** Nhạc nền ở gốc app; dispose dọn cả lượt resume đang chờ. */
export function startBackgroundMusic(): () => void {
  let context: AudioContext | null = null;
  let playing: {
    gain: GainNode;
    timer: ReturnType<typeof setInterval>;
  } | null = null;
  // Chỉ tạo AudioContext sau cử chỉ người dùng để tránh bị trình duyệt chặn autoplay.
  let unlocked = false;
  let disposed = false;

  function note(
    ctx: AudioContext,
    frequency: number,
    at: number,
    out: AudioNode,
  ): void {
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.type = "triangle";
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(VOLUME, at);
    gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.9);
    oscillator.connect(gain);
    gain.connect(out);
    oscillator.start(at);
    oscillator.stop(at + 0.9);
    oscillator.onended = () => {
      oscillator.disconnect();
      gain.disconnect();
    };
  }

  function stopMusic(): void {
    if (!playing) return;
    clearInterval(playing.timer);
    // Ngắt gain làm câm mọi nốt đã lên lịch; không cần theo dõi từng oscillator.
    playing.gain.disconnect();
    playing = null;
  }

  function startMusic(ctx: AudioContext): void {
    const gain = ctx.createGain();
    gain.connect(ctx.destination);
    let next = ctx.currentTime + 0.1;
    let index = 0;
    const schedule = () => {
      if (next < ctx.currentTime) next = ctx.currentTime;
      while (next < ctx.currentTime + LOOKAHEAD) {
        note(ctx, NOTES[index % NOTES.length]!, next, gain);
        next += STEP;
        index++;
      }
    };
    schedule();
    playing = { gain, timer: setInterval(schedule, TICK_MS) };
  }

  function syncMusic(): void {
    if (!isMusicEnabled()) {
      stopMusic();
      return;
    }
    if (playing || !unlocked || typeof AudioContext === "undefined") return;
    try {
      context ??= new AudioContext();
    } catch {
      return;
    }
    const ctx = context;
    const start = () => {
      if (!disposed && !playing && isMusicEnabled()) startMusic(ctx);
    };
    if (ctx.state === "running") start();
    else
      void ctx
        .resume()
        .then(() => {
          if (ctx.state === "running") start();
        })
        .catch(() => {});
  }

  const onGesture = () => {
    unlocked = true;
    syncMusic();
  };
  for (const type of GESTURES) window.addEventListener(type, onGesture, true);
  const unsubscribe = subscribePreferences(syncMusic);
  syncMusic();
  return () => {
    disposed = true;
    unsubscribe();
    for (const type of GESTURES)
      window.removeEventListener(type, onGesture, true);
    stopMusic();
    void context?.close();
  };
}
