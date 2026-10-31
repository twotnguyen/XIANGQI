import { createServer } from "node:http";
import { randomUUID } from "node:crypto";
import type { Pool } from "pg";
import { SignJWT, exportJWK, generateKeyPair } from "jose";

export interface AuthFixture {
  state: {
    sent: number;
    refreshRequests: number;
    failRefresh: boolean;
    failMail: boolean;
    failMailAfterCreate: boolean;
    foreignSignupId: string | undefined;
    failClear: boolean;
    failVerifyAfterConfirm: boolean;
    limited: boolean;
    failPasswordUpdate: boolean;
    rejectPasswordUpdate: boolean;
    failPasswordUpdateAfterWrite: boolean;
    failPasswordSession: boolean;
  };
  url: string;
  holdVerification(): { started: Promise<void>; release(): void };
  holdPasswordUpdate(): { started: Promise<void>; release(): void };
  close(): Promise<void>;
}

// An isolated provider boundary; real HTTP adapter + PostgreSQL remain under test.
export async function startAuthFixture(
  pool: Pool,
  now: () => Date,
): Promise<AuthFixture> {
  const state = {
    sent: 0,
    refreshRequests: 0,
    failRefresh: false,
    failMail: false,
    failMailAfterCreate: false,
    foreignSignupId: undefined as string | undefined,
    failClear: false,
    failVerifyAfterConfirm: false,
    limited: false,
    failPasswordUpdate: false,
    rejectPasswordUpdate: false,
    failPasswordUpdateAfterWrite: false,
    failPasswordSession: false,
  };
  const sessions = new Map<string, string>();
  const passwords = new Map<string, string>();
  const refreshTokens = new Map<string, string>();
  const blockedPasswordSessions = new Set<string>();
  const { privateKey, publicKey } = await generateKeyPair("ES256");
  const kid = randomUUID();
  const jwks = {
    keys: [{ ...(await exportJWK(publicKey)), kid, alg: "ES256", use: "sig" }],
  };
  // Đặt sau khi server listen; issueSession chỉ được gọi từ handler.
  let issuer = "";
  async function issueSession(user: { id: string; email: string }) {
    const access = await new SignJWT({
      email: user.email,
      role: "authenticated",
    })
      .setProtectedHeader({ alg: "ES256", kid })
      .setSubject(user.id)
      .setAudience("authenticated")
      .setIssuer(issuer)
      .setIssuedAt()
      .setExpirationTime("3600s")
      .sign(privateKey);
    const refresh = randomUUID();
    sessions.set(access, user.id);
    refreshTokens.set(refresh, user.id);
    return {
      access_token: access,
      refresh_token: refresh,
      expires_in: 3600,
      user,
    };
  }
  let verifyGate: { started: () => void; wait: Promise<void> } | undefined;
  let passwordGate: { started: () => void; wait: Promise<void> } | undefined;
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
      if (path === "/auth/v1/.well-known/jwks.json") return respond(200, jwks);
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
        if (state.failPasswordSession && blockedPasswordSessions.has(user?.id))
          return respond(503, { msg: "fake-sensitive-fixture" });
        if (
          !user?.email_confirmed_at ||
          passwords.get(user.id) !== body.password
        )
          return respond(400, {
            error_code: "invalid_credentials",
            msg: "fake-sensitive-fixture",
          });
        return respond(200, await issueSession(user));
      }
      if (path === "/auth/v1/token?grant_type=refresh_token") {
        state.refreshRequests++;
        if (state.failRefresh)
          return respond(503, { msg: "fake-sensitive-fixture" });
        const id =
          typeof body.refresh_token === "string" &&
          refreshTokens.get(body.refresh_token);
        const { rows } = await pool.query(
          "SELECT id,email,email_confirmed_at,raw_app_meta_data AS app_metadata FROM auth.users WHERE id=$1",
          [id || null],
        );
        if (!rows[0]?.email_confirmed_at)
          return respond(400, {
            error_code: "refresh_token_not_found",
            msg: "fake-sensitive-fixture",
          });
        refreshTokens.delete(body.refresh_token);
        return respond(200, await issueSession(rows[0]));
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
        return respond(200, await issueSession(user));
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
        if (typeof body.password === "string" && id) {
          if (passwordGate) {
            const gate = passwordGate;
            passwordGate = undefined;
            gate.started();
            await gate.wait;
          }
          if (state.failPasswordUpdate)
            return respond(503, { msg: "fake-sensitive-fixture" });
          if (state.rejectPasswordUpdate)
            return respond(422, {
              error_code: "weak_password",
              msg: "fake-sensitive-fixture",
            });
          passwords.set(id, body.password);
          if (state.failPasswordSession) blockedPasswordSessions.add(id);
          for (const [refresh, owner] of refreshTokens) {
            if (owner === id) refreshTokens.delete(refresh);
          }
          if (state.failPasswordUpdateAfterWrite)
            return respond(503, { msg: "fake-sensitive-fixture" });
        }
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
  const listening = Promise.withResolvers<void>();
  server.listen(0, "127.0.0.1", listening.resolve);
  await listening.promise;
  const address = server.address();
  if (!address || typeof address === "string")
    throw new Error("Fixture address unavailable");
  const url = `http://127.0.0.1:${address.port}`;
  issuer = `${url}/auth/v1`;
  return {
    state,
    url,
    holdPasswordUpdate: () => {
      const started = Promise.withResolvers<void>();
      const release = Promise.withResolvers<void>();
      passwordGate = { started: started.resolve, wait: release.promise };
      return { started: started.promise, release: release.resolve };
    },
    holdVerification: () => {
      const started = Promise.withResolvers<void>();
      const release = Promise.withResolvers<void>();
      verifyGate = { started: started.resolve, wait: release.promise };
      return { started: started.promise, release: release.resolve };
    },
    close: () => {
      const closed = Promise.withResolvers<void>();
      server.close((error) =>
        error ? closed.reject(error) : closed.resolve(),
      );
      return closed.promise;
    },
  };
}
