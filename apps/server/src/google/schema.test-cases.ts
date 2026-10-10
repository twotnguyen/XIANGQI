import { createApp } from "../app.js";
import { createGoogleRuntime } from "../google-runtime.js";
import { SupabaseAuth } from "../auth/supabase-auth.js";
import { SessionService } from "../login/session.service.js";
import { PostgresLoginStore } from "../login/postgres-login-store.js";
import { PostgresRegistrationStore } from "../auth/postgres-store.js";
import { RegistrationModule } from "../auth/registration.module.js";
import { readFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { beforeAll, describe, expect, it } from "vitest";
import {
  apply,
  asRole,
  baseline,
  databaseUrl,
  pool,
} from "./database.test-helper.js";
const migration = "supabase/migrations/20261011000005_google_guest.sql";
const rollback = "supabase/rollback/20261011000005_google_guest.sql";
async function restore() {
  const c = await pool.connect();
  try {
    await c.query(await readFile(rollback, "utf8"));
  } finally {
    await c.query("ROLLBACK");
    c.release();
  }
}
describe.skipIf(!databaseUrl)(
  "Google/Guest migration on full audited synthetic baseline",
  () => {
    let legacy: string;
    const constraints = async () =>
      (
        await pool.query(
          `SELECT conrelid::regclass::text,conname,pg_get_constraintdef(oid) AS definition FROM pg_constraint WHERE contype='f' AND conrelid IN ('public.profiles'::regclass,'xiangqi_realtime.tabs'::regclass,'xiangqi_realtime.receipts'::regclass,'xiangqi_auth.app_sessions'::regclass) ORDER BY conrelid::regclass::text,conname`,
        )
      ).rows;
    let before: unknown[];
    beforeAll(async () => {
      await baseline();
      legacy = randomUUID();
      await pool.query(
        "INSERT INTO auth.users(id,email,email_confirmed_at,raw_app_meta_data) VALUES($1,'legacy@example.invalid',now(),'{\"provider\":\"email\"}')",
        [legacy],
      );
      before = await constraints();
      await apply(migration);
    });
    it("round trips exact FK metadata before any new actors and refuses rollback after writes", async () => {
      await restore();
      expect(await constraints()).toEqual(before);
      await apply(migration);
      const id = randomUUID();
      await pool.query(
        "INSERT INTO auth.users(id,email,raw_app_meta_data) VALUES($1,'rollback-guard@example.invalid','{\"provider\":\"email\"}')",
        [id],
      );
      await expect(restore()).rejects.toThrow(/new actors/);
      await pool.query("DELETE FROM auth.users WHERE id=$1", [id]);
    });
    it("rejects direct Google linking with whole transaction rollback before provider/session mutation", async () => {
      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        await expect(
          client.query(
            "INSERT INTO auth.identities(id,user_id,provider,provider_id) VALUES($1,$2,'google','external-subject')",
            [randomUUID(), legacy],
          ),
        ).rejects.toThrow(/email origin/);
        await expect(
          client.query(
            'UPDATE auth.users SET raw_app_meta_data=\'{"provider":"google"}\' WHERE id=$1',
            [legacy],
          ),
        ).rejects.toMatchObject({ code: "25P02" });
      } finally {
        await client.query("ROLLBACK");
        client.release();
      }
      expect(
        (
          await pool.query(
            "SELECT method FROM xiangqi_auth.account_origins WHERE user_id=$1",
            [legacy],
          )
        ).rows[0].method,
      ).toBe("email");
      expect(
        (
          await pool.query(
            "SELECT raw_app_meta_data->>'provider' AS provider FROM auth.users WHERE id=$1",
            [legacy],
          )
        ).rows[0].provider,
      ).toBe("email");
    });
    it("creates Google provenance from app metadata and rejects forged user metadata / identity reassignment", async () => {
      const google = randomUUID(),
        forged = randomUUID(),
        identity = randomUUID();
      await pool.query(
        "INSERT INTO auth.users(id,email,raw_app_meta_data) VALUES($1,'google@example.invalid','{\"provider\":\"google\"}')",
        [google],
      );
      await pool.query(
        'INSERT INTO auth.users(id,email,raw_app_meta_data,raw_user_meta_data) VALUES($1,\'forged@example.invalid\',\'{"provider":"email"}\',\'{"provider":"google"}\')',
        [forged],
      );
      await pool.query(
        "INSERT INTO auth.identities(id,user_id,provider,provider_id) VALUES($1,$2,'google','google-subject')",
        [identity, google],
      );
      await expect(
        pool.query("UPDATE auth.identities SET user_id=$2 WHERE id=$1", [
          identity,
          forged,
        ]),
      ).rejects.toThrow();
      await expect(
        pool.query("UPDATE auth.identities SET provider='email' WHERE id=$1", [
          identity,
        ]),
      ).rejects.toThrow();
      await expect(
        pool.query(
          "UPDATE xiangqi_auth.principals SET kind='guest',auth_user_id=NULL WHERE id=$1",
          [google],
        ),
      ).rejects.toThrow(/immutable/);
    });
    it("allows guest realtime references without Auth account while keeping app sessions member-only", async () => {
      const guest = randomUUID(),
        room = randomUUID();
      await asRole("app_server", async (c) => {
        await c.query(
          "INSERT INTO xiangqi_auth.principals(id,kind) VALUES($1,'guest')",
          [guest],
        );
        await c.query(
          "INSERT INTO public.profiles(user_id,username,display_name) VALUES($1,$2,'Khách thử')",
          [guest, "g" + guest.replaceAll("-", "").slice(0, 19)],
        );
        await c.query(
          "INSERT INTO public.rooms(id,owner_id,name) VALUES($1,$2,'Fixture')",
          [room, guest],
        );
        await c.query(
          "INSERT INTO xiangqi_realtime.tabs(user_id,room_id,tab_id) VALUES($1,$2,$3)",
          [guest, room, randomUUID()],
        );
        await c.query(
          "INSERT INTO xiangqi_realtime.receipts(user_id,room_id,command_id,fingerprint,response) VALUES($1,$2,$3,$4,'{}')",
          [guest, room, randomUUID(), "a".repeat(64)],
        );
        await expect(
          c.query(
            "INSERT INTO xiangqi_auth.app_sessions(token_hash,user_id,created_at,expires_at,remember) VALUES($1,$2,now(),now()+interval '12 hours',false)",
            ["a".repeat(64), guest],
          ),
        ).rejects.toMatchObject({ code: "23503" });
      });
      expect(
        (
          await pool.query(
            "SELECT count(*)::int n FROM auth.users WHERE id=$1",
            [guest],
          )
        ).rows[0].n,
      ).toBe(0);
    });
    it("denies public ledgers and immutable origin changes without widening auth grants", async () => {
      for (const role of ["anon", "authenticated"] as const)
        await asRole(role, async (c) => {
          await expect(
            c.query("SELECT * FROM xiangqi_auth.account_origins"),
          ).rejects.toMatchObject({ code: "42501" });
        });
      await asRole("app_server", async (c) => {
        await expect(
          c.query(
            "UPDATE xiangqi_auth.account_origins SET method='google' WHERE user_id=$1",
            [legacy],
          ),
        ).rejects.toThrow();
        expect(
          (
            await c.query(
              "SELECT has_schema_privilege(current_user,'auth','USAGE') allowed",
            )
          ).rows[0].allowed,
        ).toBe(false);
      });
    });
    it("boots the configured Google module against the audited database and creates a cookie-bound challenge", async () => {
      // No provider call or real OAuth occurs: this gate verifies runtime SQL readiness and native HTTP wiring.
      const auth = new SupabaseAuth(
        "http://127.0.0.1:1",
        "synthetic-public",
        "synthetic-server",
      );
      const registration = {
        module: RegistrationModule.forRoot(
          new PostgresRegistrationStore(pool),
          auth,
        ),
        auth,
        pool,
        sessions: new SessionService(new PostgresLoginStore(pool), auth),
        checkDatabase: async () => {
          await pool.query("SELECT 1");
        },
        close: async () => {},
      };
      const runtime = await createGoogleRuntime(
        {
          AUTH_GOOGLE_ENABLED: "true",
          AUTH_LOGIN_ENABLED: "true",
          GOOGLE_CLIENT_ID: "synthetic-google-client",
          NODE_ENV: "test",
        },
        registration,
      );
      const app = await createApp(["http://localhost:5174"], [runtime!.module]);
      try {
        await app.listen(0, "127.0.0.1");
        const address = app.getHttpServer().address();
        const response = await fetch(
          `http://127.0.0.1:${address.port}/auth/google/challenge`,
          {
            method: "POST",
            headers: {
              Origin: "http://localhost:5174",
              "Content-Type": "application/json",
            },
            body: "{}",
          },
        );
        expect(response.status).toBe(200);
        const body = await response.json();
        expect(Object.keys(body).sort()).toEqual([
          "clientId",
          "expiresAt",
          "nonce",
        ]);
        expect(body.clientId).toBe("synthetic-google-client");
        expect(response.headers.get("set-cookie")).toContain(
          "xiangqi_google_challenge=",
        );
        expect(response.headers.get("set-cookie")).toContain("HttpOnly");
        expect(
          (
            await pool.query(
              "SELECT consumed_at,nonce_hash FROM xiangqi_auth.google_challenges WHERE token_hash=$1",
              [body.nonce],
            )
          ).rows[0],
        ).toEqual({ consumed_at: null, nonce_hash: body.nonce });
      } finally {
        await app.close();
      }
    });
  },
);
it.skipIf(!databaseUrl)(
  "rejects member principals without their Auth reference",
  async () => {
    await asRole("app_server", async (c) => {
      await expect(
        c.query(
          "INSERT INTO xiangqi_auth.principals(id,kind) VALUES($1,'member')",
          [randomUUID()],
        ),
      ).rejects.toMatchObject({ code: "23514" });
    });
  },
);

it.skipIf(!databaseUrl).each([migration, rollback])(
  "rejects temporary catalog shadowing in %s",
  async (path) => {
    await baseline();
    if (path === rollback) await apply(migration);
    const client = await pool.connect();
    try {
      // Rollback needs the isolated Auth table owner; production permissions are unchanged.
      if (path === migration) await client.query("SET ROLE postgres");
      await client.query(
        "CREATE TEMP TABLE pg_constraint AS SELECT * FROM pg_catalog.pg_constraint",
      );
      await client.query(
        "ALTER TABLE public.profiles RENAME CONSTRAINT profiles_user_id_fkey TO saved_audited_reference; ALTER TABLE public.profiles ADD CONSTRAINT profiles_user_id_fkey CHECK(true)",
      );
      await expect(client.query(await readFile(path, "utf8"))).rejects.toThrow(
        /references/i,
      );
    } finally {
      await client.query("ROLLBACK");
      await client.query("DROP TABLE IF EXISTS pg_temp.pg_constraint");
      await client.query("RESET ROLE");
      client.release();
    }
  },
);
