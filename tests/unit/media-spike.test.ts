/**
 * T024 — grant structure (fast unit lane).
 *
 * These cases assert the SERVER's grant derivation (identity, TTL, source
 * isolation, viewer publish ban) by decoding tokens produced by
 * `apps/server/src/modules/media/transport.ts`.
 *
 * They are NOT SFU proof. Real media bytes/frames are asserted in
 * `tests/media/spike.ts` against a running LiveKit SFU (positive control +
 * bounded deny window), per docs/specs/08-TEST-EXECUTION.md.
 */
import { describe, it, expect } from 'vitest';
import { deriveGrantCapability, buildTransportGrants } from '../../apps/server/src/modules/media/transport.js';
import type { Audience, SourcePolicy, TransportRoom } from '@xiangqi/contracts';

const CONFIG = { url: 'http://127.0.0.1:7880', apiKey: 'devkey', apiSecret: 'secret' };

const ROOMS: TransportRoom[] = [
  { kind: 'CAMERA', audience: 'PRIVATE', generation: 1, roomName: 'mq-m-CAMERA-PRIVATE-n1' },
  { kind: 'MICROPHONE', audience: 'PRIVATE', generation: 1, roomName: 'mq-m-MICROPHONE-PRIVATE-n1' },
  { kind: 'CAMERA', audience: 'WATCH', generation: 1, roomName: 'mq-m-CAMERA-WATCH-n1' },
  { kind: 'MICROPHONE', audience: 'WATCH', generation: 1, roomName: 'mq-m-MICROPHONE-WATCH-n1' },
];

const USER_ID = '11111111-1111-4111-8111-111111111111';

function decodeJwtPayload(token: string): { sub: string; exp: number; video: Record<string, unknown> } {
  const payload = token.split('.')[1];
  const json = Buffer.from(payload, 'base64url').toString('utf8');
  return JSON.parse(json) as { sub: string; exp: number; video: Record<string, unknown> };
}

function policy(camera: Audience, microphone: Audience): SourcePolicy {
  return { camera, microphone };
}

describe('T024-01: player grants carry the server identity and 60s TTL', () => {
  it('binds identity to userUUID-controlEpoch and expires within 60s', async () => {
    const grants = await buildTransportGrants({
      userId: USER_ID,
      controlEpoch: 7,
      role: 'PLAYER',
      ownPolicy: policy('OPPONENT_ONLY', 'OFF'),
      rooms: ROOMS,
      config: CONFIG,
    });

    const privateCamera = grants.find((grant) => grant.kind === 'CAMERA' && grant.audience === 'PRIVATE');
    expect(privateCamera).toBeDefined();
    const claims = decodeJwtPayload(privateCamera!.token);
    expect(claims.sub).toBe(`${USER_ID}-7`);
    expect(claims.video.room).toBe('mq-m-CAMERA-PRIVATE-n1');
    const secondsUntilExpiry = claims.exp - Math.floor(Date.now() / 1000);
    expect(secondsUntilExpiry).toBeGreaterThan(0);
    expect(secondsUntilExpiry).toBeLessThanOrEqual(60);
    expect(claims.video.canPublishData).toBe(false);
    expect(privateCamera!.expiresAtMs).toBeGreaterThan(Date.now());
  });
});

describe('T024-02: viewer grants are strictly subscribe-only', () => {
  it('issues WATCH rooms only, canPublish false, publishSource null', async () => {
    const grants = await buildTransportGrants({
      userId: USER_ID,
      controlEpoch: 1,
      role: 'SPECTATOR',
      ownPolicy: policy('OPPONENT_AND_SPECTATORS', 'OPPONENT_AND_SPECTATORS'),
      rooms: ROOMS,
      config: CONFIG,
    });

    expect(grants).toHaveLength(2);
    expect(grants.every((grant) => grant.audience === 'WATCH')).toBe(true);
    for (const grant of grants) {
      const claims = decodeJwtPayload(grant.token);
      expect(grant.canPublish).toBe(false);
      expect(grant.canSubscribe).toBe(true);
      expect(grant.publishSource).toBeNull();
      expect(claims.video.canPublish).toBe(false);
      expect(claims.video.canSubscribe).toBe(true);
    }
    // A viewer never receives a PRIVATE room name.
    expect(grants.some((grant) => grant.roomName.includes('PRIVATE'))).toBe(false);
  });
});

