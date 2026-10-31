// @vitest-environment jsdom
import { expect, it, vi } from "vitest";
import { fixture, observer, snapshot } from "./room-socket.test-helper.js";

it("enables demo when a waiting room starts on the same physical socket and ignores an older grant", async () => {
  const pending: ((error: Error | null, value: unknown) => void)[] = [];
  fixture.emit.mockImplementation((event, _payload, acknowledge) => {
    if (event === "demo.capability") pending.push(acknowledge);
  });
  const onDemoCapability = vi.fn();
  const { peer } = observer(onDemoCapability);
  const active = snapshot();
  fixture.handlers.get("room.snapshot")?.({
    ...active,
    match: null,
    clocks: null,
    room: { ...active.room, status: "WAITING" },
  });
  fixture.handlers.get("room.snapshot")?.({
    ...active,
    version: active.version + 1,
  });
  pending[1]!(null, { enabled: true });
  await Promise.resolve();
  await vi.waitFor(() =>
    expect(onDemoCapability).toHaveBeenLastCalledWith(true),
  );
  pending[0]!(null, { enabled: false });
  await Promise.resolve();
  expect(onDemoCapability).toHaveBeenCalledExactlyOnceWith(true);
  peer.close();
});
