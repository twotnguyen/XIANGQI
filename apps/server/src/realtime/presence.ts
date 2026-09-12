/**
 * In-memory presence tracker.
 * Tracks connected tabs per user, leases, and heartbeat.
 * Lease duration: 30s. Heartbeat expected: 10s.
 * Multiple tabs from the same user = 1 online user.
 */

export interface PresenceEntry {
  userId: string;
  tabId: string;
  expiresAtMonoMs: number;
}

const LEASE_DURATION_MS = 30000;

export class PresenceTracker {
  // Map<userId, Map<tabId, expiresAtMonoMs>>
  private userTabs = new Map<string, Map<string, number>>();

  /**
   * Heartbeat or connect from a tab.
   * Extends the lease for this specific tab.
   */
  heartbeat(userId: string, tabId: string, nowMonoMs: number): boolean {
    let tabs = this.userTabs.get(userId);
    const wasOnline = this.isUserOnline(userId, nowMonoMs);

    if (!tabs) {
      tabs = new Map();
      this.userTabs.set(userId, tabs);
    }

    tabs.set(tabId, nowMonoMs + LEASE_DURATION_MS);
    const isOnline = true;

    // Return true if online state transitioned from false to true
    return !wasOnline && isOnline;
  }

  /**
   * Tab disconnects.
   * Returns true if user transitioned from online to offline.
   */
  disconnect(userId: string, tabId: string, nowMonoMs: number): boolean {
    const tabs = this.userTabs.get(userId);
    if (!tabs) return false;

    const wasOnline = this.isUserOnline(userId, nowMonoMs);
    tabs.delete(tabId);

    if (tabs.size === 0) {
      this.userTabs.delete(userId);
    }

    const isOnline = this.isUserOnline(userId, nowMonoMs);
    return wasOnline && !isOnline;
  }

  /**
   * Check if a user is currently online (has at least 1 active tab lease).
   */
  isUserOnline(userId: string, nowMonoMs: number): boolean {
    const tabs = this.userTabs.get(userId);
    if (!tabs || tabs.size === 0) return false;

    // Check if any tab has a non-expired lease
    for (const [tabId, expiresAt] of tabs.entries()) {
      if (expiresAt > nowMonoMs) {
        return true;
      } else {
        // Lazy cleanup of expired tab
        tabs.delete(tabId);
      }
    }

    if (tabs.size === 0) {
      this.userTabs.delete(userId);
    }

    return false;
  }

  /**
   * Prune all expired leases across all users.
   */
  prune(nowMonoMs: number): string[] {
    const becameOffline: string[] = [];

    for (const [userId, tabs] of this.userTabs.entries()) {
      for (const [tabId, expiresAt] of tabs.entries()) {
        if (expiresAt <= nowMonoMs) {
          tabs.delete(tabId);
        }
      }
      if (tabs.size === 0) {
        this.userTabs.delete(userId);
        becameOffline.push(userId);
      }
    }

    return becameOffline;
  }
}

export const defaultPresence = new PresenceTracker();