describe('T024-03: player WATCH grants are publish-only', () => {
  it('sets canSubscribe false on the player watch token while public', async () => {
    const grants = await buildTransportGrants({
      userId: USER_ID,
      controlEpoch: 2,
      role: 'PLAYER',
      ownPolicy: policy('OPPONENT_AND_SPECTATORS', 'OFF'),
      rooms: ROOMS,
      config: CONFIG,
    });

    const watchCamera = grants.find((grant) => grant.kind === 'CAMERA' && grant.audience === 'WATCH');
    expect(watchCamera?.canPublish).toBe(true);
    expect(watchCamera?.canSubscribe).toBe(false);
    expect(decodeJwtPayload(watchCamera!.token).video.canSubscribe).toBe(false);

    const watchMic = grants.find((grant) => grant.kind === 'MICROPHONE' && grant.audience === 'WATCH');
    expect(watchMic?.canPublish).toBe(false);
    expect(decodeJwtPayload(watchMic!.token).video.canPublish).toBe(false);
  });
});

describe('T024-04: a camera token cannot publish the microphone', () => {
  it('restricts canPublishSources to the granted kind only', async () => {
    const grants = await buildTransportGrants({
      userId: USER_ID,
      controlEpoch: 3,
      role: 'PLAYER',
      ownPolicy: policy('OPPONENT_ONLY', 'OFF'),
      rooms: ROOMS,
      config: CONFIG,
    });

    const privateCamera = grants.find((grant) => grant.kind === 'CAMERA' && grant.audience === 'PRIVATE');
    const claims = decodeJwtPayload(privateCamera!.token);
    expect(claims.video.canPublishSources).toEqual(['camera']);
    expect(privateCamera!.publishSource).toBe('CAMERA');
  });
});

describe('T024-05: camera and microphone are independent for all 9 audience pairs', () => {
  const audiences: Audience[] = ['OFF', 'OPPONENT_ONLY', 'OPPONENT_AND_SPECTATORS'];

  for (const camera of audiences) {
    for (const microphone of audiences) {
      it(`camera=${camera} microphone=${microphone}`, () => {
        const own = policy(camera, microphone);

        const privateCamera = deriveGrantCapability('PLAYER', 'CAMERA', 'PRIVATE', own);
        const privateMic = deriveGrantCapability('PLAYER', 'MICROPHONE', 'PRIVATE', own);
        const watchCamera = deriveGrantCapability('PLAYER', 'CAMERA', 'WATCH', own);
        const watchMic = deriveGrantCapability('PLAYER', 'MICROPHONE', 'WATCH', own);

        // Private room publishes exactly the non-OFF sources, and always subscribes.
        expect(privateCamera.canPublish).toBe(camera !== 'OFF');
        expect(privateMic.canPublish).toBe(microphone !== 'OFF');
        expect(privateCamera.canSubscribe).toBe(true);
        expect(privateMic.canSubscribe).toBe(true);

        // WATCH room publishes only public sources and never subscribes.
        expect(watchCamera.canPublish).toBe(camera === 'OPPONENT_AND_SPECTATORS');
        expect(watchMic.canPublish).toBe(microphone === 'OPPONENT_AND_SPECTATORS');
        expect(watchCamera.canSubscribe).toBe(false);
        expect(watchMic.canSubscribe).toBe(false);

        // Turning one source off never disables the other.
        if (camera === 'OFF' && microphone !== 'OFF') expect(privateMic.canPublish).toBe(true);
        if (microphone === 'OFF' && camera !== 'OFF') expect(privateCamera.canPublish).toBe(true);
      });
    }
  }
});
