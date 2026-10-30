// @vitest-environment jsdom
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type {
  MediaToken as Ticket,
  ShareLevel,
} from "@web/features/media/media-client.js";
import {
  cameraButton,
  deferred,
  flush,
  harness,
  leave,
  live,
  panel,
  select,
  serverTicket,
  settle,
  type Boundary,
} from "./MediaPanel.test-helper.js";

describe("media panel joins and receives", () => {
  it.each(["before connect", "after connect"] as const)(
    "receives opponent video and audio %s while both local devices stay off",
    async (timing) => {
      const { client } = harness();
      if (timing === "before connect")
        live.state.connectPlan = () => {
          live.state.instances[0]!.subscribe("video", false);
          live.state.instances[0]!.subscribe("audio", false);
        };
      const view = render(panel(client));
      await settle();
      if (timing === "after connect")
        await act(async () => {
          const room = live.state.instances[0]!;
          const video = room.subscribe("video");
          room.subscribe("audio");
          video.emit();
        });
      await waitFor(() => {
        expect(view.container.querySelectorAll("video")).toHaveLength(1);
        expect(view.container.querySelectorAll("audio")).toHaveLength(1);
      });
      const video = view.container.querySelector("video")!;
      expect(video.muted).toBe(true);
      expect(video.closest("figure")?.getAttribute("aria-label")).toBe(
        "Camera Phe Đen",
      );
      expect(view.container.querySelector("audio")!.muted).toBe(false);
      expect(cameraButton().getAttribute("aria-pressed")).toBe("false");
      expect(
        screen
          .getByRole("button", { name: "Bật mic" })
          .getAttribute("aria-pressed"),
      ).toBe("false");
      expect(live.state.rooms[0]!.camera || live.state.rooms[0]!.mic).toBe(
        false,
      );
    },
  );

  it("subscribes spectators receive-only on the primary room without publishing", async () => {
    const { client } = harness({ role: "spectator", level: "ALL" });
    render(panel(client, { role: "spectator", userId: "viewer" }));
    await waitFor(() => expect(live.state.rooms[0]?.connected).toBe(true));
    const [room] = live.state.rooms;
    expect(client.token).toHaveBeenCalledWith("room", false, false, "tab");
    expect(room!.token).toBe("viewer-token");
    expect(room!.camera || room!.mic).toBe(false);
    expect(room!.tracks).toHaveLength(0);
    expect(screen.queryByRole("button", { name: "Bật camera" })).toBeNull();
    expect(
      screen.getByText("Người xem chỉ nhận hình tiếng", { exact: false }),
    ).toBeTruthy();
  });

  it("lets a player with both devices off receive on the private room", async () => {
    const { client } = harness({ level: "OPPONENT" });
    render(panel(client));
    await waitFor(() => expect(live.state.rooms[0]?.connected).toBe(true));
    expect(client.token).toHaveBeenCalledWith("room", false, false, "tab");
    const [room] = live.state.rooms;
    expect(room!.token).toBe("private-token");
    expect(room!.camera || room!.mic).toBe(false);
    expect(cameraButton().getAttribute("aria-pressed")).toBe("false");
  });

  it("rejoins receive-only after reconnect without enabling devices", async () => {
    const { client } = harness();
    const view = render(panel(client));
    await waitFor(() => expect(live.state.rooms[0]?.connected).toBe(true));
    view.rerender(panel(client, { connected: false }));
    await waitFor(() => expect(live.state.rooms[0]?.disconnected).toBe(true));
    view.rerender(panel(client, { connected: true }));
    await waitFor(() => expect(live.state.rooms).toHaveLength(2));
    await waitFor(() => expect(live.state.rooms[1]?.connected).toBe(true));
    expect(client.token).toHaveBeenNthCalledWith(
      2,
      "room",
      false,
      false,
      "tab",
    );
    expect(live.state.rooms[1]!.camera || live.state.rooms[1]!.mic).toBe(false);
  });

  it("resets a camera that was on when the room changes and rejoins receive-only", async () => {
    const { client } = harness();
    const view = render(panel(client));
    await waitFor(() => expect(live.state.rooms[0]?.connected).toBe(true));
    await settle();
    await userEvent
      .setup()
      .click(screen.getByRole("button", { name: "Bật camera" }));
    await waitFor(() => expect(live.state.rooms[1]?.camera).toBe(true));
    await settle();
    view.rerender(panel(client, { roomId: "room-2" }));
    await waitFor(() => expect(live.state.rooms).toHaveLength(3));
    await waitFor(() => expect(live.state.rooms[2]?.connected).toBe(true));
    expect(client.token).toHaveBeenLastCalledWith(
      "room-2",
      false,
      false,
      "tab",
    );
    expect(live.state.rooms[2]!.camera).toBe(false);
    expect(cameraButton().getAttribute("aria-pressed")).toBe("false");
  });
});

