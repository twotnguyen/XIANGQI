import { isMusicEnabled, subscribePreferences } from "./preferences.js";

export const BGM_URL =
  "https://snsnkoicxmubuotcdafi.supabase.co/storage/v1/object/sign/Music/Music1.m4a?token=eyJraWQiOiI0NDE3OGQ5OS0wOWNkLTQ2YjEtYjdlNi0yODk1NjNjY2E2YzkiLCJhbGciOiJIUzUxMiJ9.eyJ1cmwiOiJNdXNpYy9NdXNpYzEubTRhIiwic2NvcGUiOiJkb3dubG9hZCIsImlhdCI6MTc5MzU1MjI4NCwiZXhwIjoxNzk0MTU3MDg0fQ.lJ2ae06XZrlQw6tF7hJR-3Vy1gF43bdy_Nq6jhwaviQv7SyEJaJ0bsNGwKrFRONYN0GvFfkgvZGvsw_fc6IWpA";

const VOLUME = 0.35;
const GESTURES = ["pointerdown", "keydown"] as const;

/** Nhạc nền ở gốc app; phát tệp nhạc và tự động lặp, dọn dẹp khi dispose. */
export function startBackgroundMusic(url: string = BGM_URL): () => void {
  let audio: HTMLAudioElement | null = null;
  let unlocked = false;
  let disposed = false;

  function getAudio(): HTMLAudioElement | null {
    if (typeof Audio === "undefined") return null;
    if (!audio) {
      audio = new Audio(url);
      audio.loop = true;
      audio.volume = VOLUME;
      audio.preload = "auto";
    }
    return audio;
  }

  function stopMusic(): void {
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
  }

  function syncMusic(): void {
    if (disposed) return;
    if (!isMusicEnabled()) {
      stopMusic();
      return;
    }
    if (!unlocked) return;
    const player = getAudio();
    if (!player) return;
    void player.play().catch(() => {
      /* Bị trình duyệt chặn autoplay trước khi có tương tác hợp lệ. */
    });
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
    if (audio) {
      audio.src = "";
      audio = null;
    }
  };
}
