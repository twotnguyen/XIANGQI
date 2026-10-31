// @vitest-environment jsdom
import { createElement } from "react";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import {
  initialPosition,
  legalMoves,
  playMove,
  serializePosition,
} from "@xiangqi/xiangqi-core";
import { AiGamePage } from "@web/features/ai/AiGamePage.js";
import type { AiGameSnapshot } from "@web/features/ai/AiGame.js";

type FakeFetchRoute = (
  method: string,
  path: string,
  body: unknown,
) => Promise<Response>;

const socket = vi.hoisted(() => ({
  onControl: null as null | ((c: unknown) => void),
  onSnapshot: null as null | ((r: unknown) => void),
  onConnection: null as null | ((ready: boolean) => void),
  disconnect: vi.fn(),
  takeover: vi.fn(async () => undefined),
}));

// Feature-layer socket boundary: tests push control/snapshot events directly.
vi.mock("@web/features/ai/ai-socket-client.js", () => ({
  connectAi: (handlers: {
    onControl: (c: unknown) => void;
    onSnapshot: (r: unknown) => void;
    onConnection: (ready: boolean) => void;
  }) => {
    socket.onControl = handlers.onControl;
    socket.onSnapshot = handlers.onSnapshot;
    socket.onConnection = handlers.onConnection;
    return {
      watch: async () => undefined,
      getControl: async () => ({
        tabId: "33333333-3333-4333-8333-333333333333",
        connectionId: "fixture-socket",
        generation: 1,
      }),
      refresh: async () => undefined,
      takeover: socket.takeover,
      disconnect: socket.disconnect,
    };
  },
}));
vi.mock("@web/features/rooms/game-audio.js", () => ({
  createGameAudio: () => ({ unlock: () => undefined }),
}));

const id = "11111111-1111-4111-8111-111111111111";
const replacement = "22222222-2222-4222-8222-222222222222";
const fen = serializePosition(initialPosition());
// Real two-ply line from the start (red moves, black replies), red to move again.
// AiGame enables undo only when an earlier history entry had the human to move.
const start = initialPosition();
const afterRed = playMove(start, legalMoves(start)[0]!);
const afterBlack = playMove(afterRed, legalMoves(afterRed)[0]!);
const midHistory = [start, afterRed, afterBlack].map(serializePosition);
const proof = async () => ({
  kind: "member" as const,
  accessToken: "synthetic-bearer",
  appSession: "a".repeat(43),
});

function snapshot(patch: Partial<AiGameSnapshot> = {}): AiGameSnapshot {
  return {
    id,
    requestedSide: "red",
    actualSide: "red",
    level: "easy",
    position: fen,
    history: [fen],
    version: 0,
    undoUsed: 0,
    status: "ACTIVE",
    engineState: "IDLE",
    engineError: null,
    outcome: null,
    ...patch,
  };
}
const envelope = (
  snap: AiGameSnapshot,
  mode: "controller" | "readonly" = "controller",
) => ({
  snapshot: snap,
  serverNow: "2026-10-11T00:00:00Z",
  control: {
    mode,
    reason: mode === "readonly" ? "other_tab" : null,
    generation: 1,
  },
});
// Mid-game ACTIVE snapshot: the human (red) is to move and has one own ply to undo.
const midGame = (patch: Partial<AiGameSnapshot> = {}) =>
  snapshot({
    version: 2,
    position: midHistory.at(-1)!,
    history: midHistory,
    ...patch,
  });
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status });

// Resolves a pending reply and returns once the client has read its body, so a
// negative assertion (reply ignored) runs after the response was consumed.
async function answer(
  reply: { resolve: (value: Response) => void },
  body: unknown,
) {
  const response = json(body);
  const parse = response.json.bind(response);
  const read = deferred<void>();
  response.json = async () => {
    const value = await parse();
    read.resolve();
    return value;
  };
  await act(async () => {
    reply.resolve(response);
    await read.promise;
  });
}

