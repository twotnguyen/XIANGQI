import { expect, it, vi } from "vitest";
import type { RoomControlProof } from "@xiangqi/shared";
import { createRoomClient } from "@web/features/rooms/room-client.js";
import { roomId, snapshot } from "./room-socket.test-helper.js";
const proof: RoomControlProof = {
  tabId: roomId,
  connectionId: "physical-socket",
  generation: 9,
};
const targetId = "22222222-2222-4222-8222-222222222222";
type Client = ReturnType<typeof createRoomClient>;
const commands: [string, (client: Client) => Promise<unknown>][] = [
  ["visibility", (c) => c.changeVisibility(roomId, 4, "PUBLIC", proof)],
  ["switch-seat", (c) => c.switchSeat(roomId, 4, proof)],
  ["to-spectator", (c) => c.toSpectator(roomId, 4, proof)],
  ["move-to-spectator", (c) => c.moveToSpectator(roomId, 4, targetId, proof)],
  ["invite-down", (c) => c.inviteDown(roomId, 4, targetId, proof)],
  ["respond-down", (c) => c.respondDown(roomId, 4, true, proof)],
  ["kick", (c) => c.kickViewer(roomId, 4, targetId, proof)],
  ["leave", (c) => c.leave(roomId, 4, proof)],
  ["swap-propose", (c) => c.proposeSwap(roomId, 4, proof)],
  ["swap-withdraw", (c) => c.withdrawSwap(roomId, 4, proof)],
  ["swap-respond", (c) => c.respondSwap(roomId, 4, true, proof)],
  ["rematch-propose", (c) => c.proposeRematch(roomId, 4, "KEEP", proof)],
  ["rematch-respond", (c) => c.respondRematch(roomId, 4, true, proof)],
];
it.each(commands)(
  "sends physical room control with %s rather than only a session",
  async (action, invoke) => {
    const authorizedFetch = vi.fn<
      (path: string, options?: RequestInit) => Promise<Response>
    >(
      async () =>
        new Response(
          JSON.stringify(
            action === "leave" ? { roomId, left: true } : snapshot(),
          ),
          { status: 200 },
        ),
    );
    await invoke(createRoomClient(authorizedFetch));
    expect(authorizedFetch).toHaveBeenCalledOnce();
    const [path, init] = authorizedFetch.mock.calls[0]!;
    expect(path).toBe(`/rooms/${roomId}/${action}`);
    expect(JSON.parse(init!.body as string)).toMatchObject({
      expectedVersion: 4,
      control: proof,
    });
  },
);
it("refuses a controller mutation before any network request when control is absent", async () => {
  const authorizedFetch = vi.fn();
  const client = createRoomClient(authorizedFetch);
  await expect(
    Reflect.apply(client.switchSeat, undefined, [roomId, 4]),
  ).rejects.toMatchObject({ code: "ROOM_TAB_READ_ONLY" });
  expect(authorizedFetch).not.toHaveBeenCalled();
});
