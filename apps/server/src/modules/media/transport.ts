/**
 * LiveKit media transport helper.
 * Generates short-lived tokens (TTL 60s) with strict source grants according to policy.
 */
import { AccessToken, TrackSource } from 'livekit-server-sdk';
import type { MediaTransportDTO, MediaScope } from '@xiangqi/contracts';

const LIVEKIT_API_KEY = process.env['LIVEKIT_API_KEY'] ?? 'devkey';
const LIVEKIT_API_SECRET = process.env['LIVEKIT_API_SECRET'] ?? 'secret';

function toTrackSources(sources: ('camera' | 'microphone')[]): TrackSource[] {
  return sources.map((s) => (s === 'camera' ? TrackSource.CAMERA : TrackSource.MICROPHONE));
}

export interface UserMediaPolicy {
  camera: MediaScope;
  microphone: MediaScope;
}

/**
 * Generate transport tokens for a participant (Player or Spectator).
 * Enforces:
 * - ROOM transport: player-to-player private communication
 * - WATCH transport: public broadcast to spectators
 */
export async function createMediaTransports(
  userId: string,
  roomId: string,
  generation: number,
  role: 'PLAYER' | 'SPECTATOR',
  myPolicy: UserMediaPolicy,
): Promise<MediaTransportDTO[]> {
  const roomName = `${roomId}:gen_${generation}`;
  const transports: MediaTransportDTO[] = [];

  if (role === 'PLAYER') {
    // 1. ROOM transport: can publish sources if policy !== 'OFF'
    const roomSources: ('camera' | 'microphone')[] = [];
    if (myPolicy.camera !== 'OFF') roomSources.push('camera');
    if (myPolicy.microphone !== 'OFF') roomSources.push('microphone');

    const roomToken = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
      identity: userId,
      ttl: '60s', // No-store short-lived per spec
    });
    roomToken.addGrant({
      roomJoin: true,
      room: roomName,
      canPublish: roomSources.length > 0,
      canPublishSources: toTrackSources(roomSources),
      canSubscribe: true,
    });

    transports.push({
      audience: 'ROOM',
      roomName,
      token: await roomToken.toJwt(),
      canPublishSources: roomSources,
      canSubscribe: true,
    });

    // 2. WATCH transport: only publish if scope === 'PUBLIC'
    const watchSources: ('camera' | 'microphone')[] = [];
    if (myPolicy.camera === 'PUBLIC') watchSources.push('camera');
    if (myPolicy.microphone === 'PUBLIC') watchSources.push('microphone');

    const watchToken = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
      identity: userId,
      ttl: '60s',
    });
    watchToken.addGrant({
      roomJoin: true,
      room: `${roomName}:watch`,
      canPublish: watchSources.length > 0,
      canPublishSources: toTrackSources(watchSources),
      canSubscribe: true,
    });

    transports.push({
      audience: 'WATCH',
      roomName: `${roomName}:watch`,
      token: await watchToken.toJwt(),
      canPublishSources: watchSources,
      canSubscribe: true,
    });
  } else {
    // SPECTATOR: strictly subscribe-only, can only join WATCH transport
    const watchToken = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
      identity: userId,
      ttl: '60s',
    });
    watchToken.addGrant({
      roomJoin: true,
      room: `${roomName}:watch`,
      canPublish: false,
      canSubscribe: true,
    });

    transports.push({
      audience: 'WATCH',
      roomName: `${roomName}:watch`,
      token: await watchToken.toJwt(),
      canPublishSources: [],
      canSubscribe: true,
    });
  }

  return transports;
}