// Each test supplies its own HTTP fake; `route` answers by method and path.
function fetchWith(route: FakeFetchRoute) {
  return vi.fn(async (path: string, init?: RequestInit) => {
    const body = init?.body ? JSON.parse(String(init.body)) : undefined;
    return route(init?.method ?? "GET", path, body);
  });
}

function mount(
  authorizedFetch: ReturnType<typeof fetchWith>,
  allowUndo = true,
) {
  return render(
    createElement(AiGamePage, {
      gameId: id,
      authorizedFetch: authorizedFetch as never,
      getProof: proof,
      allowUndo,
    }),
  );
}

// Deferred without Promise.withResolvers (not in the configured ES lib).
function deferred<T>() {
  let resolve!: (value: T | PromiseLike<T>) => void;
  const promise = new Promise<T>((res) => {
    resolve = res;
  });
  return { promise, resolve };
}

const controlFor = (
  mode: "controller" | "readonly",
  generation = 1,
  gameId = id,
) => ({
  tabId: "33333333-3333-4333-8333-333333333333",
  connectionId: "fixture-socket",
  generation,
  mode,
  gameId,
  graceUntil: null,
});
// Socket reports ready first, then delivers the full control shape, as the real client does.
function grantControl(
  mode: "controller" | "readonly" = "controller",
  generation = 1,
  gameId = id,
) {
  act(() => {
    socket.onConnection?.(true);
    socket.onControl?.(controlFor(mode, generation, gameId));
  });
}
const undoCalls = (f: ReturnType<typeof fetchWith>) =>
  f.mock.calls.filter(([p]) => String(p).endsWith("/undo"));

beforeEach(() => {
  vi.clearAllMocks();
  socket.onControl = null;
  socket.onSnapshot = null;
  socket.onConnection = null;
  HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute("open", "");
  };
  HTMLDialogElement.prototype.close = function () {
    this.removeAttribute("open");
  };
  window.history.replaceState(null, "", `/ai/${id}`);
});
afterEach(() => cleanup());

it("shows the loading status until the first authoritative snapshot arrives", () => {
  const pending = deferred<Response>();
  mount(fetchWith(() => pending.promise));
  expect(screen.getByRole("status").textContent).toBe("Đang tải ván với máy…");
});

it("shows the server-side undo count from the snapshot", async () => {
  mount(
    fetchWith(async () =>
      json(envelope(snapshot({ version: 2, undoUsed: 1 }))),
    ),
  );
  expect(await screen.findByText("Lượt đi lại: 2/3")).toBeTruthy();
});

it("hides the P2 undo action and quota for a guest while retaining P1 game controls", async () => {
  const f = fetchWith(async () => json(envelope(midGame())));
  mount(f, false);
  grantControl();
  expect(await screen.findByRole("button", { name: "Đầu hàng" })).toBeTruthy();
  expect(screen.getByRole("button", { name: "Về Sảnh" })).toBeTruthy();
  expect(screen.queryByRole("button", { name: "Đi lại" })).toBeNull();
  expect(screen.queryByText(/Lượt đi lại:/)).toBeNull();
  expect(undoCalls(f)).toHaveLength(0);
});

it("keeps a newer socket snapshot when an older HTTP read resolves later", async () => {
  const read = deferred<Response>();
  mount(fetchWith(() => read.promise));
  act(() => {
    socket.onSnapshot?.(envelope(snapshot({ version: 3, undoUsed: 1 })));
  });
  expect(await screen.findByText("Lượt đi lại: 2/3")).toBeTruthy();
  read.resolve(json(envelope(snapshot({ version: 1, undoUsed: 0 }))));
  await vi.waitFor(() => {
    expect(screen.getByText("Lượt đi lại: 2/3")).toBeTruthy();
  });
});

