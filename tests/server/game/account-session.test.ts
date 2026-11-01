import { createHash, randomBytes, randomUUID } from "node:crypto";
import { afterAll, afterEach, beforeEach, describe, expect, it } from "vitest";
import { io, type Socket } from "socket.io-client";
import type { EngineResult } from "@xiangqi/engine";
import { createApp, drainRealtime } from "@server/app.js";
import { RegistrationError } from "@server/account/auth/registration.types.js";
import { PasswordModule } from "@server/account/password/password.module.js";
import { PasswordService } from "@server/account/password/password.service.js";
import { PasswordStore } from "@server/account/password/password.store.js";
import { SessionModule } from "@server/account/session/session.module.js";
import { ProfileModule } from "@server/account/profile/profile.module.js";
import { ProfileStore } from "@server/account/profile/profile.store.js";
import { EmailVerificationService } from "@server/account/email/email.service.js";
import { EmailVerificationStore } from "@server/account/email/email.store.js";
import { createRoomRuntime } from "@server/game/game.runtime.js";
import { createAiRuntime } from "@server/game/ai/ai-runtime.js";
import {
  apply,
  databaseUrl,
  env,
  loginPool,
  member,
  oldRoom,
  pool,
  registration,
  resetBase as reset,
  waitFor,
} from "./game.runtime.test-helper.js";

const origin = "http://localhost:5173";
const hash = (s: string) => createHash("sha256").update(s).digest("hex");
const device = () => randomBytes(32).toString("base64url");
const oldPassword = "before-password";
const newPassword = "after-password";

