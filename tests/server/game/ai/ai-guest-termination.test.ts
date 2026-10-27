import { randomUUID } from "node:crypto";
import { afterAll, afterEach, beforeEach, describe, expect, it } from "vitest";
import { databaseUrl, pool } from "../game.runtime.test-helper.js";
import {
  createGuest,
  expireGuest,
  guestCall,
  type GuestFixture,
} from "../guest-runtime.test-helper.js";
import {
  type AiGuestBoot,
  type AiTab,
  bootAiGuestRuntime,
  createGuestAiGame,
  guestAi,
  heldAiSeats,
  resetAiGuestDatabase,
} from "./ai-guest-runtime.test-helper.js";

const FAIL_TRIGGER = "synthetic_fail_ai_release";

async function logout(
  boot: AiGuestBoot,
  guest: GuestFixture,
  confirmed: boolean,
) {
  return fetch(boot.base + "/account/guest/logout", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: `xiangqi_guest=${guest.cap}`,
    },
    body: JSON.stringify({ confirmedResign: confirmed }),
  });
}

async function readAiGame(boot: AiGuestBoot, tab: AiTab, gameId: string) {
  return guestAi(boot, tab, "GET", `/ai/${gameId}`);
}

async function ownerRows(userId: string): Promise<number> {
  const row = await pool.query<{ n: number }>(
    "SELECT count(*)::int AS n FROM public.active_players WHERE user_id=$1",
    [userId],
  );
  return row.rows[0]?.n ?? 0;
}

describe.skipIf(!databaseUrl)("guest AI termination acceptance", () => {
  let boot: AiGuestBoot | undefined;

  beforeEach(async () => {
    await resetAiGuestDatabase();
    boot = await bootAiGuestRuntime();
  }, 30000);

  afterEach(async () => {
    await pool.query(
      `DROP TRIGGER IF EXISTS ${FAIL_TRIGGER} ON public.active_players`,
    );
    await boot?.close();
    boot = undefined;
  });

  afterAll(async () => {
    await pool.end();
  });

  it("keeps an expired seated AI game playable, blocks a new room, then cleans up after resign", async () => {
    const guest = await createGuest(boot!, "Khách Hạn Mười Hai");
    const tab = await boot!.openTab(guest);
    const gameId = await createGuestAiGame(boot!, tab);
    await expireGuest(guest.userId);

    const moved = await guestAi(boot!, tab, "POST", `/ai/${gameId}/move`, {
      version: 1,
      move: { from: 58, to: 49 },
    });
    expect(moved.status).toBe(200);

    const room = await guestCall(boot!, guest.cap, "POST", "/rooms", {
      commandId: randomUUID(),
      timeMinutes: 5,
    });
    expect(room.status).toBe(403);
    expect(await room.text()).toContain("GUEST_DEFERRED");

    expect({ seats: await heldAiSeats(guest.userId) }).toEqual({ seats: 1 });
    const resigned = await guestAi(boot!, tab, "POST", `/ai/${gameId}/resign`, {
      version: 2,
    });
    expect(resigned.status).toBe(200);
    expect(await heldAiSeats(guest.userId)).toBe(0);

    const after = await guestAi(boot!, tab, "POST", "/ai", {
      level: "easy",
      requestedSide: "red",
    });
    expect([401, 403]).toContain(after.status);
  });

  it("refuses logout without confirmation, then a confirmed logout drops the AI game and scrubs the guest", async () => {
    const guest = await createGuest(boot!, "Khách Đăng Xuất");
    const tab = await boot!.openTab(guest);
    const gameId = await createGuestAiGame(boot!, tab);

    const refused = await logout(boot!, guest, false);
    expect(refused.status).toBe(409);
    expect(await refused.text()).toContain("GUEST_RESIGN_CONFIRM_REQUIRED");
    expect(await heldAiSeats(guest.userId)).toBe(1);

    const confirmed = await logout(boot!, guest, true);
    expect(confirmed.status).toBe(200);
    expect(await confirmed.json()).toMatchObject({ ended: true });
    expect(await ownerRows(guest.userId)).toBe(0);

    const gone = await readAiGame(boot!, tab, gameId);
    expect(gone.status).not.toBe(200);
  });

  it("keeps RAM and the DB seat when the SQL commit fails, then a retried confirmed logout succeeds", async () => {
    const guest = await createGuest(boot!, "Khách Lỗi Commit");
    const tab = await boot!.openTab(guest);
    const gameId = await createGuestAiGame(boot!, tab);

    await pool.query(
      `CREATE OR REPLACE FUNCTION public.${FAIL_TRIGGER}() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'synthetic SQL commit failure'; END $$;
       CREATE TRIGGER ${FAIL_TRIGGER} BEFORE UPDATE OR DELETE ON public.active_players FOR EACH ROW WHEN (OLD.ai_game_id IS NOT NULL) EXECUTE FUNCTION public.${FAIL_TRIGGER}();`,
    );
    const failed = await logout(boot!, guest, true);
    expect(failed.status).toBeGreaterThanOrEqual(500);
    expect(await heldAiSeats(guest.userId)).toBe(1);

    const stillLive = await readAiGame(boot!, tab, gameId);
    expect(stillLive.status).toBe(200);

    await pool.query(`DROP TRIGGER ${FAIL_TRIGGER} ON public.active_players`);
    const retried = await logout(boot!, guest, true);
    expect(retried.status).toBe(200);
    expect(await ownerRows(guest.userId)).toBe(0);
  });
});
