import { randomUUID } from "node:crypto";
import { afterAll, afterEach, beforeEach, describe, expect, it } from "vitest";
import { databaseUrl, pool } from "../game.runtime.test-helper.js";
import {
  createGuest,
  guestCall,
  type GuestFixture,
} from "../guest-runtime.test-helper.js";
import {
  type AiGuestBoot,
  type AiTab,
  bootAiGuestRuntime,
  aiRequest,
  countRows,
  createGuestAiGame,
  guestAi,
  heldAiSeats,
  historyRowCount,
  resetAiGuestDatabase,
} from "./ai-guest-runtime.test-helper.js";

interface AiBody {
  snapshot: {
    id: string;
    version: number;
    history: string[];
    undoUsed: number;
    status: string;
    outcome: { reason: string; winner: string | null } | null;
  };
}

async function watch(tab: AiTab, gameId: string) {
  return new Promise<{ ok: boolean }>((resolve) =>
    tab.client.emit("ai.watch", { gameId }, resolve),
  );
}

describe.skipIf(!databaseUrl)("guest AI game acceptance", () => {
  let boot: AiGuestBoot | undefined;

  beforeEach(async () => {
    await resetAiGuestDatabase();
    boot = await bootAiGuestRuntime();
  }, 30000);

  afterEach(async () => {
    await boot?.close();
    boot = undefined;
  });

  afterAll(async () => {
    await pool.end();
  });

  it("creates, plays, reads and resigns an AI game with only the guest capability", async () => {
    const guest = await createGuest(boot!, "Khách AI Một");
    const tab = await boot!.openTab(guest);
    const gameId = await createGuestAiGame(boot!, tab);

    const socketSnapshot = new Promise<AiBody>((resolve) =>
      tab.client.once("ai.snapshot", resolve),
    );
    expect(await watch(tab, gameId)).toMatchObject({ ok: true });
    expect((await socketSnapshot).snapshot).not.toHaveProperty("telemetry");

    const moved = await guestAi(boot!, tab, "POST", `/ai/${gameId}/move`, {
      version: 1,
      move: { from: 58, to: 49 },
    });
    expect(moved.status).toBe(200);
    const afterMove = (await moved.json()) as AiBody;
    expect(afterMove.snapshot.version).toBe(2);
    expect(afterMove.snapshot.history).toHaveLength(2);
    expect(afterMove.snapshot).not.toHaveProperty("telemetry");

    const read = await guestAi(boot!, tab, "GET", `/ai/${gameId}`);
    expect(read.status).toBe(200);
    expect(((await read.json()) as AiBody).snapshot.id).toBe(gameId);

    const resigned = await guestAi(boot!, tab, "POST", `/ai/${gameId}/resign`, {
      version: 2,
    });
    expect(resigned.status).toBe(200);
    const ended = (await resigned.json()) as AiBody;
    expect(ended.snapshot.status).toBe("FINISHED");
    expect(ended.snapshot.outcome?.reason).toBe("RESIGN");
    expect(ended.snapshot).not.toHaveProperty("telemetry");
    expect(await heldAiSeats(guest.userId)).toBe(0);
  });

  it("never writes match, move or event history for a guest AI game", async () => {
    const guest = await createGuest(boot!, "Khách AI Hai");
    const tab = await boot!.openTab(guest);
    const gameId = await createGuestAiGame(boot!, tab);
    await guestAi(boot!, tab, "POST", `/ai/${gameId}/move`, {
      version: 1,
      move: { from: 58, to: 49 },
    });
    await guestAi(boot!, tab, "POST", `/ai/${gameId}/resign`, { version: 2 });

    expect(await historyRowCount()).toBe(0);
    expect(await countRows("public.matches")).toBe(0);
  });

  it("forbids P2 undo for an authenticated guest without changing the game or blocking P1 resign", async () => {
    const guest = await createGuest(boot!, "Khách Không Undo");
    const tab = await boot!.openTab(guest);
    const gameId = await createGuestAiGame(boot!, tab);
    expect(await watch(tab, gameId)).toMatchObject({ ok: true });
    const moved = await guestAi(boot!, tab, "POST", `/ai/${gameId}/move`, {
      version: 1,
      move: { from: 58, to: 49 },
    });
    expect(moved.status).toBe(200);
    const before = (await moved.json()) as AiBody;
    expect(before.snapshot.history).toHaveLength(2);
    const denied = await guestAi(boot!, tab, "POST", `/ai/${gameId}/undo`, {
      version: before.snapshot.version,
    });
    expect(denied.status).toBe(403);
    expect((await denied.json()).code).toBe("AI_FORBIDDEN");
    const read = await guestAi(boot!, tab, "GET", `/ai/${gameId}`);
    expect(read.status).toBe(200);
    const after = (await read.json()) as AiBody;
    expect(after.snapshot).toEqual(before.snapshot);
    expect(after.snapshot.undoUsed).toBe(0);
    expect(await heldAiSeats(guest.userId)).toBe(1);
    expect(
      (
        await guestAi(boot!, tab, "POST", `/ai/${gameId}/resign`, {
          version: after.snapshot.version,
        })
      ).status,
    ).toBe(200);
  });

  it("refuses a mixed guest and member proof on the AI socket", async () => {
    const guest = await createGuest(boot!, "Khách AI Ba");
    const member = await boot!.newMember();
    const error = await boot!.handshake({
      guestCapability: guest.cap,
      accessToken: member.token,
      appSession: member.appSession,
      tabId: randomUUID(),
    });
    expect(error).not.toBeNull();
  });

  it("does not expose one guest's AI game to an outsider guest", async () => {
    const owner = await createGuest(boot!, "Khách Chủ");
    const ownerTab = await boot!.openTab(owner);
    const gameId = await createGuestAiGame(boot!, ownerTab);

    const outsider = await createGuest(boot!, "Khách Ngoài");
    const outsiderTab = await boot!.openTab(outsider);
    const read = await guestAi(boot!, outsiderTab, "GET", `/ai/${gameId}`);
    expect([401, 403, 404]).toContain(read.status);
  });

  it("rejects a stale connection id on a guest AI write", async () => {
    const guest = await createGuest(boot!, "Khách Tab Cũ");
    const tab = await boot!.openTab(guest);
    const gameId = await createGuestAiGame(boot!, tab);
    const stale = { ...tab, connectionId: randomUUID() };
    const moved = await guestAi(boot!, stale, "POST", `/ai/${gameId}/move`, {
      version: 1,
      move: { from: 58, to: 49 },
    });
    expect(moved.status).toBeGreaterThanOrEqual(400);
    expect(moved.status).not.toBe(200);
  });

  it("rejects an expired guest without a seat from starting an AI game", async () => {
    const guest: GuestFixture = await createGuest(boot!, "Khách Hết Hạn");
    await pool.query(
      "WITH t AS(SELECT clock_timestamp() at) UPDATE xiangqi_auth.guest_sessions SET created_at=at-interval '13 hours',expires_at=at-interval '1 hour' FROM t WHERE guest_id=$1 AND ended_at IS NULL",
      [guest.userId],
    );
    const response = await aiRequest(
      boot!,
      "Guest " + guest.cap,
      { tabId: randomUUID(), connectionId: randomUUID(), generation: 1 },
      "POST",
      "/ai",
      { level: "easy", requestedSide: "red" },
    );
    expect([401, 403]).toContain(response.status);
    expect(await heldAiSeats(guest.userId)).toBe(0);
  });

  it("keeps the online room and AI seat mutually exclusive for one guest", async () => {
    const guest = await createGuest(boot!, "Khách Ghế Đơn");
    const tab = await boot!.openTab(guest);
    await createGuestAiGame(boot!, tab);

    const room = await guestCall(boot!, guest.cap, "POST", "/rooms", {
      commandId: randomUUID(),
      timeMinutes: 5,
    });
    expect(room.status).toBe(409);
    expect(await heldAiSeats(guest.userId)).toBe(1);
  });

  it("blocks a new AI game while the guest already holds an online room seat", async () => {
    const guest = await createGuest(boot!, "Khách Phòng Trước");
    const room = await guestCall(boot!, guest.cap, "POST", "/rooms", {
      commandId: randomUUID(),
      timeMinutes: 5,
    });
    expect(room.status).toBe(200);
    const tab = await boot!.openTab(guest);
    const created = await guestAi(boot!, tab, "POST", "/ai", {
      level: "easy",
      requestedSide: "red",
    });
    expect(created.status).toBe(409);
    expect(await heldAiSeats(guest.userId)).toBe(0);
  });
});