it("shows the recovery alert when the server reports AI_NOT_FOUND", async () => {
  mount(fetchWith(async () => json({ code: "AI_NOT_FOUND" }, 404)));
  const alert = await screen.findByRole("alert");
  expect(alert.textContent).toContain(
    "Ván này không còn trạng thái để tiếp tục",
  );
  expect(screen.getByRole("button", { name: "Ván mới" })).toBeTruthy();
});

it("shows a connection error when the initial read fails transiently", async () => {
  mount(fetchWith(async () => json({ code: "AI_UNAVAILABLE" }, 503)));
  expect(
    await screen.findByText(
      "Chưa thể kết nối ván với máy. Kiểm tra mạng và thử lại.",
    ),
  ).toBeTruthy();
});

it("blocks takeover while disconnected and permits it after the socket connects", async () => {
  mount(fetchWith(async () => json(envelope(snapshot()))));
  await screen.findByText("Lượt đi lại: 3/3");
  act(() => {
    socket.onControl?.({ mode: "observer", gameId: id, generation: 1 });
  });
  const takeover = await screen.findByRole("button", {
    name: "Chuyển quyền điều khiển về tab này",
  });
  fireEvent.click(takeover);
  expect(socket.takeover).not.toHaveBeenCalled();
  act(() => {
    socket.onConnection?.(true);
  });
  fireEvent.click(takeover);
  await vi.waitFor(() => expect(socket.takeover).toHaveBeenCalledTimes(1));
});

it("sends one undo while a previous undo is still in flight", async () => {
  const undoReply = deferred<Response>();
  const f = fetchWith(async (method, path) => {
    if (method === "GET") return json(envelope(midGame()));
    if (path.endsWith("/undo")) return undoReply.promise;
    return json({ code: "AI_UNAVAILABLE" }, 503);
  });
  mount(f);
  await screen.findByText("Lượt đi lại: 3/3");
  grantControl();
  const undo = await screen.findByRole("button", { name: "Đi lại" });
  fireEvent.click(undo);
  fireEvent.click(undo);
  await vi.waitFor(() => expect(undoCalls(f)).toHaveLength(1));
  // The second click hits the in-flight guard synchronously; no second request is possible.
  expect(undoCalls(f)).toHaveLength(1);
  undoReply.resolve(json(envelope(snapshot({ version: 3, undoUsed: 1 }))));
  expect(await screen.findByText("Lượt đi lại: 2/3")).toBeTruthy();
});

it("navigates to the new game ID when an abandoned game is retried into a replacement", async () => {
  const f = fetchWith(async (method, path) => {
    if (method === "GET")
      return json(
        envelope(snapshot({ status: "ABANDONED", engineState: "RETRY" })),
      );
    if (path.endsWith("/retry"))
      return json(envelope(snapshot({ id: replacement, version: 0 })));
    return json({ code: "AI_UNAVAILABLE" }, 503);
  });
  mount(f);
  grantControl();
  const retry = (await screen.findAllByRole("button", { name: "Thử lại" }))[0]!;
  fireEvent.click(retry);
  await vi.waitFor(() =>
    expect(window.location.pathname).toBe(`/ai/${replacement}`),
  );
  expect(
    f.mock.calls.filter(([p]) => String(p).endsWith("/retry")),
  ).toHaveLength(1);
});

