import { describe, it, expect } from 'vitest';
import {
  MAX_SPECTATORS,
  onAccessRevoked,
  emitAccessRevoked,
} from '../../apps/server/src/modules/rooms/spectators.js';

describe('T016-01: Spectator limits and revocation events', () => {
  it('MAX_SPECTATORS constant equals 5 per product spec', () => {
    expect(MAX_SPECTATORS).toBe(5);
  });

  it('emitAccessRevoked delivers event to registered listeners and cleans up', () => {
    let received: { roomId: string; reason: string; roomVersion: number } | null = null;
    const unsubscribe = onAccessRevoked((data) => {
      received = data;
    });

    emitAccessRevoked({
      roomId: '550e8400-e29b-41d4-a716-446655440000',
      reason: 'ROOM_LOCKED',
      roomVersion: 2,
    });

    expect(received).not.toBeNull();
    expect(received!.reason).toBe('ROOM_LOCKED');
    expect(received!.roomVersion).toBe(2);

    // Unsubscribe
    received = null;
    unsubscribe();
    emitAccessRevoked({
      roomId: '550e8400-e29b-41d4-a716-446655440000',
      reason: 'ROOM_LOCKED',
      roomVersion: 3,
    });
    expect(received).toBeNull();
  });
});
