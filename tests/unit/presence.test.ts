import { describe, it, expect } from 'vitest';
import { PresenceTracker } from '../../apps/server/src/realtime/presence.js';

describe('T009-01: PresenceTracker lease and multi-tab logic', () => {
  it('single tab heartbeat marks user online', () => {
    const tracker = new PresenceTracker();
    const becameOnline = tracker.heartbeat('user-1', 'tab-1', 1000);
    expect(becameOnline).toBe(true);
    expect(tracker.isUserOnline('user-1', 1000)).toBe(true);
  });

  it('heartbeat within lease duration keeps user online', () => {
    const tracker = new PresenceTracker();
    tracker.heartbeat('user-1', 'tab-1', 1000); // expires at 31000
    expect(tracker.isUserOnline('user-1', 20000)).toBe(true);
  });

  it('expired lease marks user offline', () => {
    const tracker = new PresenceTracker();
    tracker.heartbeat('user-1', 'tab-1', 1000); // expires at 31000
    expect(tracker.isUserOnline('user-1', 35000)).toBe(false);
  });

  it('disconnecting lone tab marks user offline', () => {
    const tracker = new PresenceTracker();
    tracker.heartbeat('user-1', 'tab-1', 1000);
    const becameOffline = tracker.disconnect('user-1', 'tab-1', 2000);
    expect(becameOffline).toBe(true);
    expect(tracker.isUserOnline('user-1', 2000)).toBe(false);
  });

  it('acceptance: multiple tabs — closing 1 of 2 keeps user online', () => {
    const tracker = new PresenceTracker();
    tracker.heartbeat('user-1', 'tab-A', 1000);
    tracker.heartbeat('user-1', 'tab-B', 2000);

    // Disconnect tab-A
    const becameOffline = tracker.disconnect('user-1', 'tab-A', 3000);
    // User should NOT become offline because tab-B is still active
    expect(becameOffline).toBe(false);
    expect(tracker.isUserOnline('user-1', 3000)).toBe(true);

    // Disconnect tab-B
    const secondOffline = tracker.disconnect('user-1', 'tab-B', 4000);
    expect(secondOffline).toBe(true);
    expect(tracker.isUserOnline('user-1', 4000)).toBe(false);
  });

  it('prune removes expired leases and reports offline transitions', () => {
    const tracker = new PresenceTracker();
    tracker.heartbeat('user-1', 'tab-1', 1000); // expires at 31000
    tracker.heartbeat('user-2', 'tab-2', 50000); // expires at 80000

    const offlineUsers = tracker.prune(35000);
    expect(offlineUsers).toContain('user-1');
    expect(offlineUsers).not.toContain('user-2');
    expect(tracker.isUserOnline('user-1', 35000)).toBe(false);
    expect(tracker.isUserOnline('user-2', 35000)).toBe(true);
  });
});