async function boot() {
  const r = registration();
  const passwords = new Map<string, string>();
  r.auth.signInPassword.mockImplementation(
    async (email: string, password: string) => {
      const entry = [...r.users].find(([, user]) => user.email === email);
      if (!entry || password !== (passwords.get(entry[1].id) ?? oldPassword))
        throw new RegistrationError(
          "RECOVERY_PASSWORD_INVALID",
          "fixture wrong password",
          401,
        );
      return {
        user: entry[1],
        access_token: entry[0],
        refresh_token: "fixture-refresh",
        expires_in: 3600,
      };
    },
  );
  const provider = {
    signInPassword: r.auth.signInPassword,
    async setPassword(id: string, password: string) {
      passwords.set(id, password);
    },
  };
  const messages: string[] = [];
  const passwordService = new PasswordService(
    new PasswordStore(pool),
    provider,
    {
      sendOtp: async (_to, otp) => {
        messages.push(otp);
      },
    },
    "isolated-session-password-secret",
  );
  const rooms = await createRoomRuntime(env, r.context);
  if (!rooms) throw new Error("Room runtime required");
  const ai = await createAiRuntime({
    env: { ...env, CORS_ORIGINS: origin },
    registration: { pool, sessions: r.sessions },
    authorizer: rooms.authorizer,
    guests: rooms.guests,
    withScope: rooms.withScope,
    engine: {
      ready: async () => {},
      search: () => new Promise<EngineResult>(() => {}),
      close: async () => {},
    },
  });
  if (!ai) throw new Error("AI runtime required");
  rooms.attachAiTermination(ai.sessionTermination);
  const app = await createApp(
    [origin],
    [
      rooms.module,
      ai.module,
      SessionModule.forRoot(
        r.sessions,
        async () => {
          throw new Error("unused refresh boundary");
        },
        false,
      ),
      PasswordModule.forRoot(passwordService, r.sessions, false),
      ProfileModule.forRoot(new ProfileStore(pool), r.sessions),
    ],
    null,
    rooms.realtime,
    rooms.publicFeed,
  );
  ai.attach(app.getHttpServer());
  await app.listen(0, "127.0.0.1");
  await rooms.start();
  await ai.start();
  const base = await app.getUrl();
  const sockets: Socket[] = [];
  type Member = Awaited<ReturnType<typeof member>>;
  async function call(a: Member, path: string, body?: unknown) {
    return fetch(base + path, {
      method: body === undefined ? "GET" : "POST",
      headers: {
        Origin: origin,
        Authorization: `Bearer ${a.token}`,
        "X-Xiangqi-Session": a.appSession,
        "Content-Type": "application/json",
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
  }
  async function roomSocket(a: Member, roomId: string) {
    // Replace oldRoom's synthetic starting presence with the first native controller.
    await pool.query(
      "DELETE FROM xiangqi_room.presence p WHERE room_id=$1 AND user_id=$2 AND NOT EXISTS(SELECT 1 FROM xiangqi_realtime.controllers c WHERE c.room_id=p.room_id AND c.user_id=p.user_id)",
      [roomId, a.id],
    );
    const s = io(base, {
      autoConnect: false,
      transports: ["websocket"],
      reconnection: false,
      auth: {
        accessToken: a.token,
        appSession: a.appSession,
        roomId,
        tabId: randomUUID(),
      },
    });
    sockets.push(s);
    const { promise: ready, resolve, reject } = Promise.withResolvers<void>();
    s.once("room.snapshot", () => resolve());
    s.once("connect_error", reject);
    s.connect();
    await ready;
    return s;
  }
  async function aiSocket(a: Member) {
    const tabId = randomUUID();
    const s = io(base + "/ai", {
      autoConnect: false,
      path: "/ai/socket.io",
      transports: ["websocket"],
      reconnection: false,
      extraHeaders: { Origin: origin },
      auth: { accessToken: a.token, appSession: a.appSession, tabId },
    });
    sockets.push(s);
    const {
      promise: ready,
      resolve,
      reject,
    } = Promise.withResolvers<{ connectionId: string; generation: number }>();
    s.once("ai.control", resolve);
    s.once("connect_error", reject);
    s.connect();
    const control = await ready;
    return { socket: s, tabId, ...control };
  }
  async function aiCall(
    a: Member,
    tab: Awaited<ReturnType<typeof aiSocket>>,
    path: string,
    body?: unknown,
  ) {
    return fetch(base + path, {
      method: body === undefined ? "GET" : "POST",
      headers: {
        Origin: origin,
        Authorization: `Bearer ${a.token}`,
        "X-Xiangqi-Session": a.appSession,
        "X-AI-Tab": tab.tabId,
        "X-AI-Connection": tab.connectionId,
        "X-AI-Generation": String(tab.generation),
        "Content-Type": "application/json",
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
  }
  const close = async () => {
    sockets.forEach((s) => s.disconnect());
    await ai.close();
    await drainRealtime(app);
    await rooms.stop();
    await rooms.close();
    await app.close();
  };
  return {
    r,
    messages,
    call,
    roomSocket,
    aiSocket,
    aiCall,
    passwordService,
    close,
  };
}

type Boot = Awaited<ReturnType<typeof boot>>;
let f: Boot;
async function match(id: string) {
  return (
    await pool.query(
      "SELECT status,outcome,clock FROM public.matches WHERE id=$1",
      [id],
    )
  ).rows[0];
}
async function expire(cap: string) {
  await pool.query(
    "WITH t AS (SELECT clock_timestamp()-interval '1 second' deadline) UPDATE xiangqi_auth.app_sessions SET expires_at=t.deadline,created_at=t.deadline-CASE WHEN remember THEN interval '720 hours' ELSE interval '12 hours' END FROM t WHERE token_hash=$1",
    [hash(cap)],
  );
}
async function assignDevice(cap: string, d: string) {
  await pool.query(
    "UPDATE xiangqi_auth.app_sessions SET device_hash=$2 WHERE token_hash=$1",
    [hash(cap), hash(d)],
  );
}
async function watch(socket: Socket, gameId: string) {
  const { promise, resolve } = Promise.withResolvers<{ ok: boolean }>();
  socket.emit("ai.watch", { gameId }, resolve);
  expect(await promise).toMatchObject({ ok: true });
}

describe.skipIf(!databaseUrl)(
  "YC1 member account lifecycle through native HTTP and sockets",
  () => {
    beforeEach(async () => {
      await reset();
      for (const migration of [
        "20261011000010_room_chat",
        "20261011000011_ai_reservations",
        "20261011000012_ai_presence",
        "20261029000001_username_account_email",
        "20261030000001_password_recovery",
        "20261103000002_yc1_account_rules",
        "20261103000003_password_reset_grant",
        "20261103000011_yc9_ranked",
      ])
        await apply(`supabase/migrations/${migration}.sql`);
      f = await boot();
    }, 30000);
    afterEach(async () => {
      await f?.close();
    });
    afterAll(async () => {
      await pool.end();
      await loginPool.end();
    });

    it("requires server-side logout confirmation, commits RESIGN and revokes the old API/socket", async () => {
      const { a, b, roomId, matchId } = await oldRoom(f.r, true);
      const socket = await f.roomSocket(a, roomId);
      expect((await f.call(a, "/auth/logout", {})).status).toBe(409);
      expect(await match(matchId!)).toMatchObject({
        status: "ACTIVE",
        outcome: null,
      });
      expect((await f.call(a, "/auth/session")).status).toBe(200);
      expect(socket.connected).toBe(true);
      expect((await f.call(a, "/auth/logout", { confirm: true })).status).toBe(
        200,
      );
      expect(await match(matchId!)).toMatchObject({
        status: "FINISHED",
        outcome: { reason: "RESIGN", winner: "BLACK" },
      });
      await waitFor(
        async () => socket.connected,
        (v) => !v,
      );
      expect((await f.call(a, "/auth/session")).status).toBe(401);
      expect((await f.call(b, "/auth/session")).status).toBe(200);
    }, 15000);

    it("expires an online session without freezing its clock, then resumes the same match from the same device within grace", async () => {
      const { a, roomId, matchId } = await oldRoom(f.r, true);
      const d = device();
      await assignDevice(a.appSession, d);
      const socket = await f.roomSocket(a, roomId);
      const before = await match(matchId!);
      await expire(a.appSession);
      await waitFor(
        async () => socket.connected,
        (v) => !v,
      );
      expect(await match(matchId!)).toEqual(before);
      const issued = await f.r.sessions.issue(a.id, false, undefined, d);
      expect(issued.displaced).toBe(false);
      a.appSession = issued.appSession;
      expect((await f.roomSocket(a, roomId)).connected).toBe(true);
      expect(await match(matchId!)).toEqual(before);
      expect(Date.now()).toBeGreaterThan(before.clock.runningSinceEpochMs);
    }, 15000);

    it("changes the password during an online match without RESIGN, reconnect or a new session deadline", async () => {
      const { a, roomId, matchId } = await oldRoom(f.r, true);
      const socket = await f.roomSocket(a, roomId);
      const before = await match(matchId!);
      const initial = await f.r.sessions.requireValidSession(a.appSession);
      const response = await f.call(a, "/account/password/change", {
        currentPassword: oldPassword,
        newPassword,
        passwordConfirmation: newPassword,
      });
      expect(response.status).toBe(200);
      expect(await f.r.sessions.requireValidSession(a.appSession)).toEqual(
        initial,
      );
      expect(await match(matchId!)).toEqual(before);
      expect(socket.connected).toBe(true);
      expect((await f.call(a, "/auth/session")).status).toBe(200);
    }, 15000);

    it("verifies a username-only member's contact email without replacing credentials, session or playing seat", async () => {
      const { a, roomId, matchId } = await oldRoom(f.r, true, true);
      const credential = `${a.id}@username.xiangqi.invalid`;
      const store = new EmailVerificationStore(pool);
      await store.createUsernameAccount(a.id);
      const socket = await f.roomSocket(a, roomId);
      const session = await f.r.sessions.requireValidSession(a.appSession);
      const before = await match(matchId!);
      const sent: string[] = [];
      const emails = new EmailVerificationService(
        store,
        {
          sendOtp: async (_to, otp) => {
            sent.push(otp);
          },
        },
        "isolated-contact-secret",
      );
      const target = `contact-${a.id}@example.invalid`;
      await emails.send(a.id, { email: target });
      expect(await emails.verify(a.id, { otp: sent[0] })).toMatchObject({
        emailVerified: true,
        email: target,
      });
      expect(await f.r.sessions.requireValidSession(a.appSession)).toEqual(
        session,
      );
      expect((await f.call(a, "/auth/session")).status).toBe(200);
      expect(await match(matchId!)).toEqual(before);
      expect(socket.connected).toBe(true);
      expect(
        (await pool.query("SELECT email FROM auth.users WHERE id=$1", [a.id]))
          .rows,
      ).toEqual([{ email: credential }]);
      expect(
        (
          await pool.query(
            "SELECT room_id FROM public.room_members WHERE user_id=$1 AND role='PLAYER'",
            [a.id],
          )
        ).rows,
      ).toEqual([{ room_id: roomId }]);
    }, 15000);

    it("password recovery revokes a playing socket but leaves the online match in disconnect grace, not RESIGN", async () => {
      const { a, roomId, matchId } = await oldRoom(f.r, true);
      const socket = await f.roomSocket(a, roomId);
      const username = (
        await f.r.sessions.requireActiveSession(a.token, a.appSession)
      ).username;
      const request = await f.passwordService.request({ username });
      const verified = await f.passwordService.verify({
        requestId: request.requestId,
        otp: f.messages.at(-1)!,
      });
      await f.passwordService.reset({
        requestId: request.requestId,
        resetToken: verified.resetToken,
        newPassword,
        passwordConfirmation: newPassword,
      });
      await waitFor(
        async () => socket.connected,
        (v) => !v,
      );
      expect(await match(matchId!)).toMatchObject({
        status: "ACTIVE",
        outcome: null,
      });
      expect((await f.call(a, "/auth/session")).status).toBe(401);
      await waitFor(
        async () =>
          (
            await pool.query(
              "SELECT disconnected_at FROM public.room_members WHERE room_id=$1 AND user_id=$2",
              [roomId, a.id],
            )
          ).rows[0]?.disconnected_at,
        (v) => v instanceof Date,
      );
    }, 15000);

    it.each(["different-device", "logout"] as const)(
      "ends member AI with an actual RESIGN result on %s, releases the seat and stops the old socket",
      async (reason) => {
        const a = await member(f.r);
        const d = device();
        await assignDevice(a.appSession, d);
        const tab = await f.aiSocket(a);
        const response = await f.aiCall(a, tab, "/ai", {
          level: "easy",
          requestedSide: "red",
        });
        expect(response.status).toBe(200);
        const gameId = (await response.json()).snapshot.id;
        await watch(tab.socket, gameId);
        if (reason === "logout") {
          expect((await f.call(a, "/auth/logout", {})).status).toBe(409);
          expect((await f.aiCall(a, tab, `/ai/${gameId}`)).status).toBe(200);
          expect(
            (await f.call(a, "/auth/logout", { confirm: true })).status,
          ).toBe(200);
        } else
          expect(
            (await f.r.sessions.issue(a.id, false, undefined, device()))
              .displaced,
          ).toBe(true);
        expect(await match(gameId)).toMatchObject({
          status: "FINISHED",
          outcome: { reason: "RESIGN", winner: "BLACK" },
        });
        expect(
          (
            await pool.query(
              "SELECT * FROM public.active_players WHERE user_id=$1",
              [a.id],
            )
          ).rows,
        ).toEqual([]);
        await waitFor(
          async () => tab.socket.connected,
          (v) => !v,
        );
        expect((await f.call(a, "/auth/session")).status).toBe(401);
      },
      15000,
    );

    it("retains the same member AI game for same-device re-login within its thirty-minute grace", async () => {
      const a = await member(f.r);
      const d = device();
      await assignDevice(a.appSession, d);
      const tab = await f.aiSocket(a);
      const response = await f.aiCall(a, tab, "/ai", {
        level: "easy",
        requestedSide: "red",
      });
      expect(response.status).toBe(200);
      const gameId = (await response.json()).snapshot.id;
      const location = await f.call(a, "/profile/location");
      expect(location.status).toBe(200);
      expect(await location.json()).toEqual({
        kind: "playing-ai",
        roomId: null,
        matchId: gameId,
      });
      await watch(tab.socket, gameId);
      await expire(a.appSession);
      await waitFor(
        async () => tab.socket.connected,
        (v) => !v,
      );
      await waitFor(
        async () =>
          (
            await pool.query(
              "SELECT disconnected_at FROM xiangqi_ai.presence WHERE owner_id=$1",
              [a.id],
            )
          ).rows[0]?.disconnected_at,
        (v) => v instanceof Date,
      );
      await pool.query(
        "UPDATE xiangqi_ai.presence SET disconnected_at=clock_timestamp()-interval '29 minutes' WHERE owner_id=$1",
        [a.id],
      );
      const issued = await f.r.sessions.issue(a.id, false, undefined, d);
      expect(issued.displaced).toBe(false);
      a.appSession = issued.appSession;
      const resumed = await f.aiSocket(a);
      const state = await f.aiCall(a, resumed, `/ai/${gameId}`);
      expect(state.status).toBe(200);
      expect(await state.json()).toMatchObject({
        snapshot: { id: gameId, status: "ACTIVE", outcome: null },
      });
      expect(
        (
          await pool.query("SELECT outcome FROM public.matches WHERE id=$1", [
            gameId,
          ])
        ).rows,
      ).toEqual([]);
    }, 15000);

    it.each(["online", "ai"] as const)(
      "keeps the old %s game and session when the replacement session cannot be inserted",
      async (kind) => {
        let a: Awaited<ReturnType<typeof member>>;
        let gameId: string;
        let onlineSocket: Socket | undefined;
        let aiTab: Awaited<ReturnType<Boot["aiSocket"]>> | undefined;
        if (kind === "online") {
          const started = await oldRoom(f.r, true);
          a = started.a;
          gameId = started.matchId!;
          onlineSocket = await f.roomSocket(a, started.roomId);
        } else {
          a = await member(f.r);
          aiTab = await f.aiSocket(a);
          const created = await f.aiCall(a, aiTab, "/ai", {
            level: "easy",
            requestedSide: "red",
          });
          expect(created.status).toBe(200);
          gameId = (await created.json()).snapshot.id;
          await watch(aiTab.socket, gameId);
        }
        await pool.query(`CREATE FUNCTION public.yc1_reject_session() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'synthetic replacement failure'; END $$;
        CREATE TRIGGER yc1_reject_session BEFORE INSERT ON xiangqi_auth.app_sessions FOR EACH ROW EXECUTE FUNCTION public.yc1_reject_session()`);
        await expect(
          f.r.sessions.issue(a.id, false, undefined, device()),
        ).rejects.toThrow();
        expect((await f.call(a, "/auth/session")).status).toBe(200);
        expect(
          (
            await pool.query(
              "SELECT user_id FROM public.active_players WHERE user_id=$1",
              [a.id],
            )
          ).rows,
        ).toEqual([{ user_id: a.id }]);
        if (kind === "online") {
          expect(await match(gameId)).toMatchObject({
            status: "ACTIVE",
            outcome: null,
          });
          expect(onlineSocket!.connected).toBe(true);
        } else {
          const state = await f.aiCall(a, aiTab!, `/ai/${gameId}`);
          expect(state.status).toBe(200);
          expect(await state.json()).toMatchObject({
            snapshot: { id: gameId, status: "ACTIVE", outcome: null },
          });
          expect(await match(gameId)).toBeUndefined();
          expect(aiTab!.socket.connected).toBe(true);
        }
      },
      15000,
    );
  },
);
