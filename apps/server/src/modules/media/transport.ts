/**
 * LiveKit transport grants (spec 06 "SFU và bốn phòng truyền tải").
 *
 * A match has four independent opaque rooms: PRIVATE/WATCH x CAMERA/MICROPHONE.
 * Tokens are room-specific, identity is `<userUUID>-<controlEpoch>`, TTL 60s,
 * `canPublishData:false`. A viewer never publishes; a player's WATCH token is
 * publish-only (`canSubscribe:false`) so listeners get each source once.
 */
import { AccessToken, TrackSource } from 'livekit-server-sdk';
import type {
  MediaKind,
  SourcePolicy,
  TransportAudience,
  TransportGrant,
} from '@xiangqi/contracts';

export const TOKEN_TTL_SECONDS = 60;

export interface LivekitConfig {
  url: string;
  apiKey: string;
  apiSecret: string;
}

export function getLivekitConfig(): LivekitConfig {
  return {
    url: process.env['LIVEKIT_URL'] ?? 'http://127.0.0.1:7880',
    apiKey: process.env['LIVEKIT_API_KEY'] ?? 'devkey',
    apiSecret: process.env['LIVEKIT_API_SECRET'] ?? 'secret',
  };
}

/** One persisted `media_transports` row (READY generation). */
export interface TransportRoom {
  kind: MediaKind;
  audience: TransportAudience;
  generation: number;
  roomName: string;
}

/** Server-derived grant capability for one (role, kind, audience, policy) tuple. */
export interface GrantCapability {
  canPublish: boolean;
  canSubscribe: boolean;
  publishSource: MediaKind | null;
}

/**
 * Derive the transport capability from the viewer's role and the player's own
 * desired policy. The client never chooses this: it obeys the returned grants.
 */
export function deriveGrantCapability(
  role: 'PLAYER' | 'SPECTATOR',
  kind: MediaKind,
  audience: TransportAudience,
  ownPolicy: SourcePolicy,
): GrantCapability {
  if (role === 'SPECTATOR') {
    // Viewers are subscribe-only, and only ever receive WATCH rooms.
    return { canPublish: false, canSubscribe: true, publishSource: null };
  }

  const sourceAudience = kind === 'CAMERA' ? ownPolicy.camera : ownPolicy.microphone;

  if (audience === 'PRIVATE') {
    // Private rooms carry player-to-player media for every non-OFF source.
    const canPublish = sourceAudience !== 'OFF';
    return { canPublish, canSubscribe: true, publishSource: canPublish ? kind : null };
  }

  // Player WATCH token: publish-only, and only while the source is public.
  const canPublish = sourceAudience === 'OPPONENT_AND_SPECTATORS';
  return { canPublish, canSubscribe: false, publishSource: canPublish ? kind : null };
}

async function mintToken(
  config: LivekitConfig,
  roomName: string,
  identity: string,
  capability: GrantCapability,
  kind: MediaKind,
): Promise<string> {
  const token = new AccessToken(config.apiKey, config.apiSecret, {
    identity,
    ttl: `${TOKEN_TTL_SECONDS}s`,
  });
  token.addGrant({
    roomJoin: true,
    room: roomName,
    canPublish: capability.canPublish,
    canPublishSources: capability.canPublish
      ? [kind === 'CAMERA' ? TrackSource.CAMERA : TrackSource.MICROPHONE]
      : [],
    canSubscribe: capability.canSubscribe,
    canPublishData: false,
  });
  return token.toJwt();
}

/** Build the room-specific grants for one participant. */
export async function buildTransportGrants(params: {
  userId: string;
  controlEpoch: number;
  role: 'PLAYER' | 'SPECTATOR';
  ownPolicy: SourcePolicy;
  rooms: TransportRoom[];
  config?: LivekitConfig;
}): Promise<TransportGrant[]> {
  const { userId, controlEpoch, role, ownPolicy, rooms } = params;
  const config = params.config ?? getLivekitConfig();
  const identity = `${userId}-${controlEpoch}`;
  const nowMs = Date.now();

  const wanted = rooms
    .filter((room) => (role === 'SPECTATOR' ? room.audience === 'WATCH' : true))
    .map((room) => {
      const capability = deriveGrantCapability(role, room.kind, room.audience, ownPolicy);
      return { room, capability };
    });

  return Promise.all(
    wanted.map(async ({ room, capability }) => ({
      kind: room.kind,
      audience: room.audience,
      roomName: room.roomName,
      url: config.url,
      token: await mintToken(config, room.roomName, identity, capability, room.kind),
      generation: room.generation,
      status: 'READY' as const,
      expiresAtMs: nowMs + TOKEN_TTL_SECONDS * 1000,
      canPublish: capability.canPublish,
      canSubscribe: capability.canSubscribe,
      publishSource: capability.publishSource,
    })),
  );
}
