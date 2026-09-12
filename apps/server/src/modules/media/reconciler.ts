/**
 * Media Reconciler.
 * Handles generation rotation and LiveKit SFU room deletion.
 */
import { RoomServiceClient } from 'livekit-server-sdk';

const LIVEKIT_HOST = process.env['LIVEKIT_URL'] ?? 'http://127.0.0.1:7880';
const LIVEKIT_API_KEY = process.env['LIVEKIT_API_KEY'] ?? 'devkey';
const LIVEKIT_API_SECRET = process.env['LIVEKIT_API_SECRET'] ?? 'secret';

const roomService = new RoomServiceClient(LIVEKIT_HOST, LIVEKIT_API_KEY, LIVEKIT_API_SECRET);

// In-memory room generation counter: Map<roomId, currentGeneration>
const roomGenerations = new Map<string, number>();

export function getRoomGeneration(roomId: string): number {
  return roomGenerations.get(roomId) ?? 1;
}

/**
 * Rotate room generation when spectators are evicted, room is locked, or match ends.
 * Deletes the old room on the LiveKit SFU to kick stale tokens.
 */
export async function rotateRoomGeneration(roomId: string): Promise<number> {
  const currentGen = getRoomGeneration(roomId);
  const nextGen = currentGen + 1;
  roomGenerations.set(roomId, nextGen);

  const oldRoomName = `${roomId}:gen_${currentGen}`;
  const oldWatchName = `${oldRoomName}:watch`;

  try {
    // Delete old rooms from SFU with ACK
    await Promise.allSettled([
      roomService.deleteRoom(oldRoomName),
      roomService.deleteRoom(oldWatchName),
    ]);
  } catch (err) {
    console.warn(`SFU deleteRoom error for ${oldRoomName}:`, err);
  }

  return nextGen;
}
