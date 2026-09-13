/**
 * Local capture manager with reference counting.
 *
 * A player captures each source at most once and clones the track for every room
 * it publishes into (private + watch). The hardware track stops only when the
 * last consumer releases it, so turning camera OFF never stops the microphone and
 * leaving a room never kills a source another room is still using.
 */
export type CaptureKind = 'camera' | 'microphone';

interface CaptureSlot {
  stream: MediaStream | null;
  consumers: number;
}

const CAMERA_CONSTRAINTS: MediaStreamConstraints = {
  video: { width: { ideal: 640 }, height: { ideal: 360 }, frameRate: { max: 15 } },
  audio: false,
};

const MICROPHONE_CONSTRAINTS: MediaStreamConstraints = {
  audio: { echoCancellation: true, noiseSuppression: true },
  video: false,
};

export class LocalTrackManager {
  private slots: Record<CaptureKind, CaptureSlot> = {
    camera: { stream: null, consumers: 0 },
    microphone: { stream: null, consumers: 0 },
  };

  private constraintsFor(kind: CaptureKind): MediaStreamConstraints {
    return kind === 'camera' ? CAMERA_CONSTRAINTS : MICROPHONE_CONSTRAINTS;
  }

  /** Capture if needed and register one consumer; returns the source track. */
  async acquire(kind: CaptureKind): Promise<MediaStreamTrack> {
    const slot = this.slots[kind];
    if (!slot.stream || !slot.stream.active) {
      slot.stream = await navigator.mediaDevices.getUserMedia(this.constraintsFor(kind));
    }
    const track = slot.stream.getTracks()[0];
    if (!track) {
      slot.stream = null;
      throw new Error(`Không lấy được track ${kind}`);
    }
    slot.consumers += 1;
    return track;
  }

  /** Capture on user gesture without registering a consumer (permission check). */
  async ensureCapture(kind: CaptureKind): Promise<void> {
    const slot = this.slots[kind];
    if (!slot.stream || !slot.stream.active) {
      slot.stream = await navigator.mediaDevices.getUserMedia(this.constraintsFor(kind));
    }
  }

  /** Release one consumer; stops hardware capture when nobody needs it. */
  release(kind: CaptureKind): void {
    const slot = this.slots[kind];
    slot.consumers = Math.max(0, slot.consumers - 1);
    if (slot.consumers === 0) this.stop(kind);
  }

  /** A per-room clone of the current source; null when nothing is captured. */
  cloneForPublish(kind: CaptureKind): MediaStreamTrack | null {
    const track = this.slots[kind].stream?.getTracks()[0];
    return track ? track.clone() : null;
  }

  isActive(kind: CaptureKind): boolean {
    return this.slots[kind].stream?.active ?? false;
  }

  getStream(kind: CaptureKind): MediaStream | null {
    return this.slots[kind].stream;
  }

  stop(kind: CaptureKind): void {
    const slot = this.slots[kind];
    slot.stream?.getTracks().forEach((track) => track.stop());
    slot.stream = null;
    slot.consumers = 0;
  }

  stopAll(): void {
    this.stop('camera');
    this.stop('microphone');
  }
}

export const localTrackManager = new LocalTrackManager();
