import type { RoomSnapshot } from "@xiangqi/shared";

/** A nonterminal MOVE increments room and match versions once; gaps may hide a scope change. */
export function isSingleMove(
  prior: RoomSnapshot | null,
  next: RoomSnapshot,
): boolean {
  return Boolean(
    prior &&
    prior.roomId === next.roomId &&
    prior.role === next.role &&
    prior.control.mode === next.control.mode &&
    prior.control.generation === next.control.generation &&
    prior.control.reason === next.control.reason &&
    prior.room.seats.red === next.room.seats.red &&
    prior.room.seats.black === next.room.seats.black &&
    prior.room.status === "PLAYING" &&
    next.room.status === "PLAYING" &&
    next.version === prior.version + 1 &&
    prior.match?.status === "ACTIVE" &&
    next.match?.status === "ACTIVE" &&
    prior.match.id === next.match.id &&
    next.match.version === prior.match.version + 1 &&
    next.match.lastMove?.eventVersion === next.match.version,
  );
}
