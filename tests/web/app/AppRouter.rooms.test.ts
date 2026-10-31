// @vitest-environment jsdom
// Helper first: its vi.mock calls must register before AppRouter loads.
import {
  useAppRouterHooks,
  mock,
  feedRooms,
  member,
  room,
  reply,
} from "./AppRouter.test-helper.js";
import { createElement, StrictMode } from "react";
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { AppRouter } from "@web/app/AppRouter.js";
import { navigate } from "@web/shared/navigation/navigation.js";

useAppRouterHooks();
it("creates through the authorized form then enters the actual server room route", async () => {
  mock.state = member;
  window.history.replaceState(null, "", "/lobby");
  const roomId = "11111111-1111-4111-8111-111111111111";
  mock.authorizedFetch.mockImplementation(async (path: string) =>
    path === "/rooms"
      ? reply({ roomId, version: 1, role: "red", inviteCode: "12345678" })
      : reply([]),
  );
  render(createElement(AppRouter));
  await vi.waitFor(() =>
    expect(screen.getByText("Chưa có phòng công khai")).toBeTruthy(),
  );
  fireEvent.click(screen.getByRole("button", { name: "Tạo phòng" }));
  expect(screen.getByRole("dialog")).toBeTruthy();
  // The create form is a lazy chunk; wait for it instead of relying on an earlier test having loaded it.
  fireEvent.click(
    await within(screen.getByRole("dialog")).findByRole("radio", {
      name: "15 phút",
    }),
  );
  fireEvent.change(
    within(screen.getByRole("dialog")).getByLabelText("Người xem"),
    { target: { value: "2" } },
  );
  fireEvent.change(
    within(screen.getByRole("dialog")).getByLabelText("Quyền truy cập"),
    { target: { value: "PUBLIC" } },
  );
  fireEvent.click(
    within(screen.getByRole("dialog")).getByRole("button", {
      name: "Tạo phòng",
    }),
  );
  await vi.waitFor(() =>
    expect(window.location.pathname).toBe(`/rooms/${roomId}`),
  );
  const create = mock.authorizedFetch.mock.calls.find(
    (call) => call[0] === "/rooms",
  );
  expect(JSON.parse(create![1].body)).toEqual({
    commandId: expect.stringMatching(/^[0-9a-f-]{36}$/),
    timeMinutes: 15,
    viewerLimit: 2,
    visibility: "PUBLIC",
  });
  expect(
    await screen.findByRole("heading", { name: "Phòng chờ " + roomId }),
  ).toBeTruthy();
  fireEvent.click(screen.getByText("Server closed fixture"));
  await vi.waitFor(() => expect(window.location.pathname).toBe("/lobby"));
  expect(screen.getByText("Phòng đã đóng")).toBeTruthy();
});

it("automatically joins the valid invitation once after login without another submit", async () => {
  const roomId = "12345678-1234-4234-8234-123456789abc";
  window.history.replaceState(null, "", "/rooms/join?token=12345678");
  mock.accept.mockImplementation(() => {
    mock.state = member;
  });
  mock.authorizedFetch.mockResolvedValue(
    reply({ roomId, version: 2, role: "black", inviteCode: "12345678" }),
  );
  render(createElement(AppRouter));
  await vi.waitFor(() => expect(window.location.pathname).toBe("/login"));
  expect(mock.authorizedFetch).not.toHaveBeenCalled();
  fireEvent.click(await screen.findByText("Hoàn tất đăng nhập"));
  await vi.waitFor(() =>
    expect(window.location.pathname).toBe(`/rooms/${roomId}`),
  );
  expect(mock.authorizedFetch).toHaveBeenCalledOnce();
  const [url, options] = mock.authorizedFetch.mock.calls[0]!;
  expect(url).toBe("/rooms/join");
  expect(options.method).toBe("POST");
  expect(JSON.parse(options.body)).toEqual({
    code: "12345678",
    preference: "auto",
    commandId: expect.stringMatching(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
    ),
  });
});

