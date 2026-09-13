/**
 * Typed server->client realtime event contract (spec 04 "Socket.IO" table).
 *
 * Domain services emit here AFTER the DB transaction commits. A transport
 * (Socket.IO binding, or an in-process listener in tests) is attached with
 * `setRealtimeTransport`. The default transport is a no-op, so calling emit
 * from a service is always safe.
 *
 * Payload shapes are the sanitized DTOs from `@xiangqi/contracts`; never put
 * JWT, email, invitation codes/tokens, session ids, controller secrets or
 * live AI evaluation into an event payload.
 */
import type { ChatMessageDTO, MatchSnapshot, RoomDTO } from '@xiangqi/contracts';

export type AiJobState = 'IDLE' | 'QUEUED' | 'THINKING' | 'FAILED';
export type ChatChannel = 'PLAYERS' | 'SPECTATORS';

export interface RealtimeEventMap {
  /** Room DTO changed (membership, ready, settings, lifecycle). */
  'room:updated': { roomId: string; room: RoomDTO };
  /** Authorized match snapshot push. */
  'match:state': { matchId: string; snapshot: MatchSnapshot };
  /** AI job status for the human participant; independent of match.version. */
  'ai:status': {
    matchId: string;
    jobId: string | null;
    jobVersion: number;
    state: AiJobState;
  };
  /** Chat message for one authorized channel only. */
  'chat:message': {
    roomId: string;
    matchId: string | null;
    channel: ChatChannel;
    message: ChatMessageDTO;
  };
  /** Presence transition, scoped to a room when applicable. */
  'presence:changed': { userId: string; online: boolean; roomId?: string };
  /** Room access revoked (locked room, room close, viewer expiry). */
  'access:revoked': {
    roomId: string;
    reason: string;
    roomVersion: number;
    userIds: string[];
  };
  /** Older controller tab must stop mutating. */
  'control:revoked': {
    userId: string;
    roomId: string | null;
    matchId: string | null;
    controlEpoch: number;
  };
  /** Invitation delivered to its recipient only (no secret token). */
  'invitation:received': {
    userId: string;
    invitationId: string;
    roomId: string;
    roomName: string;
    role: 'PLAYER' | 'SPECTATOR';
    expiresAtMs: number;
  };
  /** Media policy state for a room's authorized members. */
  'media:policy': {
    matchId: string;
    roomId: string | null;
    policy: Record<string, unknown>;
  };
}

export type RealtimeEventName = keyof RealtimeEventMap;

export interface RealtimeTransport {
  publish<E extends RealtimeEventName>(event: E, payload: RealtimeEventMap[E]): void;
}

const noopTransport: RealtimeTransport = { publish: () => {} };

let transport: RealtimeTransport = noopTransport;
const listeners = new Set<RealtimeTransport>();

/** Attach the active transport (called once by the Socket.IO binding). */
export function setRealtimeTransport(next: RealtimeTransport | null): void {
  transport = next ?? noopTransport;
}

/**
 * Register an in-process listener (tests and the socket binding).
 * Returns an unsubscribe function.
 */
export function onRealtimeEvent(listener: RealtimeTransport): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Emit one event to the transport and every in-process listener. */
export function emitRealtimeEvent<E extends RealtimeEventName>(
  event: E,
  payload: RealtimeEventMap[E],
): void {
  for (const listener of listeners) {
    try {
      listener.publish(event, payload);
    } catch (err) {
      console.error(`Realtime listener error for ${event}:`, err);
    }
  }
  try {
    transport.publish(event, payload);
  } catch (err) {
    // Broadcast failure never rolls back committed state: clients resync.
    console.error(`Realtime transport error for ${event}:`, err);
  }
}

export const emitRoomUpdated = (payload: RealtimeEventMap['room:updated']): void =>
  emitRealtimeEvent('room:updated', payload);
export const emitMatchState = (payload: RealtimeEventMap['match:state']): void =>
  emitRealtimeEvent('match:state', payload);
export const emitAiStatus = (payload: RealtimeEventMap['ai:status']): void =>
  emitRealtimeEvent('ai:status', payload);
export const emitChatMessage = (payload: RealtimeEventMap['chat:message']): void =>
  emitRealtimeEvent('chat:message', payload);
export const emitPresenceChanged = (payload: RealtimeEventMap['presence:changed']): void =>
  emitRealtimeEvent('presence:changed', payload);
export const emitAccessRevoked = (payload: RealtimeEventMap['access:revoked']): void =>
  emitRealtimeEvent('access:revoked', payload);
export const emitControlRevoked = (payload: RealtimeEventMap['control:revoked']): void =>
  emitRealtimeEvent('control:revoked', payload);
export const emitInvitationReceived = (payload: RealtimeEventMap['invitation:received']): void =>
  emitRealtimeEvent('invitation:received', payload);
export const emitMediaPolicy = (payload: RealtimeEventMap['media:policy']): void =>
  emitRealtimeEvent('media:policy', payload);
