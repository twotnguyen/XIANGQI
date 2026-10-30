export type PieceStyleId = "jade" | "ebony" | "classic";

const PIECE_STYLES: readonly PieceStyleId[] = ["jade", "ebony", "classic"];
const KEYS = {
  pieceStyle: "xq-piece-style",
  sfx: "xq-sfx-enabled",
  music: "xq-music-enabled",
} as const;

// Giá trị đã ghi trong phiên được ưu tiên hơn localStorage, kể cả khi ghi xuống storage thất bại.
const session = new Map<string, string>();
const listeners = new Set<() => void>();
let clickContext: AudioContext | null = null;

function readValue(key: string): string | null {
  const pending = session.get(key);
  if (pending !== undefined) return pending;
  try {
    return globalThis.localStorage.getItem(key);
  } catch {
    return null;
  }
}
function writeValue(key: string, value: string): void {
  try {
    globalThis.localStorage.setItem(key, value);
    session.delete(key);
  } catch {
    session.set(key, value);
    /* Storage bị chặn hoặc đầy: giữ lựa chọn trong phiên hiện tại. */
  }
}

function emit(): void {
  for (const listener of listeners) listener();
}

/** Đăng ký lắng nghe thay đổi tùy chọn (cùng tab). Trả về hàm hủy đăng ký. */
export function subscribePreferences(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getPieceStyle(): PieceStyleId {
  const saved = readValue(KEYS.pieceStyle);
  return PIECE_STYLES.find((id) => id === saved) ?? "classic";
}

export function setPieceStyle(value: PieceStyleId): void {
  writeValue(KEYS.pieceStyle, value);
  if (typeof document !== "undefined")
    document.documentElement.dataset.pieceStyle = value;
  emit();
}

export function isSfxEnabled(): boolean {
  return readValue(KEYS.sfx) !== "false";
}

export function setSfxEnabled(value: boolean): void {
  writeValue(KEYS.sfx, String(value));
  emit();
}

export function isMusicEnabled(): boolean {
  return readValue(KEYS.music) === "true";
}

export function setMusicEnabled(value: boolean): void {
  writeValue(KEYS.music, String(value));
  emit();
}

/** Tiếng click ngắn tổng hợp bằng WebAudio; không tải tệp bên ngoài. */
export function playClickSound(): void {
  if (!isSfxEnabled() || typeof AudioContext === "undefined") return;
  try {
    clickContext ??= new AudioContext();
    const context = clickContext;
    const play = () => {
      const at = context.currentTime;
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = "triangle";
      oscillator.frequency.value = 900;
      gain.gain.setValueAtTime(0.12, at);
      gain.gain.exponentialRampToValueAtTime(0.001, at + 0.04);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start(at);
      oscillator.stop(at + 0.04);
      oscillator.onended = () => {
        oscillator.disconnect();
        gain.disconnect();
      };
    };
    if (context.state === "running") play();
    else
      // Kiểm tra lại preference sau resume: click đang chờ không được phát sau khi người dùng đã tắt SFX.
      void context
        .resume()
        .then(() => {
          if (isSfxEnabled() && context.state === "running") play();
        })
        .catch(() => {});
  } catch {
    /* Audio không khả dụng: bỏ qua, không ảnh hưởng thao tác. */
  }
}