it("retries a transient FINALIZING save on the same game until the exact terminal result lands", async () => {
  const terminal = midGame({
    version: 4,
    status: "FINISHED",
    outcome: { reason: "RESIGN", winner: "black" },
  });
  let saves = 0;
  const f = fetchWith(async (method, path) => {
    if (method === "GET")
      return json(envelope(midGame({ version: 3, status: "FINALIZING" })));
    if (path.endsWith("/retry")) {
      saves++;
      return saves === 1
        ? json({ code: "AI_UNAVAILABLE" }, 503)
        : json(envelope(terminal));
    }
    return json({ code: "AI_UNAVAILABLE" }, 503);
  });
  mount(f);
  await screen.findByText("Đang ghi nhận kết quả…");
  grantControl();
  const save = await screen.findByRole("button", { name: "Thử lưu kết quả" });
  fireEvent.click(save);
  await vi.waitFor(() => expect(saves).toBe(1));
  // Transient failure keeps the same game and leaves the retry available.
  const again = await screen.findByRole("button", { name: "Thử lưu kết quả" });
  expect(window.location.pathname).toBe(`/ai/${id}`);
  fireEvent.click(again);
  expect(await screen.findByText("Bạn thua")).toBeTruthy();
  expect(saves).toBe(2);
  const retries = f.mock.calls.filter(([p]) => String(p).endsWith("/retry"));
  expect(retries.map(([, init]) => JSON.parse(String(init?.body)))).toEqual([
    { version: 3 },
    { version: 3 },
  ]);
  expect(window.location.pathname).toBe(`/ai/${id}`);
});

it("keeps the game when the leave dialog is cancelled and sends no resign", async () => {
  const f = fetchWith(async (method) => {
    if (method === "GET") return json(envelope(midGame()));
    return json({ code: "AI_UNAVAILABLE" }, 503);
  });
  mount(f);
  await screen.findByText("Lượt đi lại: 3/3");
  grantControl();
  fireEvent.click(screen.getByRole("button", { name: "Về Sảnh" }));
  fireEvent.click(await screen.findByRole("button", { name: "Ở lại" }));
  await vi.waitFor(() =>
    expect(screen.queryByRole("button", { name: "Ở lại" })).toBeNull(),
  );
  const resigns = f.mock.calls.filter(
    ([p, init]) => String(p).endsWith("/resign") && init?.method === "POST",
  );
  expect(resigns).toHaveLength(0);
  expect(window.location.pathname).toBe(`/ai/${id}`);
});

it("resigns an active game before leaving to the lobby when confirmed", async () => {
  const f = fetchWith(async (method, path) => {
    if (method === "GET") return json(envelope(midGame()));
    if (path.endsWith("/resign"))
      return json(
        envelope(
          midGame({
            version: 3,
            status: "FINISHED",
            outcome: { reason: "RESIGN", winner: "black" },
          }),
        ),
      );
    return json({ code: "AI_UNAVAILABLE" }, 503);
  });
  mount(f);
  await screen.findByText("Lượt đi lại: 3/3");
  grantControl();
  fireEvent.click(screen.getByRole("button", { name: "Về Sảnh" }));
  fireEvent.click(
    await screen.findByRole("button", { name: "Đầu hàng và rời ván" }),
  );
  await vi.waitFor(() => expect(window.location.pathname).toBe("/lobby"));
  const resigns = f.mock.calls.filter(
    ([p, init]) => String(p).endsWith("/resign") && init?.method === "POST",
  );
  expect(resigns).toHaveLength(1);
});

it("drops an in-flight undo reply after the control generation changes", async () => {
  const undoReply = deferred<Response>();
  const f = fetchWith(async (method, path) => {
    if (method === "GET") return json(envelope(midGame()));
    if (path.endsWith("/undo")) return undoReply.promise;
    return json({ code: "AI_UNAVAILABLE" }, 503);
  });
  mount(f);
  await screen.findByText("Lượt đi lại: 3/3");
  grantControl();
  fireEvent.click(await screen.findByRole("button", { name: "Đi lại" }));
  await vi.waitFor(() => expect(undoCalls(f)).toHaveLength(1));
  grantControl("controller", 2);
  await answer(undoReply, envelope(snapshot({ version: 3, undoUsed: 1 })));
  expect(screen.getByText("Lượt đi lại: 3/3")).toBeTruthy();
});

