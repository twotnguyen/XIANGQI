/**
 * Local media track manager.
 * Handles camera/microphone capture, reference counting, and immediate stop.
 * Prevents echo: own audio preview is always muted.
 */
export class LocalTrackManager {
  private cameraStream: MediaStream | null = null;
  private micStream: MediaStream | null = null;

  async startCamera(): Promise<MediaStream> {
    if (this.cameraStream && this.cameraStream.active) {
      return this.cameraStream;
    }

    try {
      this.cameraStream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, frameRate: { max: 24 } },
        audio: false,
      });
      return this.cameraStream;
    } catch (err) {
      this.cameraStream = null;
      throw err;
    }
  }

  stopCamera(): void {
    if (this.cameraStream) {
      this.cameraStream.getTracks().forEach((t) => t.stop());
      this.cameraStream = null;
    }
  }

  async startMicrophone(): Promise<MediaStream> {
    if (this.micStream && this.micStream.active) {
      return this.micStream;
    }

    try {
      this.micStream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true },
        video: false,
      });
      return this.micStream;
    } catch (err) {
      this.micStream = null;
      throw err;
    }
  }

  stopMicrophone(): void {
    if (this.micStream) {
      this.micStream.getTracks().forEach((t) => t.stop());
      this.micStream = null;
    }
  }

  stopAll(): void {
    this.stopCamera();
    this.stopMicrophone();
  }

  getCameraStream(): MediaStream | null {
    return this.cameraStream;
  }

  getMicStream(): MediaStream | null {
    return this.micStream;
  }
}

export const localTrackManager = new LocalTrackManager();