describe("media panel publishing", () => {
  it("publishes only after an explicit click and stays on the private room at OPPONENT", async () => {
    const { client } = harness({ level: "OPPONENT" });
    render(panel(client));
    await waitFor(() => expect(live.state.rooms[0]?.connected).toBe(true));
    await settle();
    await userEvent
      .setup()
      .click(screen.getByRole("button", { name: "Bật camera" }));
    await waitFor(() => expect(live.state.rooms[1]?.camera).toBe(true));
    expect(client.token).toHaveBeenLastCalledWith("room", true, false, "tab");
    expect(live.state.rooms.some((room) => room.token === "stage-token")).toBe(
      false,
    );
    expect(live.state.rooms[0]!.camera).toBe(false);
    expect(await screen.findByText("Đang chia sẻ hình tiếng.")).toBeTruthy();
  });

  it("publishes camera to private and stage rooms when confirmed ALL", async () => {
    const { client } = harness({ level: "ALL" });
    render(panel(client));
    await waitFor(() => expect(live.state.rooms[0]?.connected).toBe(true));
    await settle();
    await userEvent
      .setup()
      .click(screen.getByRole("button", { name: "Bật camera" }));
    await waitFor(() =>
      expect(live.state.rooms.filter((room) => room.camera)).toHaveLength(2),
    );
    const publishing = live.state.rooms.filter((room) => room.camera);
    expect(publishing.map((room) => room.token).sort()).toEqual([
      "private-token",
      "stage-token",
    ]);
  });

  it("keeps an ALL share change working after both devices were toggled off", async () => {
    const { client } = harness();
    render(panel(client));
    await settle();
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Bật camera" }));
    await settle();
    await user.click(screen.getByRole("button", { name: "Tắt camera" }));
    await settle();
    await user.click(screen.getByRole("button", { name: "Bật mic" }));
    await settle();
    await user.selectOptions(select(), "ALL");
    await settle();
    expect(
      live.state.rooms
        .filter((room) => room.connected && room.mic)
        .map((room) => room.token)
        .sort(),
    ).toEqual(["private-token", "stage-token"]);
    expect(select().value).toBe("ALL");
  });

  it("does not reuse publish permission after changing to NONE with devices off", async () => {
    const { client } = harness();
    render(panel(client));
    await settle();
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Bật camera" }));
    await settle();
    await user.click(screen.getByRole("button", { name: "Tắt camera" }));
    await settle();
    await user.selectOptions(select(), "NONE");
    await settle();
    await user.click(screen.getByRole("button", { name: "Bật mic" }));
    await settle();
    expect(live.state.rooms.some((room) => room.camera || room.mic)).toBe(
      false,
    );
  });
});

