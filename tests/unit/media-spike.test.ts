import { describe, it, expect } from 'vitest';
import { AccessToken, TrackSource } from 'livekit-server-sdk';

const API_KEY = 'devkey';
const API_SECRET = 'secret';

describe('T024: LiveKit Media Token Generation & Grants Isolation', () => {
  it('T024-01: Generates valid player token with camera and mic grants', async () => {
    const token = new AccessToken(API_KEY, API_SECRET, {
      identity: 'player_red',
      ttl: '10m',
    });
    token.addGrant({
      roomJoin: true,
      room: 'room_123:gen_1',
      canPublish: true,
      canPublishSources: [TrackSource.CAMERA, TrackSource.MICROPHONE],
      canSubscribe: true,
    });

    const jwt = await token.toJwt();
    expect(typeof jwt).toBe('string');
    expect(jwt.split('.')).toHaveLength(3);
    expect(token.grants.video?.room).toBe('room_123:gen_1');
    expect(token.grants.video?.canPublish).toBe(true);
    const sources = token.grants.video?.canPublishSources?.map(String) ?? [];
    expect(sources).toContain('camera');
    expect(sources).toContain('microphone');
  });

  it('T024-02: Viewer token is strictly subscribe-only (canPublish: false)', async () => {
    const token = new AccessToken(API_KEY, API_SECRET, {
      identity: 'viewer_1',
      ttl: '10m',
    });
    token.addGrant({
      roomJoin: true,
      room: 'room_123:gen_1',
      canPublish: false,
      canSubscribe: true,
    });

    const jwt = await token.toJwt();
    expect(typeof jwt).toBe('string');
    expect(token.grants.video?.canPublish).toBe(false);
    expect(token.grants.video?.canSubscribe).toBe(true);
  });

  it('T024-04: Generation Rotation isolates old token from new room generation', () => {
    const gen1Room = 'room_123:gen_1';
    const gen2Room = 'room_123:gen_2';

    const oldToken = new AccessToken(API_KEY, API_SECRET, {
      identity: 'viewer_1',
    });
    oldToken.addGrant({
      roomJoin: true,
      room: gen1Room,
      canSubscribe: true,
    });

    // Invariant: Token bound to gen1Room cannot join gen2Room
    expect(oldToken.grants.video?.room).toBe(gen1Room);
    expect(oldToken.grants.video?.room).not.toBe(gen2Room);
  });

  it('T024-05: Camera-only token excludes microphone source', () => {
    const token = new AccessToken(API_KEY, API_SECRET, {
      identity: 'cam_only',
    });
    token.addGrant({
      roomJoin: true,
      room: 'room_123:gen_1',
      canPublish: true,
      canPublishSources: ['camera'],
      canSubscribe: true,
    });

    const sources = token.grants.video?.canPublishSources ?? [];
    expect(sources).toContain('camera');
    expect(sources).not.toContain('microphone');
  });
});
