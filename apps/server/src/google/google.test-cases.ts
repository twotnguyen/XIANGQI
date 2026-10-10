import { createHash, randomUUID } from "node:crypto";
import { beforeAll, describe, it, expect } from "vitest";
import {
  pool,
  baseline,
  apply,
  databaseUrl,
  asRole,
} from "./database.test-helper.js";
import { GoogleService } from "./google.service.js";
import type { GoogleClaims, GoogleAuth } from "./contracts.js";
import { SessionService } from "../login/session.service.js";
import { PostgresLoginStore } from "../login/postgres-login-store.js";
import type { Session } from "../auth/contracts.js";
describe.skipIf(!databaseUrl)(
  "verified Google boundary with real database/session persistence",
  () => {
    let time = new Date("2026-10-11T00:00:00Z"),
      claims: GoogleClaims,
      failExchange = false,
      failAfterCreate = false,
      failPassword = false,
      changedUserAfterClear = false,
      failClear = false;
    let passwordCalls = 0;
    let passwordGate: { entered: () => void; wait: Promise<void> } | undefined;
    const tokens = new Map<string, string>();
    const auth: GoogleAuth = {
      async exchangeIDToken() {
        if (failExchange) throw new Error("private provider payload");
        let user = (
          await pool.query(
            "SELECT id,email,email_confirmed_at FROM auth.users WHERE lower(email)=lower($1)",
            [claims.email],
          )
        ).rows[0];
        if (!user) {
          const id = randomUUID();
          await pool.query(
            'INSERT INTO auth.users(id,email,email_confirmed_at,created_at,raw_app_meta_data) VALUES($1,$2,$3,$3,\'{"provider":"google","registration_pending":true}\')',
            [id, claims.email, time],
          );
          await pool.query(
            "INSERT INTO auth.identities(id,user_id,provider,provider_id) VALUES($1,$2,'google',$3)",
            [randomUUID(), id, claims.sub],
          );
          user = {
            id,
            email: claims.email,
            email_confirmed_at: time.toISOString(),
          };
        }
        if (failAfterCreate)
          throw new Error("provider response lost after commit");
        const access = randomUUID();
        tokens.set(access, user.id);
        return {
          access_token: access,
          refresh_token: randomUUID(),
          expires_in: 3600,
          user,
        };
      },
      async getUser(access) {
        const id = tokens.get(access);
        const u = (
          await pool.query(
            "SELECT id,email,email_confirmed_at FROM auth.users WHERE id=$1",
            [id],
          )
        ).rows[0];
        if (!u)
          throw Object.assign(new Error("private bad token"), { status: 401 });
        return changedUserAfterClear ? { ...u, id: randomUUID() } : u;
      },
      async setPassword() {
        passwordCalls++;
        if (failPassword) throw new Error("private password failure");
        if (passwordGate) {
          const gate = passwordGate;
          passwordGate = undefined;
          gate.entered();
          await gate.wait;
        }
      },
      async clearPending(id) {
        if (failClear) throw new Error("private clear failure");
        await pool.query(
          "UPDATE auth.users SET raw_app_meta_data=raw_app_meta_data||'{\"registration_pending\":false}' WHERE id=$1",
          [id],
        );
      },
      async deleteTemporary(id) {
        await pool.query("DELETE FROM auth.users WHERE id=$1", [id]);
      },
    };
    const sessions = new SessionService(
      new PostgresLoginStore(pool),
      {
        getUser: auth.getUser,
        async signInPassword() {
          throw new Error("not password path");
        },
      },
      () => time,
    );
    const service = new GoogleService(
      pool,
      {
        async verify() {
          return claims;
        },
      },
      auth,
      (id, remember) => sessions.issue(id, remember),
      "test-client.apps.googleusercontent.com",
      () => time,
    );
    const challenge = async (email = "google-new@example.invalid") => {
      const c = await service.beginChallenge();
      claims = {
        aud: "test-client.apps.googleusercontent.com",
        iss: "https://accounts.google.com",
        exp: Math.floor(time.getTime() / 1000) + 300,
        sub: email,
        email,
        email_verified: true,
        nonce: c.nonce,
      };
      return c;
    };
    beforeAll(async () => {
      await baseline();
      await apply("supabase/migrations/20261011000005_google_guest.sql");
    });
    it("rejects mismatched nonce/audience and replay before Auth exchange", async () => {
      const c = await challenge();
      claims.nonce = "wrong";
      await expect(
        service.authenticate("signed fixture", c.capability),
      ).rejects.toMatchObject({ code: "GOOGLE_INVALID" });
      claims.nonce = c.nonce;
      claims.aud = "wrong";
      await expect(
        service.authenticate("signed fixture", c.capability),
      ).rejects.toMatchObject({ code: "GOOGLE_INVALID" });
      claims.aud = "test-client.apps.googleusercontent.com";
      const result = await service.authenticate("signed fixture", c.capability);
      expect(result.kind).toBe("pending");
      await expect(
        service.authenticate("signed fixture", c.capability),
      ).rejects.toMatchObject({ code: "GOOGLE_INVALID" });
      expect(createHash("sha256").update(c.capability).digest("hex")).toBe(
        c.nonce,
      );
    });
    it("rejects existing email origin without mutating identity/account or password counter", async () => {
      const id = randomUUID();
      await pool.query(
        "INSERT INTO auth.users(id,email,raw_app_meta_data) VALUES($1,'email-origin@example.invalid','{\"provider\":\"email\"}')",
        [id],
      );
      const c = await challenge("email-origin@example.invalid");
      await expect(
        service.authenticate("fixture", c.capability),
      ).rejects.toMatchObject({ code: "EMAIL_TAKEN", status: 409 });
      expect(
        (
          await pool.query(
            "SELECT count(*)::int n FROM auth.identities WHERE user_id=$1",
            [id],
          )
        ).rows[0].n,
      ).toBe(0);
      expect(
        (
          await pool.query(
            "SELECT raw_app_meta_data->>'provider' p FROM auth.users WHERE id=$1",
            [id],
          )
        ).rows[0].p,
      ).toBe("email");
    });
    it("keeps provider outage generic and creates no member capability before completed onboarding", async () => {
      const c = await challenge("outage@example.invalid");
      failExchange = true;
      await expect(
        service.authenticate("fixture", c.capability),
      ).rejects.toMatchObject({ code: "GOOGLE_UNAVAILABLE", status: 503 });
      failExchange = false;
      expect(
        (
          await pool.query(
            "SELECT count(*)::int n FROM xiangqi_auth.app_sessions",
          )
        ).rows[0].n,
      ).toBe(0);
    });
    it("requires provider proof, completes username safely, recovers failed clear, never resets password failures", async () => {
      const c = await challenge("complete@example.invalid");
      const pending = await service.authenticate(
        "fixture",
        c.capability,
        false,
      );
      if (pending.kind !== "pending") throw new Error("Expected pending");
      await expect(
        service.complete(
          pending.capability,
          { access_token: "wrong" } as Session,
          { username: "PlayerGood", password: "Password123" },
        ),
      ).rejects.toMatchObject({ code: "GOOGLE_INVALID" });
      await pool.query(
        "INSERT INTO xiangqi_auth.login_attempts(username_key,failures) VALUES('playergood',ARRAY[$1::timestamptz])",
        [time],
      );
      failClear = true;
      await expect(
        service.complete(pending.capability, pending.session, {
          username: "PlayerGood",
          password: "Password123",
        }),
      ).rejects.toMatchObject({ code: "GOOGLE_RECOVERING" });
      expect(
        (
          await pool.query(
            "SELECT count(*)::int n FROM xiangqi_auth.app_sessions",
          )
        ).rows[0].n,
      ).toBe(0);
      failClear = false;
      const complete = await service.complete(
        pending.capability,
        pending.session,
        { username: "PlayerGood", password: "Password123" },
      );
      expect(complete.username).toBe("PlayerGood");
      expect(complete.expiresAt).toBe("2026-10-11T12:00:00.000Z");
      expect(
        (
          await pool.query(
            "SELECT cardinality(failures) n FROM xiangqi_auth.login_attempts WHERE username_key='playergood'",
          )
        ).rows[0].n,
      ).toBe(1);
      expect(
        await sessions.requireValidSession(complete.appSession),
      ).toMatchObject({ userId: complete.userId, remember: false });
      time = new Date("2026-10-11T01:00:00Z");
      await service.maintain();
      expect(
        (
          await pool.query(
            "SELECT count(*)::int n FROM auth.users WHERE id=$1",
            [complete.userId],
          )
        ).rows[0].n,
      ).toBe(1);
    });
    it("distinguishes verifier/provider outage from invalid proof and cleans only owned incomplete users", async () => {
      const c = await challenge("cleanup@example.invalid");
      const pending = await service.authenticate("fixture", c.capability);
      if (pending.kind !== "pending") throw new Error("Expected pending");
      const old = randomUUID();
      await pool.query(
        "INSERT INTO auth.users(id,email,raw_app_meta_data) VALUES($1,'unowned-google@example.invalid','{\"provider\":\"google\"}')",
        [old],
      );
      const unavailableVerifier = new GoogleService(
        pool,
        {
          async verify() {
            throw Object.assign(new Error("private jwks outage"), {
              status: 503,
            });
          },
        },
        auth,
        (id, r) => sessions.issue(id, r),
        "test-client.apps.googleusercontent.com",
        () => time,
      );
      const next = await challenge("new-verifier@example.invalid");
      await expect(
        unavailableVerifier.authenticate("fixture", next.capability),
      ).rejects.toMatchObject({ code: "GOOGLE_UNAVAILABLE", status: 503 });
      time = new Date(time.getTime() + 3600000);
      await service.maintain();
      expect(
        (
          await pool.query(
            "SELECT count(*)::int n FROM auth.users WHERE id=$1",
            [pending.session.user.id],
          )
        ).rows[0].n,
      ).toBe(0);
      expect(
        (
          await pool.query(
            "SELECT count(*)::int n FROM auth.users WHERE id=$1",
            [old],
          )
        ).rows[0].n,
      ).toBe(1);
    });
    it("serializes reauthentication draft rotation with in-flight completion", async () => {
      time = new Date("2026-10-14T00:00:00Z");
      const c = await challenge("reauth-race@example.invalid");
      const pending = await service.authenticate(
        "fixture",
        c.capability,
        false,
      );
      if (pending.kind !== "pending") throw new Error("Expected pending");
      let entered!: () => void, release!: () => void;
      const started = new Promise<void>((r) => (entered = r)),
        gate = new Promise<void>((r) => (release = r));
      passwordGate = { entered, wait: gate };
      const completing = service.complete(pending.capability, pending.session, {
        username: "RaceGoogle",
        password: "Password123",
      });
      await started;
      const next = await challenge("reauth-race@example.invalid");
      const reauth = service.authenticate("fixture", next.capability, true);
      await new Promise((r) => setTimeout(r, 30));
      release();
      await completing;
      expect((await reauth).kind).toBe("member");
      expect(
        (
          await pool.query(
            "SELECT count(*)::int n FROM xiangqi_auth.google_drafts WHERE user_id=$1",
            [pending.session.user.id],
          )
        ).rows[0].n,
      ).toBe(0);
    });
    it("recovers ownership and original deadline after provider creation commits but response is lost", async () => {
      time = new Date("2026-10-17T00:00:00Z");
      const first = await challenge("lost-response@example.invalid");
      failAfterCreate = true;
      await expect(
        service.authenticate("fixture", first.capability),
      ).rejects.toMatchObject({ code: "GOOGLE_UNAVAILABLE" });
      failAfterCreate = false;
      time = new Date("2026-10-17T00:30:00Z");
      const retry = await challenge("lost-response@example.invalid");
      const pending = await service.authenticate("fixture", retry.capability);
      expect(pending.kind).toBe("pending");
      expect(pending).toMatchObject({ expiresAt: "2026-10-17T01:00:00.000Z" });
      expect(
        (
          await pool.query(
            "SELECT owned FROM xiangqi_auth.google_drafts WHERE user_id=(SELECT id FROM auth.users WHERE email='lost-response@example.invalid')",
          )
        ).rows[0].owned,
      ).toBe(true);
    });
    it("cleans a provider-created orphan without retry while preserving unclaimed foreign identity", async () => {
      time = new Date("2026-10-18T00:00:00Z");
      const c = await challenge("orphan-response@example.invalid");
      failAfterCreate = true;
      await expect(
        service.authenticate("fixture", c.capability),
      ).rejects.toMatchObject({ code: "GOOGLE_UNAVAILABLE" });
      failAfterCreate = false;
      const foreign = randomUUID();
      await pool.query(
        "INSERT INTO auth.users(id,email,created_at,raw_app_meta_data) VALUES($1,'foreign@example.invalid',$2,'{\"provider\":\"google\"}')",
        [foreign, time],
      );
      await pool.query(
        "INSERT INTO auth.identities(id,user_id,provider,provider_id) VALUES($1,$2,'google','foreign-subject')",
        [randomUUID(), foreign],
      );
      time = new Date("2026-10-18T01:00:00Z");
      await service.maintain();
      expect(
        (
          await pool.query(
            "SELECT count(*)::int n FROM auth.users WHERE email='orphan-response@example.invalid'",
          )
        ).rows[0].n,
      ).toBe(0);
      expect(
        (
          await pool.query(
            "SELECT count(*)::int n FROM auth.users WHERE id=$1",
            [foreign],
          )
        ).rows[0].n,
      ).toBe(1);
    });
    it("requires exact verified intent subject and unexpired SQL provenance, with readonly application markers", async () => {
      time = new Date("2026-10-19T00:00:00Z");
      for (const expired of [false, true]) {
        const email = expired
          ? "expired-intent@example.invalid"
          : "wrong-subject@example.invalid";
        const c = await challenge(email);
        failExchange = true;
        await expect(
          service.authenticate("fixture", c.capability),
        ).rejects.toMatchObject({ code: "GOOGLE_UNAVAILABLE" });
        failExchange = false;
        if (expired)
          await pool.query(
            "UPDATE xiangqi_auth.google_creation_intents SET started_at=statement_timestamp()-interval '6 minutes',expires_at=statement_timestamp()-interval '1 minute' WHERE email_key=$1",
            [email],
          );
        const id = randomUUID();
        await pool.query(
          'INSERT INTO auth.users(id,email,created_at,raw_app_meta_data) VALUES($1,$2,$3,\'{"provider":"google"}\')',
          [id, email, time],
        );
        await pool.query(
          "INSERT INTO auth.identities(id,user_id,provider,provider_id) VALUES($1,$2,'google',$3)",
          [randomUUID(), id, expired ? email : "different-subject"],
        );
        expect(
          (
            await pool.query(
              "SELECT count(*)::int n FROM xiangqi_auth.google_temporary_accounts WHERE user_id=$1",
              [id],
            )
          ).rows[0].n,
        ).toBe(0);
      }
      await expect(
        asRole("app_server", (c) =>
          c.query(
            "INSERT INTO xiangqi_auth.google_temporary_accounts VALUES($1,now())",
            [randomUUID()],
          ),
        ),
      ).rejects.toMatchObject({ code: "42501" });
      time = new Date("2026-10-19T01:00:00Z");
      await service.maintain();
      expect(
        (
          await pool.query(
            "SELECT count(*)::int n FROM auth.users WHERE email IN ('expired-intent@example.invalid','wrong-subject@example.invalid')",
          )
        ).rows[0].n,
      ).toBe(2);
    });
    it("progresses past 100 completed temporary markers without deleting completed members", async () => {
      time = new Date("2026-10-20T00:00:00Z");
      const ids: string[] = [];
      for (let i = 0; i < 100; i++) {
        const id = randomUUID();
        ids.push(id);
        await pool.query(
          'INSERT INTO auth.users(id,email,created_at,raw_app_meta_data) VALUES($1,$2,$3,\'{"provider":"google"}\')',
          [id, `completed-${i}@example.invalid`, time],
        );
        await pool.query(
          "INSERT INTO public.profiles(user_id,username,display_name,completed_at,registration_pending) VALUES($1,$2,$2,$3,false)",
          [id, `Completed${i}`, time],
        );
        await pool.query(
          "INSERT INTO xiangqi_auth.google_temporary_accounts VALUES($1,$2)",
          [id, time],
        );
      }
      const orphan = randomUUID();
      await pool.query(
        "INSERT INTO auth.users(id,email,created_at,raw_app_meta_data) VALUES($1,'tail-orphan@example.invalid',$2,'{\"provider\":\"google\"}')",
        [orphan, new Date(time.getTime() + 1)],
      );
      await pool.query(
        "INSERT INTO xiangqi_auth.google_temporary_accounts VALUES($1,$2)",
        [orphan, new Date(time.getTime() + 1)],
      );
      time = new Date("2026-10-20T01:00:01Z");
      await service.maintain();
      await service.maintain();
      expect(
        (
          await pool.query(
            "SELECT count(*)::int n FROM auth.users WHERE id=$1",
            [orphan],
          )
        ).rows[0].n,
      ).toBe(0);
      expect(
        (
          await pool.query(
            "SELECT count(*)::int n FROM auth.users WHERE id=ANY($1::uuid[])",
            [ids],
          )
        ).rows[0].n,
      ).toBe(100);
    });
    it("recovers durable completed onboarding through fresh Google authentication after cookie expiry without rewriting credentials or counters", async () => {
      time = new Date("2026-10-21T00:00:00Z");
      const c = await challenge("durable-recovery@example.invalid");
      const pending = await service.authenticate(
        "fixture",
        c.capability,
        false,
      );
      if (pending.kind !== "pending") throw new Error("Expected pending");
      failClear = true;
      await expect(
        service.complete(pending.capability, pending.session, {
          username: "DurableGoogle",
          password: "Password123",
        }),
      ).rejects.toMatchObject({ code: "GOOGLE_RECOVERING" });
      expect(await service.onboarding(pending.capability)).toMatchObject({
        email: "durable-recovery@example.invalid",
        recovering: true,
        avatar: { kind: "initials", text: "D" },
      });
      await pool.query(
        "INSERT INTO xiangqi_auth.login_attempts(username_key,failures) VALUES('durablegoogle',ARRAY[$1::timestamptz])",
        [time],
      );
      const calls = passwordCalls;
      time = new Date("2026-10-21T01:01:00Z");
      const failed = await challenge("durable-recovery@example.invalid");
      await expect(
        service.authenticate("fixture", failed.capability),
      ).rejects.toMatchObject({ code: "GOOGLE_RECOVERING" });
      failClear = false;
      const fresh = await challenge("durable-recovery@example.invalid");
      const member = await service.authenticate(
        "fixture",
        fresh.capability,
        false,
      );
      expect(member).toMatchObject({
        kind: "member",
        userId: pending.session.user.id,
        username: "DurableGoogle",
        remember: false,
        expiresAt: "2026-10-21T13:01:00.000Z",
      });
      expect(passwordCalls).toBe(calls);
      expect(
        (
          await pool.query(
            "SELECT cardinality(failures) n FROM xiangqi_auth.login_attempts WHERE username_key='durablegoogle'",
          )
        ).rows[0].n,
      ).toBe(1);
      expect(
        (
          await pool.query(
            "SELECT count(*)::int n FROM xiangqi_auth.google_drafts WHERE user_id=$1",
            [pending.session.user.id],
          )
        ).rows[0].n,
      ).toBe(0);
    });
    it("expires incomplete recovering onboarding at sixty minutes and never returns a newly rotated expired capability", async () => {
      time = new Date("2026-10-22T00:00:00Z");
      const c = await challenge("incomplete-recovery@example.invalid");
      const pending = await service.authenticate("fixture", c.capability);
      if (pending.kind !== "pending") throw new Error("Expected pending");
      failPassword = true;
      await expect(
        service.complete(pending.capability, pending.session, {
          username: "IncompleteGoogle",
          password: "Password123",
        }),
      ).rejects.toMatchObject({ code: "GOOGLE_RECOVERING" });
      failPassword = false;
      time = new Date("2026-10-22T01:00:00Z");
      await expect(
        service.onboarding(pending.capability),
      ).rejects.toMatchObject({ code: "GOOGLE_EXPIRED" });
      await expect(
        service.complete(pending.capability, pending.session, {
          username: "IncompleteGoogle",
          password: "Password123",
        }),
      ).rejects.toMatchObject({ code: "GOOGLE_EXPIRED" });
      const next = await challenge("incomplete-recovery@example.invalid");
      await expect(
        service.authenticate("fixture", next.capability),
      ).rejects.toMatchObject({ code: "GOOGLE_EXPIRED" });
      await service.maintain();
      // The preceding fairness fixture retained >100 completed markers; maintenance is bounded per tick.
      await service.maintain();
      expect(
        (
          await pool.query(
            "SELECT count(*)::int n FROM auth.users WHERE id=$1",
            [pending.session.user.id],
          )
        ).rows[0].n,
      ).toBe(0);
    });
    it("exposes only capability-bound verified email and initials metadata and denies stale or unconfirmed authority", async () => {
      time = new Date("2026-10-23T00:00:00Z");
      const c = await challenge("metadata@example.invalid");
      const pending = await service.authenticate("fixture", c.capability);
      if (pending.kind !== "pending") throw new Error("Expected pending");
      expect(await service.onboarding(pending.capability)).toEqual({
        kind: "pending",
        expiresAt: pending.expiresAt,
        recovering: false,
        email: "metadata@example.invalid",
        avatar: { kind: "initials", text: "?" },
      });
      await expect(service.onboarding("z".repeat(43))).rejects.toMatchObject({
        code: "GOOGLE_INVALID",
      });
      await pool.query(
        "UPDATE auth.users SET email_confirmed_at=NULL WHERE id=$1",
        [pending.session.user.id],
      );
      await expect(
        service.onboarding(pending.capability),
      ).rejects.toMatchObject({ code: "GOOGLE_INVALID" });
    });
    it("rejects provider identity changes during durable recovery without issuing an application session", async () => {
      time = new Date("2026-10-24T00:00:00Z");
      const c = await challenge("changed-recovery@example.invalid");
      const pending = await service.authenticate("fixture", c.capability);
      if (pending.kind !== "pending") throw new Error("Expected pending");
      failClear = true;
      await expect(
        service.complete(pending.capability, pending.session, {
          username: "ChangedGoogle",
          password: "Password123",
        }),
      ).rejects.toMatchObject({ code: "GOOGLE_RECOVERING" });
      failClear = false;
      changedUserAfterClear = true;
      const count = (
        await pool.query(
          "SELECT count(*)::int n FROM xiangqi_auth.app_sessions",
        )
      ).rows[0].n;
      const next = await challenge("changed-recovery@example.invalid");
      await expect(
        service.authenticate("fixture", next.capability),
      ).rejects.toMatchObject({ code: "GOOGLE_RECOVERING" });
      changedUserAfterClear = false;
      expect(
        (
          await pool.query(
            "SELECT count(*)::int n FROM xiangqi_auth.app_sessions",
          )
        ).rows[0].n,
      ).toBe(count);
      expect(
        (
          await pool.query(
            "SELECT registration_pending FROM public.profiles WHERE user_id=$1",
            [pending.session.user.id],
          )
        ).rows[0].registration_pending,
      ).toBe(true);
    });
  },
);
