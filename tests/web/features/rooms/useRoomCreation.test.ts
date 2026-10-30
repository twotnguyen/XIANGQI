// @vitest-environment jsdom
import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { useRoomCreation } from "@web/features/rooms/useRoomCreation.js";
import {
  RoomRequestError,
  type RoomClient,
  type RoomEntry,
} from "@web/features/rooms/room-client.js";

afterEach(cleanup);
const input = {
  timeMinutes: 10 as const,
  viewerLimit: 5,
  visibility: "CODE_ONLY" as const,
};
const entry: RoomEntry = {
  roomId: "11111111-1111-4111-8111-111111111111",
  version: 1,
  role: "red",
};
function client(create = vi.fn().mockResolvedValue(entry)) {
  return { client: { create } as unknown as RoomClient, create };
}

it("recovers an uncertain creation with the same command and original choices", async () => {
  const api = client(
    vi
      .fn()
      .mockRejectedValueOnce(new TypeError("network"))
      .mockResolvedValue(entry),
  );
  const onCreated = vi.fn();
  const hook = renderHook(() => useRoomCreation(api.client, onCreated));
  await act(async () => {
    await expect(hook.result.current.create(input)).rejects.toThrow("network");
  });
  expect(hook.result.current.recoveryInput).toEqual(input);
  expect(onCreated).not.toHaveBeenCalled();
  await act(async () => {
    await hook.result.current.create({ ...input, viewerLimit: 0 });
  });
  expect(api.create.mock.calls[1]).toEqual(api.create.mock.calls[0]);
  expect(onCreated).toHaveBeenCalledExactlyOnceWith(entry);
  expect(hook.result.current.recoveryInput).toBeNull();
});

it("allows changed choices and a new command after a definitive rejection", async () => {
  const api = client(
    vi
      .fn()
      .mockRejectedValueOnce(new RoomRequestError("ROOM_UNAVAILABLE", 400))
      .mockResolvedValue(entry),
  );
  const hook = renderHook(() => useRoomCreation(api.client, vi.fn()));
  await act(async () => {
    await expect(hook.result.current.create(input)).rejects.toThrow();
  });
  expect(hook.result.current.recoveryInput).toBeNull();
  await act(async () => {
    await hook.result.current.create({ ...input, viewerLimit: 0 });
  });
  expect(api.create.mock.calls[1]![0].viewerLimit).toBe(0);
  expect(api.create.mock.calls[1]![1]).not.toBe(api.create.mock.calls[0]![1]);
});

it.each([408, 503])(
  "retains the command when HTTP %i does not establish a definitive result",
  async (status) => {
    const api = client(
      vi
        .fn()
        .mockRejectedValueOnce(new RoomRequestError("ROOM_UNAVAILABLE", status))
        .mockResolvedValue(entry),
    );
    const hook = renderHook(() => useRoomCreation(api.client, vi.fn()));
    await act(async () => {
      await expect(hook.result.current.create(input)).rejects.toThrow();
    });
    await act(async () => {
      await hook.result.current.create(input);
    });
    expect(api.create.mock.calls[1]).toEqual(api.create.mock.calls[0]);
  },
);

it("blocks duplicate submits and ignores a result after the client scope changes", async () => {
  let resolve!: (value: RoomEntry) => void;
  const first = client(
    vi.fn(
      () =>
        new Promise<RoomEntry>((done) => {
          resolve = done;
        }),
    ),
  );
  const second = client();
  const onCreated = vi.fn();
  const hook = renderHook(({ api }) => useRoomCreation(api, onCreated), {
    initialProps: { api: first.client },
  });
  let pending!: Promise<void>;
  act(() => {
    pending = hook.result.current.create(input);
  });
  expect(hook.result.current.creating).toBe(true);
  await act(async () => {
    await hook.result.current.create(input);
  });
  expect(first.create).toHaveBeenCalledOnce();
  hook.rerender({ api: second.client });
  await act(async () => {
    resolve(entry);
    await pending;
  });
  expect(onCreated).not.toHaveBeenCalled();
  expect(hook.result.current.creating).toBe(false);
  await act(async () => {
    await hook.result.current.create(input);
  });
  expect(second.create).toHaveBeenCalledOnce();
  expect(onCreated).toHaveBeenCalledExactlyOnceWith(entry);
});

it.each([401, 429])(
  "keeps an uncertain original command when a retry encounters HTTP %i before receipt lookup",
  async (status) => {
    const api = client(
      vi
        .fn()
        .mockRejectedValueOnce(new TypeError("network"))
        .mockRejectedValueOnce(new RoomRequestError("ROOM_UNAVAILABLE", status))
        .mockResolvedValue(entry),
    );
    const onCreated = vi.fn();
    const hook = renderHook(() => useRoomCreation(api.client, onCreated));
    await act(async () => {
      await expect(hook.result.current.create(input)).rejects.toThrow();
    });
    await act(async () => {
      await expect(hook.result.current.create(input)).rejects.toThrow();
    });
    expect(hook.result.current.recoveryInput).toEqual(input);
    await act(async () => {
      await hook.result.current.create(input);
    });
    expect(api.create.mock.calls[1]).toEqual(api.create.mock.calls[0]);
    expect(api.create.mock.calls[2]).toEqual(api.create.mock.calls[0]);
    expect(onCreated).toHaveBeenCalledExactlyOnceWith(entry);
  },
);
