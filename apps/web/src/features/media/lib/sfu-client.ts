/**
 * Thin LiveKit SFU client wrapper for one room grant.
 *
 * Every connection is disposable: the server hands out one grant per room, and
 * this class only does what the grant allows (`canPublish` / `canSubscribe`).
 * Video and audio are independent — a CAMERA grant never touches the
 * microphone and vice versa.
 */
import {
  LocalAudioTrack,
  LocalVideoTrack,
  Room,
  RoomEvent,
  Track,
  type RemoteParticipant,
  type RemoteTrack,
  type RemoteTrackPublication,
} from 'livekit-client';
import type { TransportGrant } from '@xiangqi/contracts';

export interface RemoteMedia {
  key: string;
  roomName: string;
  audience: 'PRIVATE' | 'WATCH';
  participantIdentity: string;
  source: 'camera' | 'microphone';
  track: RemoteTrack;
}

export type SfuState = 'CONNECTING' | 'LIVE' | 'ERROR';

export interface SfuCallbacks {
  onRemoteAdded(media: RemoteMedia): void;
  onRemoteRemoved(key: string): void;
  onState(state: SfuState, detail?: string): void;
}

export class SfuConnection {
  private room: Room | null = null;
  private publication: LocalVideoTrack | LocalAudioTrack | null = null;
  private publishedClone: MediaStreamTrack | null = null;

  constructor(
    private readonly grant: TransportGrant,
    private readonly callbacks: SfuCallbacks,
  ) {}

  private keyFor(participantIdentity: string, source: RemoteMedia['source']): string {
    return `${this.grant.roomName}:${participantIdentity}:${source}`;
  }

  private handleTrackSubscribed = (
    track: RemoteTrack,
    _publication: RemoteTrackPublication,
    participant: RemoteParticipant,
  ): void => {
    const source = track.kind === Track.Kind.Video ? 'camera' : 'microphone';
    this.callbacks.onRemoteAdded({
      key: this.keyFor(participant.identity, source),
      roomName: this.grant.roomName,
      audience: this.grant.audience,
      participantIdentity: participant.identity,
      source,
      track,
    });
  };

  private handleTrackUnsubscribed = (
    track: RemoteTrack,
    _publication: RemoteTrackPublication,
    participant: RemoteParticipant,
  ): void => {
    const source = track.kind === Track.Kind.Video ? 'camera' : 'microphone';
    this.callbacks.onRemoteRemoved(this.keyFor(participant.identity, source));
  };

  private handleDisconnected = (): void => {
    this.callbacks.onState('ERROR', 'Mất kết nối tới SFU');
  };

  async connect(): Promise<void> {
    const room = new Room({ adaptiveStream: false, dynacast: false });
    this.room = room;
    room.on(RoomEvent.TrackSubscribed, this.handleTrackSubscribed);
    room.on(RoomEvent.TrackUnsubscribed, this.handleTrackUnsubscribed);
    room.on(RoomEvent.Disconnected, this.handleDisconnected);

    this.callbacks.onState('CONNECTING');
    // A publish-only WATCH grant must not attempt subscriptions.
    await room.connect(this.grant.url, this.grant.token, { autoSubscribe: this.grant.canSubscribe });
    this.callbacks.onState('LIVE');
  }

  /** Publish a clone of the caller's own capture (never the source itself). */
  async publish(sourceTrack: MediaStreamTrack): Promise<void> {
    const room = this.room;
    if (!room || !this.grant.canPublish || !this.grant.publishSource) return;

    const clone = sourceTrack.clone();
    const isCamera = this.grant.publishSource === 'CAMERA';
    const local = isCamera
      ? new LocalVideoTrack(clone, undefined, true)
      : new LocalAudioTrack(clone, undefined, true);

    try {
      await room.localParticipant.publishTrack(local, {
        source: isCamera ? Track.Source.Camera : Track.Source.Microphone,
        simulcast: false,
      });
      this.publication = local;
      this.publishedClone = clone;
    } catch (err) {
      clone.stop();
      throw err;
    }
  }

  async unpublish(): Promise<void> {
    const room = this.room;
    if (room && this.publication) {
      await room.localParticipant.unpublishTrack(this.publication).catch(() => undefined);
    }
    this.publication?.stop();
    this.publishedClone?.stop();
    this.publication = null;
    this.publishedClone = null;
  }

  async disconnect(): Promise<void> {
    const room = this.room;
    this.room = null;
    if (!room) return;
    room.off(RoomEvent.TrackSubscribed, this.handleTrackSubscribed);
    room.off(RoomEvent.TrackUnsubscribed, this.handleTrackUnsubscribed);
    room.off(RoomEvent.Disconnected, this.handleDisconnected);
    await this.unpublish();
    await room.disconnect().catch(() => undefined);
  }
}