describe("media panel share failures", () => {
  it.each<ShareLevel>(["NONE", "OPPONENT"])(
    "failed ALL -> %s write stops publishing and never reconnects publicly",
    async (target) => {
      const { client } = harness({
        level: "ALL",
        setShare: async () => {
          throw new Error("offline");
        },
      });
      render(panel(client));
      await waitFor(() => expect(live.state.rooms[0]?.connected).toBe(true));
      const user = userEvent.setup();
      await settle();
      await user.click(screen.getByRole("button", { name: "Bật camera" }));
      await waitFor(() =>
        expect(live.state.rooms.filter((room) => room.camera)).toHaveLength(2),
      );
      const publishing = live.state.rooms.slice(1);
      await settle();
      await user.selectOptions(select(), target);
      expect(client.setShare).toHaveBeenCalledWith("room", target);
      expect(await screen.findByText(/Chưa thể đổi mức chia sẻ/)).toBeTruthy();
      expect(select().value).toBe("ALL");
      expect(screen.getByRole("button", { name: "Bật camera" })).toBeTruthy();
      await waitFor(() =>
        expect(publishing.every((room) => room.disconnected)).toBe(true),
      );
      expect(
        publishing.every((room) => room.tracks.every((t) => t.stopped)),
      ).toBe(true);
      const rejoined = live.state.rooms.slice(3);
      expect(client.token).toHaveBeenLastCalledWith(
        "room",
        false,
        false,
        "tab",
      );
      expect(rejoined.some((room) => room.camera || room.mic)).toBe(false);
      expect(rejoined.some((room) => room.token === "stage-token")).toBe(false);
    },
  );

  it.each<Boundary>(["unmount", "disconnect"])(
    "ignores a share save that resolves after %s and keeps the next confirmed level",
    async (boundary) => {
      const save = deferred<{ level: ShareLevel }>();
      const { client } = harness({ setShare: () => save.promise });
      const view = render(panel(client));
      await waitFor(() => expect(live.state.rooms[0]?.connected).toBe(true));
      await settle();
      await userEvent.setup().selectOptions(select(), "ALL");
      expect(client.setShare).toHaveBeenCalledWith("room", "ALL");
      leave(view, client, boundary);
      save.resolve({ level: "ALL" });
      await flush();
      if (boundary === "disconnect") expect(select().value).toBe("OPPONENT");
    },
  );

  it("does not apply a share save that resolves after the room changed", async () => {
    const save = deferred<{ level: ShareLevel }>();
    const { client } = harness({ setShare: () => save.promise });
    const view = render(panel(client));
    await waitFor(() => expect(live.state.rooms[0]?.connected).toBe(true));
    await settle();
    await userEvent.setup().selectOptions(select(), "ALL");
    view.rerender(panel(client, { roomId: "room-2" }));
    save.resolve({ level: "ALL" });
    await flush();
    expect(select().value).toBe("OPPONENT");
  });
});

describe("media panel lifecycle", () => {
  it.each<Boundary>(["unmount", "disconnect"])(
    "drops a token resolved after %s without publishing",
    async (boundary) => {
      const { client } = harness();
      const view = render(panel(client));
      await waitFor(() => expect(live.state.rooms[0]?.connected).toBe(true));
      await settle();
      const pending = deferred<Ticket>();
      vi.mocked(client.token).mockImplementationOnce(() => pending.promise);
      await userEvent
        .setup()
        .click(screen.getByRole("button", { name: "Bật camera" }));
      expect(client.token).toHaveBeenLastCalledWith("room", true, false, "tab");
      leave(view, client, boundary);
      pending.resolve(serverTicket("red", "ALL", true));
      await flush();
      expect(live.state.rooms).toHaveLength(1);
      expect(live.state.rooms[0]!.camera).toBe(false);
    },
  );

  it.each<Boundary>(["unmount", "disconnect"])(
    "releases a connect that finishes after %s and never publishes",
    async (boundary) => {
      const { client } = harness();
      const view = render(panel(client));
      await waitFor(() => expect(live.state.rooms[0]?.connected).toBe(true));
      await settle();
      const gate = deferred<void>();
      live.state.connectPlan = () => gate.promise;
      await userEvent
        .setup()
        .click(screen.getByRole("button", { name: "Bật camera" }));
      await waitFor(() => expect(live.state.rooms).toHaveLength(2));
      leave(view, client, boundary);
      gate.resolve();
      await flush();
      const room = live.state.rooms[1]!;
      expect(room.disconnected).toBe(true);
      expect(room.camera).toBe(false);
      expect(room.tracks).toHaveLength(0);
    },
  );

  it("stops every opened room and track when a stage connect fails midway", async () => {
    const { client } = harness({ level: "ALL" });
    render(panel(client));
    await waitFor(() => expect(live.state.rooms[0]?.connected).toBe(true));
    await settle();
    live.state.connectPlan = (token) =>
      token === "stage-token"
        ? Promise.reject(new Error("stage down"))
        : undefined;
    await userEvent
      .setup()
      .click(screen.getByRole("button", { name: "Bật camera" }));
    expect(
      await screen.findByText("Chưa thể kết nối hình tiếng. Vui lòng thử lại."),
    ).toBeTruthy();
    const opened = live.state.rooms.slice(1);
    await waitFor(() =>
      expect(opened.every((room) => room.disconnected && !room.camera)).toBe(
        true,
      ),
    );
    expect(opened.every((room) => room.tracks.every((t) => t.stopped))).toBe(
      true,
    );
    expect(screen.getByRole("button", { name: "Bật camera" })).toBeTruthy();
  });
});

