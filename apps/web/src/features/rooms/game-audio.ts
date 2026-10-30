import type { RoomSnapshot } from "@xiangqi/shared";
import { isInCheck, parsePosition } from "@xiangqi/xiangqi-core";
import { isSfxEnabled, setSfxEnabled } from "../../shared/preferences.js";

const stops = new Set<() => void>();

export interface GameAudio {
  unlock(): Promise<void>;
  accept(previous: RoomSnapshot | null, next: RoomSnapshot): void;
  readonly muted: boolean;
  setMuted(value: boolean): void;
  toggle(): boolean;
  close(): void;
}

/**
 * Khởi tạo bộ quản lý âm thanh trò chơi bằng Web Audio API (tổng hợp sóng âm qua Oscillator).
 * Phát các hiệu ứng âm thanh: đi quân thường (440Hz), ăn quân (220Hz), chiếu tướng (880Hz), kết thúc ván (660Hz).
 * So khớp snapshot phòng trước/sau để xác định nước đi mới hoặc kết quả mới.
 * Trạng thái tắt/bật đọc và ghi cùng tùy chọn SFX trong shared/preferences.
 * Tự động bỏ qua an toàn nếu trình duyệt chặn AudioContext hoặc không hỗ trợ.
 */
export function createGameAudio(): GameAudio {
  let context: AudioContext | null = null;
  let closed = false;
  const active = new Set<OscillatorNode>();
  const timers = new Set<ReturnType<typeof setTimeout>>();
  const seen = new Map<string, { move: number; result: number }>();
  function stop() {
    for (const timer of timers) clearTimeout(timer);
    timers.clear();
    for (const oscillator of active) oscillator.stop();
    active.clear();
  }
  stops.add(stop);
  function tone(frequency: number) {
    if (closed || !isSfxEnabled() || context?.state !== "running") return;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const duration = frequency === 660 ? 0.3 : frequency === 880 ? 0.15 : 0.08;
    oscillator.type = "triangle";
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0.06, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(
      0.001,
      context.currentTime + duration,
    );
    oscillator.connect(gain);
    gain.connect(context.destination);
    active.add(oscillator);
    oscillator.onended = () => {
      active.delete(oscillator);
      oscillator.disconnect();
      gain.disconnect();
    };
    oscillator.start();
    oscillator.stop(context.currentTime + duration);
  }
  function setMuted(value: boolean) {
    setSfxEnabled(!value);
    if (value) for (const stopAudio of stops) stopAudio();
  }
  return {
    async unlock() {
      if (closed || typeof AudioContext === "undefined") return;
      try {
        context ??= new AudioContext();
        if (context.state === "suspended") await context.resume();
      } catch {
        // Unsupported or blocked audio must not interrupt gameplay.
      }
    },
    accept(previous: RoomSnapshot | null, next: RoomSnapshot) {
      if (closed || !next.match) return;
      const match = next.match;
      const prior = previous?.match;
      const mark = seen.get(match.id) ?? { move: -1, result: -1 };
      const moveVersion = match.lastMove?.eventVersion ?? -1;
      const terminal = match.status !== "ACTIVE";
      const baseline = !prior || prior.id !== match.id;
      const newMove =
        !baseline &&
        moveVersion > mark.move &&
        moveVersion === prior.version + 1;
      const newResult =
        !baseline &&
        terminal &&
        prior.status === "ACTIVE" &&
        match.version > prior.version &&
        match.version > mark.result;
      mark.move = Math.max(mark.move, moveVersion);
      if (terminal) mark.result = Math.max(mark.result, match.version);
      seen.set(match.id, mark);
      if (baseline || !isSfxEnabled() || context?.state !== "running") return;
      if (newMove && match.lastMove) {
        const position = parsePosition(match.position);
        const capture = parsePosition(prior.position).board[match.lastMove.to];
        tone(isInCheck(position, position.turn) ? 880 : capture ? 220 : 440);
      }
      if (newResult) {
        if (!newMove) tone(660);
        else {
          const timer = setTimeout(() => {
            timers.delete(timer);
            tone(660);
          }, 180);
          timers.add(timer);
        }
      }
    },
    get muted() {
      return !isSfxEnabled();
    },
    setMuted,
    toggle() {
      setMuted(isSfxEnabled());
      return !isSfxEnabled();
    },
    close() {
      if (closed) return;
      closed = true;
      stop();
      stops.delete(stop);
      void context?.close();
    },
  };
}