it("uses the lobby's entered room code without requesting it again", async () => {
  const roomId = "12345678-1234-4234-8234-123456789abc";
  window.history.replaceState(null, "", "/lobby");
  mock.state = member;
  mock.authorizedFetch.mockImplementation(async (url: string) =>
    reply(
      url === "/rooms/join"
        ? { roomId, version: 2, role: "black", inviteCode: "12345678" }
        : [],
    ),
  );
  render(createElement(AppRouter));
  fireEvent.change(screen.getByRole("textbox", { name: "Mã phòng" }), {
    target: { value: "12345678" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Vào phòng" }));
  await vi.waitFor(() =>
    expect(window.location.pathname).toBe(`/rooms/${roomId}`),
  );
  const joins = mock.authorizedFetch.mock.calls.filter(
    ([url]) => url === "/rooms/join",
  );
  expect(joins).toHaveLength(1);
  expect(JSON.parse(joins[0]![1].body)).toMatchObject({
    code: "12345678",
    preference: "auto",
  });
});

it("requires a validated feed before allowing admission and wraps only the member proof", async () => {
  mock.state = member;
  window.history.replaceState(null, "", "/lobby");
  mock.authorizedFetch.mockResolvedValue(reply([room]));
  render(createElement(AppRouter));
  await vi.waitFor(() => expect(screen.getByText(room.name)).toBeTruthy());
  expect(
    screen
      .getByRole("button", { name: "Vào chơi" })
      .getAttribute("aria-disabled"),
  ).toBe("true");
  await vi.waitFor(() =>
    expect(mock.sockets[0]!.auth).toEqual({
      kind: "member",
      accessToken: "synthetic-bearer",
      appSession: "a".repeat(43),
    }),
  );
  act(() => mock.sockets[0]!.handlers.get("connect")?.());
  expect(
    screen
      .getByRole("button", { name: "Vào xem" })
      .getAttribute("aria-disabled"),
  ).toBe("true");
  feedRooms([room]);
  expect(
    screen
      .getByRole("button", { name: "Vào chơi" })
      .getAttribute("aria-disabled"),
  ).toBe("false");
});
it("never lets stale HTTP restore a room removed by the newer feed", async () => {
  mock.state = member;
  window.history.replaceState(null, "", "/lobby");
  let done!: (r: Response) => void;
  mock.authorizedFetch.mockImplementationOnce(
    () =>
      new Promise<Response>((r) => {
        done = r;
      }),
  );
  render(createElement(AppRouter));
  await vi.waitFor(() => expect(mock.authorizedFetch).toHaveBeenCalledOnce());
  feedRooms([room]);
  expect(screen.getByText(room.name)).toBeTruthy();
  feedRooms([]);
  await act(async () => done(reply([room])));
  expect(screen.queryByText(room.name)).toBeNull();
  expect(screen.getByText("Chưa có phòng công khai")).toBeTruthy();
});
it("waits for join ACK, blocks a double join and carries the canonical fallback notice", async () => {
  mock.state = member;
  window.history.replaceState(null, "", "/lobby");
  mock.authorizedFetch.mockResolvedValue(reply([room]));
  render(createElement(AppRouter));
  await vi.waitFor(() => expect(mock.authorizedFetch).toHaveBeenCalledOnce());
  feedRooms([room]);
  let done!: (r: Response) => void;
  mock.authorizedFetch.mockImplementationOnce(
    () =>
      new Promise<Response>((r) => {
        done = r;
      }),
  );
  const play = screen.getByRole("button", { name: "Vào chơi" });
  fireEvent.click(play);
  fireEvent.click(play);
  expect(window.location.pathname).toBe("/lobby");
  expect(
    mock.authorizedFetch.mock.calls.filter(([url]) =>
      String(url).endsWith("/join"),
    ),
  ).toHaveLength(1);
  await act(async () =>
    done(
      reply({
        roomId: room.roomId,
        version: 2,
        role: "spectator",
        notice: "Ghế vừa có người, bạn đang xem trận",
      }),
    ),
  );
  expect(window.location.pathname).toBe("/rooms/" + room.roomId);
  expect(screen.getByText("Ghế vừa có người, bạn đang xem trận")).toBeTruthy();
});
it.each(["disconnect", "error", "unmount"])(
  "fences a pending join ACK after %s",
  async (reason) => {
    mock.state = member;
    window.history.replaceState(null, "", "/lobby");
    mock.authorizedFetch.mockResolvedValue(reply([room]));
    render(createElement(AppRouter));
    await vi.waitFor(() => expect(mock.authorizedFetch).toHaveBeenCalledOnce());
    feedRooms([room]);
    let done!: (r: Response) => void;
    mock.authorizedFetch.mockImplementationOnce(
      () =>
        new Promise<Response>((r) => {
          done = r;
        }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Vào xem" }));
    if (reason === "unmount") act(() => navigate("/friends"));
    else
      act(() =>
        mock.sockets[0]!.handlers.get(
          reason === "error" ? "public.error" : "disconnect",
        )?.({ code: "PUBLIC_ROOMS_UNAVAILABLE", message: "PRIVATE_SECRET" }),
      );
    await act(async () =>
      done(reply({ roomId: room.roomId, version: 2, role: "spectator" })),
    );
    expect(window.location.pathname).toBe(
      reason === "unmount" ? "/friends" : "/lobby",
    );
    expect(screen.queryByText("PRIVATE_SECRET")).toBeNull();
  },
);
it("refreshes once after a private-room join failure without retrying the POST or leaking its error", async () => {
  mock.state = member;
  window.history.replaceState(null, "", "/lobby");
  mock.authorizedFetch.mockResolvedValue(reply([room]));
  render(createElement(AppRouter));
  await vi.waitFor(() => expect(mock.authorizedFetch).toHaveBeenCalledOnce());
  feedRooms([room]);
  mock.authorizedFetch
    .mockResolvedValueOnce(
      reply({ code: "ROOM_NOT_PUBLIC", message: "PRIVATE_SECRET" }, 409),
    )
    .mockResolvedValueOnce(reply([]));
  fireEvent.click(screen.getByRole("button", { name: "Vào chơi" }));
  await vi.waitFor(() =>
    expect(
      mock.authorizedFetch.mock.calls.filter(
        ([url]) => url === "/public-rooms",
      ),
    ).toHaveLength(2),
  );
  expect(window.location.pathname).toBe("/lobby");
  expect(
    mock.authorizedFetch.mock.calls.filter(([url]) =>
      String(url).endsWith("/join"),
    ),
  ).toHaveLength(1);
  expect(screen.queryByText("PRIVATE_SECRET")).toBeNull();
  expect(screen.queryByText(room.name)).toBeNull();
});

it("keeps admission disabled across reconnect until a fresh snapshot and rejects the previous join ACK", async () => {
  mock.state = member;
  window.history.replaceState(null, "", "/lobby");
  mock.authorizedFetch.mockResolvedValue(reply([room]));
  render(createElement(AppRouter));
  await vi.waitFor(() => expect(mock.authorizedFetch).toHaveBeenCalledOnce());
  feedRooms([room]);
  let done!: (r: Response) => void;
  mock.authorizedFetch.mockImplementationOnce(
    () =>
      new Promise<Response>((r) => {
        done = r;
      }),
  );
  fireEvent.click(screen.getByRole("button", { name: "Vào chơi" }));
  act(() => {
    mock.sockets[0]!.handlers.get("disconnect")?.();
    mock.sockets[0]!.handlers.get("connect")?.();
  });
  expect(
    screen
      .getByRole("button", { name: "Vào xem" })
      .getAttribute("aria-disabled"),
  ).toBe("true");
  feedRooms([room]);
  await act(async () =>
    done(reply({ roomId: room.roomId, version: 2, role: "black" })),
  );
  expect(window.location.pathname).toBe("/lobby");
  expect(
    screen
      .getByRole("button", { name: "Vào xem" })
      .getAttribute("aria-disabled"),
  ).toBe("false");
});
it("maps canonical canPlay=false even when the presentation has an empty seat", async () => {
  mock.state = member;
  window.history.replaceState(null, "", "/lobby");
  mock.authorizedFetch.mockResolvedValue(reply([room]));
  render(createElement(AppRouter));
  feedRooms([{ ...room, canPlay: false }]);
  expect(screen.queryByRole("button", { name: "Vào chơi" })).toBeNull();
  expect(
    screen
      .getByRole("button", { name: "Vào xem" })
      .getAttribute("aria-disabled"),
  ).toBe("false");
});
it("ignores a stale HTTP error after a valid live snapshot", async () => {
  mock.state = member;
  window.history.replaceState(null, "", "/lobby");
  let reject!: (error: Error) => void;
  mock.authorizedFetch.mockImplementationOnce(
    () =>
      new Promise<Response>((_, no) => {
        reject = no;
      }),
  );
  render(createElement(AppRouter));
  await vi.waitFor(() => expect(mock.authorizedFetch).toHaveBeenCalledOnce());
  feedRooms([room]);
  await act(async () => reject(Error("PRIVATE_UPSTREAM")));
  expect(screen.getByText(room.name)).toBeTruthy();
  expect(screen.queryByRole("alert")).toBeNull();
  expect(
    screen
      .getByRole("button", { name: "Vào chơi" })
      .getAttribute("aria-disabled"),
  ).toBe("false");
});

it("skips StrictMode's discarded HTTP request and fences stale HTTP behind the newest live snapshot", async () => {
  mock.state = member;
  window.history.replaceState(null, "", "/lobby");
  const done: ((response: Response) => void)[] = [];
  mock.authorizedFetch.mockImplementation(
    () => new Promise<Response>((resolve) => done.push(resolve)),
  );
  render(createElement(StrictMode, null, createElement(AppRouter)));
  expect(mock.sockets).toHaveLength(2);
  expect(mock.sockets[0]!.closed).toBe(true);
  expect(mock.sockets[1]!.closed).toBe(false);
  await vi.waitFor(() => expect(mock.authorizedFetch).toHaveBeenCalledOnce());
  feedRooms([]);
  await act(async () => {
    for (const resolve of done) resolve(reply([room]));
  });
  expect(screen.queryByText(room.name)).toBeNull();
  expect(screen.getByText("Chưa có phòng công khai")).toBeTruthy();
  expect(mock.sockets[0]!.auth).toBeUndefined();
});
it("trusts a committed join ACK when a same-connection feed update removes the discovery row", async () => {
  mock.state = member;
  window.history.replaceState(null, "", "/lobby");
  mock.authorizedFetch.mockResolvedValue(reply([room]));
  render(createElement(AppRouter));
  await vi.waitFor(() => expect(mock.authorizedFetch).toHaveBeenCalledOnce());
  feedRooms([room]);
  let done!: (response: Response) => void;
  mock.authorizedFetch.mockImplementationOnce(
    () =>
      new Promise<Response>((resolve) => {
        done = resolve;
      }),
  );
  fireEvent.click(screen.getByRole("button", { name: "Vào chơi" }));
  act(() =>
    mock.sockets[0]!.handlers.get("public.rooms")?.({
      rooms: [],
      serverNow: "2026-10-11T01:00:01Z",
    }),
  );
  await act(async () =>
    done(reply({ roomId: room.roomId, version: 2, role: "black" })),
  );
  expect(window.location.pathname).toBe("/rooms/" + room.roomId);
});