describe("media panel tab switch", () => {
  beforeEach(() => {
    HTMLDialogElement.prototype.showModal = function () {
      this.setAttribute("open", "");
    };
    HTMLDialogElement.prototype.close = function () {
      this.removeAttribute("open");
    };
  });
  const dialogEl = () =>
    document
      .querySelector('[data-modal="MODAL-MEDIA-TAB-SWITCH"]')!
      .closest("dialog")!;
  it("asks before taking devices from another tab and never publishes while read-only", async () => {
    const { client } = harness();
    const onTakeover = vi.fn(async () => {});
    render(panel(client, { writable: false, onTakeover }));
    await waitFor(() => expect(live.state.rooms[0]?.connected).toBe(true));
    const user = userEvent.setup();
    await user.click(cameraButton());
    expect(
      await screen.findByText("Chuyển thiết bị sang tab này?"),
    ).toBeTruthy();
    expect(dialogEl().hasAttribute("open")).toBe(true);
    expect(client.token).not.toHaveBeenCalledWith("room", true, false, "tab");
    await user.click(screen.getByRole("button", { name: "Hủy bỏ" }));
    expect(dialogEl().hasAttribute("open")).toBe(false);
    await user.click(cameraButton());
    fireEvent(dialogEl(), new Event("cancel", { cancelable: true }));
    expect(dialogEl().hasAttribute("open")).toBe(false);
    expect(onTakeover).not.toHaveBeenCalled();
    await user.click(cameraButton());
    await user.click(
      screen.getByRole("button", { name: "Chuyển thiết bị sang tab này" }),
    );
    await waitFor(() => expect(onTakeover).toHaveBeenCalledTimes(1));
    expect(await screen.findByText(/Đã chuyển thiết bị/)).toBeTruthy();
  });
  it("reconnecting a read-only tab never takes control", async () => {
    const { client } = harness();
    const onTakeover = vi.fn(async () => {});
    const view = render(panel(client, { writable: false, onTakeover }));
    await waitFor(() => expect(live.state.rooms[0]?.connected).toBe(true));
    view.rerender(
      panel(client, { writable: false, onTakeover, connected: false }),
    );
    view.rerender(panel(client, { writable: false, onTakeover }));
    await flush();
    expect(onTakeover).not.toHaveBeenCalled();
    expect(dialogEl().hasAttribute("open")).toBe(false);
  });
  it("stops local devices and rejoins receive-only when control moves to another tab", async () => {
    const { client } = harness();
    const view = render(panel(client));
    await settle();
    await userEvent.setup().click(cameraButton());
    await waitFor(() => expect(live.state.rooms[1]?.camera).toBe(true));
    view.rerender(panel(client, { writable: false }));
    await waitFor(() =>
      expect(client.token).toHaveBeenLastCalledWith(
        "room",
        false,
        false,
        "tab",
      ),
    );
    expect(cameraButton().getAttribute("aria-pressed")).toBe("false");
  });
});
