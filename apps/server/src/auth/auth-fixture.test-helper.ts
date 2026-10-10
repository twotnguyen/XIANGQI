import { createServer } from "node:http";
import { randomUUID } from "node:crypto";
import type { Pool } from "pg";

// An isolated provider boundary; real HTTP adapter + PostgreSQL remain under test.
export async function startAuthFixture(pool: Pool, now: () => Date) {
  const state = {
    sent: 0,
    failMail: false,
    failMailAfterCreate: false,
    foreignSignupId: undefined as string | undefined,
    failClear: false,
    failVerifyAfterConfirm: false,
    limited: false,
  };
  const sessions = new Map<string, string>();
  const passwords = new Map<string, string>();
  let verifyGate: { started: () => void; wait: Promise<void> } | undefined;
  const server = createServer(async (request, response) => {
    const respond = (status: number, body: unknown) => {
      response.writeHead(status, { "Content-Type": "application/json" });
      response.end(JSON.stringify(body));
    };
    try {
      let raw = "";
      for await (const chunk of request) raw += String(chunk);
      const body = raw ? JSON.parse(raw) : {};
      const path = request.url;
      if (path === "/auth/v1/signup") {
        if (state.foreignSignupId)
          return respond(200, { id: state.foreignSignupId });
        if (state.failMail)
          return respond(500, { msg: "fake-sensitive-fixture" });
        const id = randomUUID();
        await pool.query(
          "INSERT INTO auth.users(id,email,raw_user_meta_data,raw_app_meta_data,created_at) VALUES($1,$2,$3,$4,$5)",
          [
            id,
            body.email,
            body.data,
            { provider: "email", registration_pending: true },
            now(),
          ],
        );
        passwords.set(id, body.password);
        if (state.failMailAfterCreate)
          return respond(500, { msg: "fake-sensitive-fixture" });
        state.sent++;
        return respond(200, { id, email: body.email });
      }
      if (path === "/auth/v1/resend") {
        if (state.failMail)
          return respond(500, { msg: "fake-sensitive-fixture" });
        state.sent++;
        return respond(200, {});
      }
      if (path === "/auth/v1/token?grant_type=password") {
        const { rows } = await pool.query(
          "SELECT id,email,email_confirmed_at,raw_app_meta_data AS app_metadata FROM auth.users WHERE email=$1",
          [body.email],
        );
        const user = rows[0];
        if (
          !user?.email_confirmed_at ||
          passwords.get(user.id) !== body.password
        )
          return respond(400, {
            error_code: "invalid_credentials",
            msg: "fake-sensitive-fixture",
          });
        const access = randomUUID();
        sessions.set(access, user.id);
        return respond(200, {
          access_token: access,
          refresh_token: randomUUID(),
          expires_in: 3600,
          user,
        });
      }
      if (path === "/auth/v1/verify") {
        if (verifyGate) {
          const gate = verifyGate;
          verifyGate = undefined;
          gate.started();
          await gate.wait;
        }
        if (state.limited)
          return respond(429, {
            error_code: "over_request_rate_limit",
            msg: "fake-sensitive-fixture",
          });
        if (body.token !== "123456")
          return respond(403, {
            error_code: "otp_expired",
            msg: "fake-sensitive-fixture",
          });
        const { rows } = await pool.query(
          "UPDATE auth.users SET email_confirmed_at=$2 WHERE email=$1 AND email_confirmed_at IS NULL RETURNING id,email,email_confirmed_at,raw_app_meta_data AS app_metadata",
          [body.email, now()],
        );
        const user = rows[0];
        if (!user)
          return respond(403, {
            error_code: "otp_expired",
            msg: "fake-sensitive-fixture",
          });
        if (state.failVerifyAfterConfirm)
          return respond(500, { msg: "fake-sensitive-fixture" });
        const access = randomUUID();
        sessions.set(access, user.id);
        return respond(200, {
          access_token: access,
          refresh_token: randomUUID(),
          expires_in: 3600,
          user,
        });
      }
      if (path === "/auth/v1/user") {
        const token = request.headers.authorization?.replace("Bearer ", "");
        const id = token && sessions.get(token);
        const { rows } = await pool.query(
          "SELECT id,email,email_confirmed_at,raw_app_meta_data AS app_metadata FROM auth.users WHERE id=$1",
          [id],
        );
        return respond(rows[0] ? 200 : 401, rows[0] ?? { msg: "Unauthorized" });
      }
      const id = path?.split("/").at(-1);
      if (path?.startsWith("/auth/v1/admin/users/")) {
        if (request.method === "DELETE") {
          await pool.query("DELETE FROM auth.users WHERE id=$1", [id]);
          return respond(200, {});
        }
        if (body.password && id) passwords.set(id, body.password);
        if (state.failClear && body.app_metadata)
          return respond(500, { msg: "fake-sensitive-fixture" });
        if (body.app_metadata)
          await pool.query(
            "UPDATE auth.users SET raw_app_meta_data=raw_app_meta_data || $2::jsonb WHERE id=$1",
            [id, JSON.stringify(body.app_metadata)],
          );
        return respond(200, {});
      }
      respond(404, {});
    } catch {
      respond(500, { msg: "fixture_error" });
    }
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  if (!address || typeof address === "string")
    throw new Error("Fixture address unavailable");
  return {
    state,
    url: `http://127.0.0.1:${address.port}`,
    holdVerification: () => {
      let started!: () => void;
      let release!: () => void;
      const start = new Promise<void>((resolve) => {
        started = resolve;
      });
      const wait = new Promise<void>((resolve) => {
        release = resolve;
      });
      verifyGate = { started, wait };
      return { started: start, release };
    },
    close: () =>
      new Promise<void>((resolve, reject) =>
        server.close((error) => (error ? reject(error) : resolve())),
      ),
  };
}
