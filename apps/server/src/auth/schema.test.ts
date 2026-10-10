import { readFile } from "node:fs/promises";
import { Pool } from "pg";
import { beforeAll, afterAll, expect, it, describe } from "vitest";

const url = process.env.AUTH_TEST_DATABASE_URL;
if (url) {
  const parsed = new URL(url);
  if (
    !["localhost", "127.0.0.1", "postgres"].includes(parsed.hostname) ||
    parsed.pathname !== "/xiangqi_auth_test"
  )
    throw new Error(
      "AUTH_TEST_DATABASE_URL must identify the isolated xiangqi_auth_test database",
    );
}
describe.skipIf(!url)("registration migration on audited baseline", () => {
  const pool = new Pool({ connectionString: url });
  let membershipsBefore: unknown[];
  let metadataBefore: unknown;
  const metadata = async () => ({
    constraints: (
      await pool.query(
        "SELECT conname,pg_get_constraintdef(oid) FROM pg_constraint WHERE conrelid='public.profiles'::regclass ORDER BY conname",
      )
    ).rows,
    indexes: (
      await pool.query(
        "SELECT indexname,indexdef FROM pg_indexes WHERE schemaname='public' AND tablename='profiles' ORDER BY indexname",
      )
    ).rows,
    triggers: (
      await pool.query(
        "SELECT tgname,tgenabled,pg_get_triggerdef(oid) FROM pg_trigger WHERE NOT tgisinternal AND tgrelid IN ('auth.users'::regclass,'public.profiles'::regclass) ORDER BY tgname",
      )
    ).rows,
    tables: (
      await pool.query(
        "SELECT oid::regclass::text,relowner::regrole::text,relacl::text,relrowsecurity,relforcerowsecurity FROM pg_class WHERE oid IN ('auth.users'::regclass,'public.profiles'::regclass) ORDER BY oid::regclass::text",
      )
    ).rows,
    columns: (
      await pool.query(
        "SELECT attname,attacl::text FROM pg_attribute WHERE attrelid='public.profiles'::regclass AND attnum>0 AND NOT attisdropped ORDER BY attname",
      )
    ).rows,
    schemas: (
      await pool.query(
        "SELECT nspname,nspowner::regrole::text,nspacl::text FROM pg_namespace WHERE nspname IN ('auth','public') ORDER BY nspname",
      )
    ).rows,
    functions: (
      await pool.query(
        "SELECT oid::regprocedure::text,proowner::regrole::text,proacl::text,pg_get_functiondef(oid) FROM pg_proc WHERE oid IN ('public.handle_new_user()'::regprocedure,'public.guard_profile_updates()'::regprocedure) ORDER BY oid::regprocedure::text",
      )
    ).rows,
  });
  const memberships = async () =>
    (
      await pool.query(
        `SELECT g.rolname,m.rolname,r.rolname,a.admin_option,a.inherit_option,a.set_option FROM pg_auth_members a JOIN pg_roles g ON g.oid=a.roleid JOIN pg_roles m ON m.oid=a.member JOIN pg_roles r ON r.oid=a.grantor WHERE g.rolname='app_server' AND m.rolname='postgres' ORDER BY r.rolname`,
      )
    ).rows;
  const migrate = async () => {
    const client = await pool.connect();
    try {
      await client.query("SET ROLE postgres");
      await client.query(
        await readFile(
          "supabase/migrations/20261011000001_email_registration.sql",
          "utf8",
        ),
      );
    } finally {
      await client.query("ROLLBACK");
      await client.query("RESET ROLE");
      client.release();
    }
  };
  beforeAll(async () => {
    await pool.query(
      await readFile("supabase/tests/auth-baseline.sql", "utf8"),
    );
    await pool.query(
      `INSERT INTO auth.users(id,email,raw_user_meta_data,email_confirmed_at) VALUES('00000000-0000-0000-0000-000000000001','legacy@example.invalid','{"signup_username":"legacy"}',now())`,
    );
    membershipsBefore = await memberships();
    metadataBefore = await metadata();
    await migrate();
  });
  afterAll(async () => {
    await pool.end();
  });
  it("supports pre-write rollback while preserving audited legacy profiles", async () => {
    const client = await pool.connect();
    let rolledBack = false;
    try {
      await client.query(
        await readFile(
          "supabase/rollback/20261011000001_email_registration.sql",
          "utf8",
        ),
      );
      rolledBack = true;
      expect(await memberships()).toEqual(membershipsBefore);
      expect(await metadata()).toEqual(metadataBefore);
      expect(
        (
          await client.query(
            "SELECT username FROM public.profiles WHERE user_id='00000000-0000-0000-0000-000000000001'",
          )
        ).rows[0].username,
      ).toBe("legacy");
    } finally {
      if (rolledBack) await migrate();
      else await client.query("ROLLBACK");
      client.release();
    }
  });
  it("provisions only SET membership and exposes only five safe Auth columns", async () => {
    const client = await pool.connect();
    try {
      await client.query("SET SESSION AUTHORIZATION postgres");
      await client.query("SET ROLE app_server");
      const safe = await client.query(
        "SELECT * FROM xiangqi_auth.accounts LIMIT 0",
      );
      expect(safe.fields.map((f) => f.name)).toEqual([
        "id",
        "email",
        "email_confirmed_at",
        "raw_user_meta_data",
        "created_at",
      ]);
      expect(
        (
          await client.query(
            "SELECT has_schema_privilege(current_user,'auth','USAGE') AS allowed",
          )
        ).rows[0].allowed,
      ).toBe(false);
      await expect(
        client.query("SELECT email FROM auth.users"),
      ).rejects.toMatchObject({ code: "42501" });
      await expect(
        client.query("SELECT encrypted_password FROM xiangqi_auth.accounts"),
      ).rejects.toMatchObject({ code: "42703" });
      await client.query("RESET ROLE");
      await client.query("RESET SESSION AUTHORIZATION");
      await client.query("SET ROLE authenticated");
      await expect(
        client.query("SELECT * FROM xiangqi_auth.accounts"),
      ).rejects.toMatchObject({ code: "42501" });
    } finally {
      await client.query("RESET ROLE");
      await client.query("RESET SESSION AUTHORIZATION");
      client.release();
    }
  });
  it("invokes restricted trigger functions as the real Auth owner with FORCE RLS retained", async () => {
    const client = await pool.connect();
    const id = randomUUID();
    try {
      expect(
        (
          await client.query(
            "SELECT relforcerowsecurity FROM pg_class WHERE oid='public.profiles'::regclass",
          )
        ).rows[0].relforcerowsecurity,
      ).toBe(true);
      expect(
        (
          await client.query(
            "SELECT has_function_privilege('app_server','public.handle_new_user()','EXECUTE') AS allowed",
          )
        ).rows[0].allowed,
      ).toBe(false);
      await client.query("SET ROLE supabase_auth_admin");
      expect(
        (
          await client.query(
            "SELECT has_schema_privilege(current_user,'xiangqi_auth','USAGE') AS allowed",
          )
        ).rows[0].allowed,
      ).toBe(false);
      await client.query("INSERT INTO auth.users(id,email) VALUES($1,$2)", [
        id,
        `${id}@example.invalid`,
      ]);
      await client.query(
        "UPDATE auth.users SET email_confirmed_at=now() WHERE id=$1",
        [id],
      );
      await expect(
        client.query(
          "UPDATE auth.users SET email='different@example.invalid' WHERE id=$1",
          [id],
        ),
      ).rejects.toThrow("Email is immutable");
      await client.query("RESET ROLE");
      expect(
        (
          await client.query(
            "SELECT user_id FROM public.profiles WHERE user_id=$1",
            [id],
          )
        ).rowCount,
      ).toBe(0);
    } finally {
      await client.query("RESET ROLE");
      client.release();
    }
  });
  it("refuses rollback when a username reservation would be lost", async () => {
    const client = await pool.connect();
    try {
      await client.query(
        "INSERT INTO xiangqi_auth.username_reservations VALUES('held_name','00000000-0000-0000-0000-000000000001',now()+interval '30 days')",
      );
      await expect(
        client.query(
          await readFile(
            "supabase/rollback/20261011000001_email_registration.sql",
            "utf8",
          ),
        ),
      ).rejects.toThrow("Rollback requires backup review");
    } finally {
      await client.query("ROLLBACK");
      await client.query(
        "DELETE FROM xiangqi_auth.username_reservations WHERE username_key='held_name'",
      );
      client.release();
    }
  });
  it("does not create a profile or reserve username before OTP completion", async () => {
    await pool.query(
      `INSERT INTO auth.users(id,email,raw_user_meta_data) VALUES('00000000-0000-0000-0000-000000000002','pending@example.invalid','{"signup_username":"pending"}')`,
    );
    const rows = await pool.query(
      `SELECT * FROM public.profiles WHERE user_id='00000000-0000-0000-0000-000000000002'`,
    );
    expect(rows.rowCount).toBe(0);
  });
  it("preserves verified legacy profiles as completed and active", async () => {
    const { rows } = await pool.query(
      `SELECT completed_at IS NOT NULL AS complete,registration_pending FROM public.profiles WHERE username='legacy'`,
    );
    expect(rows[0]).toEqual({ complete: true, registration_pending: false });
  });
  it("preserves username case while preventing case-insensitive duplicates", async () => {
    await pool.query(
      `INSERT INTO public.profiles(user_id,username,display_name,completed_at) VALUES('00000000-0000-0000-0000-000000000002','KyThu','KyThu',now())`,
    );
    await pool.query(
      `INSERT INTO auth.users(id,email,raw_user_meta_data) VALUES('00000000-0000-0000-0000-000000000003','duplicate@example.invalid','{"signup_username":"other"}')`,
    );
    await expect(
      pool.query(
        `INSERT INTO public.profiles(user_id,username,display_name) VALUES('00000000-0000-0000-0000-000000000003','kythu','kythu')`,
      ),
    ).rejects.toMatchObject({ code: "23505" });
    const { rows } = await pool.query(
      `SELECT username FROM public.profiles WHERE user_id='00000000-0000-0000-0000-000000000002'`,
    );
    expect(rows[0].username).toBe("KyThu");
  });
  it("blocks direct email changes but permits OTP confirmation", async () => {
    await pool.query(
      `UPDATE auth.users SET email_confirmed_at=now() WHERE id='00000000-0000-0000-0000-000000000002'`,
    );
    await expect(
      pool.query(
        `UPDATE auth.users SET email='different@example.invalid' WHERE id='00000000-0000-0000-0000-000000000002'`,
      ),
    ).rejects.toThrow("Email is immutable");
    await expect(
      pool.query(
        `UPDATE auth.users SET email_change='different@example.invalid' WHERE id='00000000-0000-0000-0000-000000000002'`,
      ),
    ).rejects.toThrow("Email is immutable");
  });
});