it("keeps the current snapshot when the connection drops during an in-flight undo", async () => {
  const undoReply = deferred<Response>();
  const f = fetchWith(async (method, path) => {
    if (method === "GET") return json(envelope(midGame()));
    if (path.endsWith("/undo")) return undoReply.promise;
    return json({ code: "AI_UNAVAILABLE" }, 503);
  });
  mount(f);
  await screen.findByText("Lượt đi lại: 3/3");
  grantControl();
  fireEvent.click(await screen.findByRole("button", { name: "Đi lại" }));
  await vi.waitFor(() => expect(undoCalls(f)).toHaveLength(1));
  act(() => {
    socket.onConnection?.(false);
  });
  await answer(undoReply, envelope(snapshot({ version: 3, undoUsed: 1 })));
  expect(screen.getByText("Lượt đi lại: 3/3")).toBeTruthy();
});

it("does not navigate to a replacement game unless this tab still controls the game", async () => {
  const retryReply = deferred<Response>();
  const f = fetchWith(async (method, path) => {
    if (method === "GET")
      return json(
        envelope(snapshot({ status: "ABANDONED", engineState: "RETRY" })),
      );
    if (path.endsWith("/retry")) return retryReply.promise;
    return json({ code: "AI_UNAVAILABLE" }, 503);
  });
  mount(f);
  grantControl();
  const retry = (await screen.findAllByRole("button", { name: "Thử lại" }))[0]!;
  fireEvent.click(retry);
  await vi.waitFor(() =>
    expect(
      f.mock.calls.filter(([p]) => String(p).endsWith("/retry")),
    ).toHaveLength(1),
  );
  await answer(
    retryReply,
    envelope(snapshot({ id: replacement, version: 0 }), "readonly"),
  );
  expect(window.location.pathname).toBe(`/ai/${id}`);
});

it("sends no game request while this tab is read-only", async () => {
  const f = fetchWith(async (method) => {
    if (method === "GET") return json(envelope(midGame()));
    return json({ code: "AI_UNAVAILABLE" }, 503);
  });
  mount(f);
  await screen.findByText("Lượt đi lại: 3/3");
  grantControl("readonly");
  expect(screen.getByText("Tab này chỉ có thể xem.")).toBeTruthy();
  const undo = screen.getByRole("button", { name: "Đi lại" });
  expect(undo.getAttribute("aria-disabled")).toBe("true");
  fireEvent.click(undo);
  fireEvent.click(screen.getByRole("button", { name: "Về Sảnh" }));
  fireEvent.click(
    await screen.findByRole("button", { name: "Đầu hàng và rời ván" }),
  );
  expect(await screen.findByRole("alert")).toBeTruthy();
  // A read-only confirm is rejected synchronously before any request is made.
  const writes = f.mock.calls.filter(([, init]) => init?.method === "POST");
  expect(writes).toHaveLength(0);
  expect(window.location.pathname).toBe(`/ai/${id}`);
});

it("keeps the game and closes the leave dialog when a command is still in flight", async () => {
  const undoReply = deferred<Response>();
  const f = fetchWith(async (method, path) => {
    if (method === "GET") return json(envelope(midGame()));
    if (path.endsWith("/undo")) return undoReply.promise;
    return json({ code: "AI_UNAVAILABLE" }, 503);
  });
  mount(f);
  await screen.findByText("Lượt đi lại: 3/3");
  grantControl();
  fireEvent.click(await screen.findByRole("button", { name: "Đi lại" }));
  await vi.waitFor(() => expect(undoCalls(f)).toHaveLength(1));
  fireEvent.click(screen.getByRole("button", { name: "Về Sảnh" }));
  fireEvent.click(
    await screen.findByRole("button", { name: "Đầu hàng và rời ván" }),
  );
  await vi.waitFor(() =>
    expect(
      screen.queryByRole("button", { name: "Đầu hàng và rời ván" }),
    ).toBeNull(),
  );
  const resigns = f.mock.calls.filter(([p]) => String(p).endsWith("/resign"));
  expect(resigns).toHaveLength(0);
  expect(window.location.pathname).toBe(`/ai/${id}`);
  await answer(undoReply, envelope(snapshot({ version: 3, undoUsed: 1 })));
  expect(window.location.pathname).toBe(`/ai/${id}`);
});
