import { randomUUID } from "node:crypto";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import {
  apply,
  databaseUrl,
  pool,
  reset,
} from "../../game/room/room.test-helper.js";
import { ProfileService } from "@server/account/profile/profile.service.js";
import { ProfileStore } from "@server/account/profile/profile.store.js";
afterAll(() => pool.end());
const store = new ProfileStore(pool);
const service = new ProfileService(store);
async function member(username: string) {
  const id = randomUUID();
  await pool.query(
    'INSERT INTO auth.users(id,email,email_confirmed_at,raw_app_meta_data) VALUES($1,$2,clock_timestamp(),\'{"provider":"email"}\')',
    [id, `${username}@example.invalid`],
  );
  await pool.query(
    "INSERT INTO public.profiles(user_id,username,display_name,completed_at) VALUES($1,$2,$3,clock_timestamp())",
    [id, username, "Người chơi"],
  );
  return id;
}
describe.skipIf(!databaseUrl)("profile service over store", () => {
  beforeEach(async () => {
    await pool.query(
      "DROP SCHEMA IF EXISTS xiangqi_chat CASCADE; DROP SCHEMA IF EXISTS xiangqi_ai CASCADE; DROP SCHEMA IF EXISTS xiangqi_social CASCADE",
    );
    await reset();
    await apply("supabase/migrations/20261011000006_rooms.sql");
    await apply("supabase/migrations/20261017000018_room_code_digits.sql");
    await apply(
      "supabase/migrations/20261029000001_username_account_email.sql",
    );
  });
  it("reads username, read-only email and display name", async () => {
    const id = await member("profread");
    const view = await service.read(id, {
      username: "profread",
      email: "profread@example.invalid",
    });
    expect(view).toMatchObject({
      userId: id,
      username: "profread",
      email: "profread@example.invalid",
      displayName: "Người chơi",
    });
  });
  it("updates valid display names and rejects length and forbidden words", async () => {
    const id = await member("profwrite");
    await expect(service.updateDisplayName(id, "Kỳ Hữu Việt")).resolves.toEqual(
      {
        displayName: "Kỳ Hữu Việt",
      },
    );
    expect(
      (
        await pool.query(
          "SELECT display_name FROM public.profiles WHERE user_id=$1",
          [id],
        )
      ).rows[0].display_name,
    ).toBe("Kỳ Hữu Việt");
    await expect(service.updateDisplayName(id, "a")).rejects.toMatchObject({
      code: "PROFILE_NAME_INVALID",
    });
    await expect(
      service.updateDisplayName(id, "x".repeat(31)),
    ).rejects.toMatchObject({ code: "PROFILE_NAME_INVALID" });
    await expect(
      service.updateDisplayName(id, "screwyou"),
    ).rejects.toMatchObject({
      code: "PROFILE_NAME_FORBIDDEN",
    });
  });
  it("reports waiting, playing-online and empty locations", async () => {
    const id = await member("profloc1");
    const mate = await member("profloc2");
    expect(await service.location(id)).toEqual({
      kind: "none",
      roomId: null,
      matchId: null,
    });
    const roomId = randomUUID();
    await pool.query("BEGIN");
    await pool.query(
      "INSERT INTO public.rooms(id,owner_id,name,visibility,invite_code,time_control,viewer_limit,status,room_version) VALUES($1,$2,'Phong ho so','CODE_ONLY','12345678',600,5,'WAITING',1)",
      [roomId, id],
    );
    await pool.query(
      "INSERT INTO public.room_members(room_id,user_id,role,side) VALUES($1,$2,'PLAYER','RED')",
      [roomId, id],
    );
    await pool.query(
      "INSERT INTO public.active_players(user_id,room_id,match_id) VALUES($1,$2,NULL)",
      [id, roomId],
    );
    await pool.query("COMMIT");
    expect(await service.location(id)).toEqual({
      kind: "waiting",
      roomId,
      matchId: null,
    });
    const matchId = randomUUID();
    await pool.query("BEGIN");
    await pool.query(
      "INSERT INTO public.matches(id,room_id,mode,status,red_user_id,black_user_id,position,time_control,clock) VALUES($1,$2,'ONLINE','ACTIVE',$3,$4,(SELECT jsonb_build_object('board',jsonb_agg(x),'turn','RED') FROM (SELECT NULL::jsonb AS x FROM generate_series(1,90)) s),600,jsonb_build_object('redMs',600000,'blackMs',600000,'runningSinceEpochMs',floor(extract(epoch FROM clock_timestamp())*1000)::bigint))",
      [matchId, roomId, id, mate],
    );
    await pool.query(
      "UPDATE public.rooms SET status='PLAYING',current_match_id=$2 WHERE id=$1",
      [roomId, matchId],
    );
    await pool.query("COMMIT");
    expect(await service.location(id)).toEqual({
      kind: "playing-online",
      roomId,
      matchId,
    });
    const viewer = await member("profileviewer");
    await pool.query(
      "INSERT INTO public.room_members(room_id,user_id,role,side) VALUES($1,$2,'SPECTATOR',NULL)",
      [roomId, viewer],
    );
    expect(await service.location(viewer)).toEqual({
      kind: "none",
      roomId: null,
      matchId: null,
    });
  });
});

describe("profile service rules", () => {
  it("validates the display name before touching the store", async () => {
    const calls: string[] = [];
    const fake = {
      updateDisplayName: async () => void calls.push("update"),
    } as unknown as ProfileStore;
    const rules = new ProfileService(fake);
    await expect(rules.updateDisplayName("u", "a")).rejects.toMatchObject({
      code: "PROFILE_NAME_INVALID",
    });
    await expect(rules.updateDisplayName("u", 7)).rejects.toMatchObject({
      code: "PROFILE_NAME_INVALID",
    });
    expect(calls).toEqual([]);
    await expect(rules.updateDisplayName("u", "  Kỳ Hữu  ")).resolves.toEqual({
      displayName: "Kỳ Hữu",
    });
    expect(calls).toEqual(["update"]);
  });
});