import { RegistrationService } from "./registration.service.js";
import { SupabaseAuth } from "./supabase-auth.js";
import { PostgresRegistrationStore } from "./postgres-store.js";
import { startAuthFixture } from "./auth-fixture.test-helper.js";
import { randomUUID, createHash } from "node:crypto";
import { Controller, Get, Module, Req, UseGuards } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { RegistrationModule } from "./registration.module.js";
import { AccountActiveGuard } from "./account-active.guard.js";

describe.skipIf(!url)(
  "registration with real SQL store and HTTP provider adapter",
  () => {
    const pool = new Pool({ connectionString: url });
    const runtimePool = new Pool({ connectionString: url });
    runtimePool.on("connect", (client) => {
      // Queue before any store query: emulate the real nonsuperuser runtime login.
      void client.query("SET SESSION AUTHORIZATION postgres");
    });
    let clock = new Date();
    let fixture: Awaited<ReturnType<typeof startAuthFixture>>;
    let service: RegistrationService;
    const credentials = (username = "KyThu" + randomUUID().slice(0, 8)) => ({
      username,
      password: "fake-password-fixture",
      passwordConfirmation: "fake-password-fixture",
    });
    const email = () => `${randomUUID()}@example.invalid`;
    beforeAll(async () => {
      fixture = await startAuthFixture(pool, () => clock);
      expect(
        (await runtimePool.query("SELECT session_user,current_user")).rows[0],
      ).toEqual({ session_user: "postgres", current_user: "postgres" });
      service = new RegistrationService(
        new PostgresRegistrationStore(runtimePool),
        new SupabaseAuth(fixture.url, "fake-public-key", "fake-server-key"),
        () => clock,
      );
    });
    afterAll(async () => {
      await fixture.close();
      await runtimePool.end();
      await pool.end();
    });
    it("validates step one without holding a username or storing a password", async () => {
      expect(await service.check(credentials())).toEqual({ step: 2 });
      await expect(service.check(credentials("LEGACY"))).rejects.toMatchObject({
        code: "USERNAME_TAKEN",
        step: 1,
      });
      await expect(service.check(credentials("f.u.c.k"))).rejects.toMatchObject(
        { code: "USERNAME_INVALID", step: 1 },
      );
    });
    it("creates only an unconfirmed identity and capability draft at step two", async () => {
      const address = email();
      const input = credentials();
      const registration = await service.email({ ...input, email: address });
      expect(registration.registrationToken.length).toBeGreaterThanOrEqual(43);
      const { rows } = await pool.query(
        "SELECT u.id, p.completed_at, d.username FROM auth.users u LEFT JOIN public.profiles p ON p.user_id=u.id JOIN xiangqi_auth.registration_drafts d ON d.user_id=u.id WHERE u.email=$1",
        [address],
      );
      expect(rows[0]).toMatchObject({
        completed_at: null,
        username: input.username,
      });
      await expect(
        service.email({ ...credentials(), email: address }),
      ).rejects.toMatchObject({ code: "EMAIL_TAKEN" });
      expect(fixture.state.sent).toBe(1);
    });
    it("completes verified profiles with original case, logs in and allows active use", async () => {
      const input = credentials();
      const registration = await service.email({ ...input, email: email() });
      const session = await service.verify({
        registrationToken: registration.registrationToken,
        otp: "123456",
      });
      expect(session.access_token).not.toBe("");
      expect(await service.requireActive(session.access_token)).toBeTruthy();
      const { rows } = await pool.query(
        "SELECT username,display_name,registration_pending,completed_at IS NOT NULL AS complete FROM public.profiles WHERE username=$1",
        [input.username],
      );
      expect(rows[0]).toEqual({
        username: input.username,
        display_name: input.username,
        registration_pending: false,
        complete: true,
      });
    });
    it("enforces resend cooldown and OTP expiry, exposes provider rate limits without its payload", async () => {
      const registration = await service.email({
        ...credentials(),
        email: email(),
      });
      await expect(
        service.resend({ registrationToken: registration.registrationToken }),
      ).rejects.toMatchObject({ code: "RESEND_WAIT" });
      clock = new Date(clock.getTime() + 180001);
      await expect(
        service.verify({
          registrationToken: registration.registrationToken,
          otp: "123456",
        }),
      ).rejects.toMatchObject({ code: "OTP_EXPIRED" });
      await service.resend({
        registrationToken: registration.registrationToken,
      });
      fixture.state.limited = true;
      await expect(
        service.verify({
          registrationToken: registration.registrationToken,
          otp: "123456",
        }),
      ).rejects.toMatchObject({ code: "OTP_RATE_LIMIT" });
      fixture.state.limited = false;
      await expect(
        service.verify({
          registrationToken: registration.registrationToken,
          otp: "654321",
        }),
      ).rejects.toMatchObject({ code: "OTP_INVALID" });
    });
    it("returns username collision to step one before consuming verification", async () => {
      const name = credentials().username;
      const first = await service.email({
        ...credentials(name),
        email: email(),
      });
      const second = await service.email({
        ...credentials(name.toLowerCase()),
        email: email(),
      });
      await service.verify({
        registrationToken: first.registrationToken,
        otp: "123456",
      });
      await expect(
        service.verify({
          registrationToken: second.registrationToken,
          otp: "123456",
        }),
      ).rejects.toMatchObject({ code: "USERNAME_TAKEN", step: 1 });
      clock = new Date(clock.getTime() + 60000);
      await service.email({
        ...credentials(),
        email: (
          await pool.query(
            "SELECT email FROM xiangqi_auth.registration_drafts WHERE token_hash IS NOT NULL AND username=$1",
            [name.toLowerCase()],
          )
        ).rows[0].email,
        registrationToken: second.registrationToken,
      });
      expect(
        (
          await service.verify({
            registrationToken: second.registrationToken,
            otp: "123456",
          })
        ).access_token,
      ).not.toBe("");
    });
    it("recovers completed-but-pending profiles and never deletes them after a provider failure", async () => {
      const address = email();
      const registration = await service.email({
        ...credentials(),
        email: address,
      });
      fixture.state.failClear = true;
      await expect(
        service.verify({
          registrationToken: registration.registrationToken,
          otp: "123456",
        }),
      ).rejects.toMatchObject({ code: "REGISTRATION_RECOVERING" });
      const { rows } = await pool.query(
        "SELECT p.completed_at IS NOT NULL AS complete,p.registration_pending,u.id FROM public.profiles p JOIN auth.users u ON u.id=p.user_id WHERE u.email=$1",
        [address],
      );
      expect(rows[0]).toMatchObject({
        complete: true,
        registration_pending: true,
      });
      fixture.state.failClear = false;
      clock = new Date(clock.getTime() + 65 * 60000);
      await service.maintain();
      const after = await pool.query(
        "SELECT p.completed_at IS NOT NULL AS complete,p.registration_pending FROM public.profiles p WHERE p.user_id=$1",
        [rows[0].id],
      );
      expect(after.rows[0]).toEqual({
        complete: true,
        registration_pending: false,
      });
    });
    it("serializes finalization against cleanup and removes only unfinished identities", async () => {
      const address = email();
      const registration = await service.email({
        ...credentials(),
        email: address,
      });
      clock = new Date(clock.getTime() + 59 * 60000);
      await service.resend({
        registrationToken: registration.registrationToken,
      });
      clock = new Date(clock.getTime() + 60000);
      const hold = fixture.holdVerification();
      const verification = service.verify({
        registrationToken: registration.registrationToken,
        otp: "123456",
      });
      await hold.started; // Provider HTTP reached while finalization holds the identity lock.
      const maintenance = service.maintain();
      hold.release();
      await Promise.all([verification, maintenance]);
      const { rows } = await pool.query(
        "SELECT p.completed_at FROM public.profiles p JOIN auth.users u ON u.id=p.user_id WHERE u.email=$1",
        [address],
      );
      expect(rows).toHaveLength(1);
      expect(rows[0].completed_at).not.toBeNull();
      const abandoned = email();
      await service.email({ ...credentials(), email: abandoned });
      clock = new Date(clock.getTime() + 61 * 60000);
      await service.maintain();
      expect(
        (
          await pool.query("SELECT id FROM auth.users WHERE email=$1", [
            abandoned,
          ])
        ).rowCount,
      ).toBe(0);
    });
    it("does not delete unrelated Google identities with forged user-controlled flow metadata", async () => {
      const id = randomUUID();
      await pool.query(
        "INSERT INTO auth.users(id,email,raw_user_meta_data,raw_app_meta_data,created_at) VALUES($1,$2,$3,$4,$5)",
        [
          id,
          email(),
          { registration_flow: "email", registration_pending: true },
          { provider: "google" },
          new Date(clock.getTime() - 61 * 60000),
        ],
      );
      await service.maintain();
      expect(
        (await pool.query("SELECT id FROM auth.users WHERE id=$1", [id]))
          .rowCount,
      ).toBe(1);
    });
    it("refuses to claim an unrelated identity returned by a signup race", async () => {
      const id = randomUUID();
      await pool.query(
        "INSERT INTO auth.users(id,email,raw_app_meta_data) VALUES($1,$2,$3)",
        [id, email(), { provider: "google" }],
      );
      fixture.state.foreignSignupId = id;
      try {
        await expect(
          service.email({ ...credentials(), email: email() }),
        ).rejects.toMatchObject({ code: "EMAIL_TAKEN" });
      } finally {
        fixture.state.foreignSignupId = undefined;
      }
      clock = new Date(clock.getTime() + 61 * 60000);
      await service.maintain();
      expect(
        (await pool.query("SELECT id FROM auth.users WHERE id=$1", [id]))
          .rowCount,
      ).toBe(1);
    });
    it("reclaims only server-owned orphan Auth records after SMTP failure", async () => {
      const address = email();
      fixture.state.failMailAfterCreate = true;
      await expect(
        service.email({ ...credentials(), email: address }),
      ).rejects.toMatchObject({ code: "OTP_SEND_FAILED" });
      expect(
        (
          await pool.query("SELECT id FROM auth.users WHERE email=$1", [
            address,
          ])
        ).rowCount,
      ).toBe(1);
      fixture.state.failMailAfterCreate = false;
      const registration = await service.email({
        ...credentials(),
        email: address,
      });
      expect(
        (
          await service.verify({
            registrationToken: registration.registrationToken,
            otp: "123456",
          })
        ).access_token,
      ).not.toBe("");
    });
    it("prevents low privilege clients from forging completion or reading Auth secrets", async () => {
      const client = await pool.connect();
      try {
        await client.query("SET ROLE authenticated");
        await expect(
          client.query("UPDATE public.profiles SET registration_pending=false"),
        ).rejects.toMatchObject({ code: "42501" });
        await client.query("RESET ROLE");
        await client.query("SET ROLE app_server");
        await expect(
          client.query("SELECT raw_app_meta_data FROM auth.users"),
        ).rejects.toMatchObject({ code: "42501" });
        await expect(
          client.query("SELECT * FROM auth.users"),
        ).rejects.toMatchObject({ code: "42501" });
      } finally {
        await client.query("RESET ROLE");
        client.release();
      }
    });
    it("refuses a destructive rollback after new registrations exist", async () => {
      const client = await pool.connect();
      try {
        await expect(
          client.query(
            await readFile(
              "supabase/rollback/20261011000001_email_registration.sql",
              "utf8",
            ),
          ),
        ).rejects.toThrow("Rollback requires backup review");
      } finally {
        await client.query("ROLLBACK");
        client.release();
      }
    });
    it("serves registration over real Nest HTTP and gates incomplete sessions", async () => {
      @Controller("protected")
      class ProtectedController {
        @Get()
        @UseGuards(AccountActiveGuard)
        identity(@Req() request: { authUserId: string }) {
          return { userId: request.authUserId };
        }
      }
      const auth = new SupabaseAuth(
        fixture.url,
        "fake-public-key",
        "fake-server-key",
      );
      @Module({
        imports: [
          RegistrationModule.forRoot(
            new PostgresRegistrationStore(runtimePool),
            auth,
          ),
        ],
        controllers: [ProtectedController],
      })
      class HttpModule {}
      const app = await NestFactory.create(HttpModule, { logger: false });
      try {
        await app.listen(0, "127.0.0.1");
        const base = await app.getUrl();
        const post = async (path: string, body: unknown) =>
          fetch(base + path, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          });
        expect((await fetch(base + "/protected")).status).toBe(401);
        const invalid = await post("/auth/register/check", {
          ...credentials(),
          username: "FuCk",
        });
        expect(invalid.status).toBe(400);
        expect(await invalid.json()).toMatchObject({
          code: "USERNAME_FORBIDDEN",
          step: 1,
        });
        const input = credentials();
        const address = email();
        const check = await post("/auth/register/check", input);
        expect(await check.json()).toEqual({ step: 2 });
        const send = await post("/auth/register/email", {
          ...input,
          email: address,
        });
        const registration = (await send.json()) as {
          registrationToken: string;
        };
        expect(send.status).toBe(200);
        const directSession = await auth.verify(address, "123456");
        expect(
          (
            await fetch(base + "/protected", {
              headers: {
                Authorization: "Bearer " + directSession.access_token,
              },
            })
          ).status,
        ).toBe(403);
        const verified = await post("/auth/register/verify", {
          registrationToken: registration.registrationToken,
          otp: "123456",
        });
        expect(verified.status).toBe(200);
        const session = (await verified.json()) as { access_token: string };
        const protectedResponse = await fetch(base + "/protected", {
          headers: { Authorization: "Bearer " + session.access_token },
        });
        expect(protectedResponse.status).toBe(200);
        expect(await protectedResponse.json()).toEqual({
          userId: directSession.user.id,
        });
      } finally {
        await app.close();
      }
    });
    it("retries verification when a concurrent step-one revision changes the username lock key", async () => {
      const registration = await service.email({
        ...credentials(),
        email: email(),
      });
      const nextName = credentials().username;
      class RevisedDraftStore extends PostgresRegistrationStore {
        override async withLocks<T>(
          keys: string[],
          work: (
            store: import("./contracts.js").RegistrationStore,
          ) => Promise<T>,
        ): Promise<T> {
          await pool.query(
            "UPDATE xiangqi_auth.registration_drafts SET username=$1 WHERE token_hash=$2",
            [
              nextName,
              createHash("sha256")
                .update(registration.registrationToken)
                .digest("hex"),
            ],
          );
          return super.withLocks(keys, work);
        }
      }
      const revised = new RegistrationService(
        new RevisedDraftStore(runtimePool),
        service.auth,
        () => clock,
      );
      await expect(
        revised.verify({
          registrationToken: registration.registrationToken,
          otp: "123456",
        }),
      ).rejects.toMatchObject({ code: "REGISTRATION_CHANGED", step: 3 });
      expect(
        (
          await service.verify({
            registrationToken: registration.registrationToken,
            otp: "123456",
          })
        ).access_token,
      ).not.toBe("");
    });
    it("returns mail failures without leaking provider response data", async () => {
      fixture.state.failMail = true;
      await expect(
        service.email({ ...credentials(), email: email() }),
      ).rejects.toMatchObject({
        code: "OTP_SEND_FAILED",
        message: "Không gửi được mã, vui lòng thử lại sau",
      });
      fixture.state.failMail = false;
    });
  },
);
