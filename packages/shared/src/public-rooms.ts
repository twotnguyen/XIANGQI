export interface PublicRoomView {
  roomId: string;
  name: string;
  host: { displayName: string; isGuest: boolean };
  timeMinutes: number;
  status: "waiting" | "playing";
  spectators: number;
  viewerLimit: number;
  emptySeats: number;
  canPlay: boolean;
  canWatch: boolean;
  publicOpenedAt: string | null;
}
export type PublicRoomAuthProof =
  | { kind: "member"; accessToken: string; appSession: string }
  | { kind: "guest"; guestCapability: string };
