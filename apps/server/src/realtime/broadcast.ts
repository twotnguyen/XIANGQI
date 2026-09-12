/**
 * Realtime match event broadcaster.
 * Dispatches match snapshot updates to subscribers.
 * Non-blocking, safe to call outside transactions.
 */
import type { MatchSnapshot } from '@xiangqi/contracts';

type Listener = (snapshot: MatchSnapshot) => void;

class MatchBroadcaster {
  private listeners = new Map<string, Set<Listener>>();

  subscribe(matchId: string, listener: Listener): () => void {
    let set = this.listeners.get(matchId);
    if (!set) {
      set = new Set();
      this.listeners.set(matchId, set);
    }
    set.add(listener);

    return () => {
      set?.delete(listener);
      if (set?.size === 0) {
        this.listeners.delete(matchId);
      }
    };
  }

  emit(matchId: string, snapshot: MatchSnapshot): void {
    const set = this.listeners.get(matchId);
    if (!set) return;
    for (const listener of set) {
      try {
        listener(snapshot);
      } catch (err) {
        console.error('Broadcaster error:', err);
      }
    }
  }
}

export const matchBroadcaster = new MatchBroadcaster();
