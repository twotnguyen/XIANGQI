import { afterEach, describe, expect, it } from "vitest";
import { createServer, type Server } from "node:http";
import { exportJWK, generateKeyPair, SignJWT, type CryptoKey } from "jose";
import { SupabaseAuth } from "@server/account/auth/supabase-auth.js";

const JWKS_PATH = "/auth/v1/.well-known/jwks.json";
const PROVIDER_MESSAGE = "Dịch vụ xác thực chưa thể xử lý yêu cầu";
const SESSION_MESSAGE = "Phiên đăng nhập không hợp lệ";

type Claims = Record<string, unknown>;

const servers: Server[] = [];
afterEach(async () => {
  await Promise.all(
    servers.splice(0).map((server) => {
      if (!server.listening) return undefined;
      const closed = Promise.withResolvers<void>();
      server.close((error) =>
        error ? closed.reject(error) : closed.resolve(),
      );
      return closed.promise;
    }),
  );
});

async function startJwks(): Promise<TestJwks> {
  const signer = await generateKeyPair("ES256");
  const other = await generateKeyPair("ES256");
  const kid = "key-current";
  const jwks = {
    keys: [
      { ...(await exportJWK(signer.publicKey)), kid, alg: "ES256", use: "sig" },
    ],
  };
  const hits: string[] = [];
  let status = 200;
  const server = createServer((request, response) => {
    hits.push(request.url ?? "");
    if (request.url !== JWKS_PATH) {
      response.writeHead(404).end();
      return;
    }
    if (status !== 200) {
      response.writeHead(status).end("{}");
      return;
    }
    response
      .writeHead(200, { "Content-Type": "application/json" })
      .end(JSON.stringify(jwks));
  });
  const listening = Promise.withResolvers<void>();
  server.listen(0, "127.0.0.1", listening.resolve);
  await listening.promise;
  servers.push(server);
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("no address");
  const url = `http://127.0.0.1:${address.port}`;
  return {
    url,
    signer: signer.privateKey,
    other: other.privateKey,
    kid,
    hits,
    setStatus: (next: number) => {
      status = next;
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

interface TestJwks {
  url: string;
  signer: CryptoKey;
  other: CryptoKey;
  kid: string;
  hits: string[];
  setStatus: (status: number) => void;
  close: () => Promise<void>;
}

function validClaims(jwks: TestJwks, overrides: Claims = {}): Claims {
  const now = Math.floor(Date.now() / 1000);
  return {
    iss: `${jwks.url}/auth/v1`,
    aud: "authenticated",
    sub: "11111111-1111-4111-8111-111111111111",
    email: "player@example.com",
    role: "authenticated",
    iat: now,
    exp: now + 3600,
    ...overrides,
  };
}

// An explicit `undefined` override removes the claim from the signed payload.
function sign(
  claims: Claims,
  key: CryptoKey,
  kid: string | undefined,
): Promise<string> {
  return new SignJWT(claims)
    .setProtectedHeader({ alg: "ES256", kid })
    .sign(key);
}

function base64url(value: unknown): string {
  return Buffer.from(JSON.stringify(value)).toString("base64url");
}

function expectSessionInvalid(promise: Promise<unknown>) {
  return expect(promise).rejects.toMatchObject({
    code: "SESSION_INVALID",
    status: 401,
    message: SESSION_MESSAGE,
  });
}

describe("SupabaseAuth.verifyAccessToken", () => {
  it("accepts a correctly signed ES256 token and returns only userId and email", async () => {
    const jwks = await startJwks();
    const auth = new SupabaseAuth(jwks.url, "pub", "secret");
    const token = await sign(validClaims(jwks), jwks.signer, jwks.kid);

    await expect(auth.verifyAccessToken(token)).resolves.toEqual({
      userId: "11111111-1111-4111-8111-111111111111",
      email: "player@example.com",
    });
  });

  it("rejects a tampered payload that keeps the original signature", async () => {
    const jwks = await startJwks();
    const auth = new SupabaseAuth(jwks.url, "pub", "secret");
    const token = await sign(validClaims(jwks), jwks.signer, jwks.kid);
    const [header, , signature] = token.split(".");
    const forged = base64url(
      validClaims(jwks, { sub: "22222222-2222-4222-8222-222222222222" }),
    );

    await expectSessionInvalid(
      auth.verifyAccessToken(`${header}.${forged}.${signature}`),
    );
  });

  it("rejects a token signed by a different key under the trusted kid", async () => {
    const jwks = await startJwks();
    const auth = new SupabaseAuth(jwks.url, "pub", "secret");
    const token = await sign(validClaims(jwks), jwks.other, jwks.kid);

    await expectSessionInvalid(auth.verifyAccessToken(token));
  });

  it("never trusts a token-supplied key URL even when the attacker key uses the trusted kid", async () => {
    const trusted = await startJwks();
    const attacker = await startJwks();
    const auth = new SupabaseAuth(trusted.url, "pub", "secret");
    const token = await new SignJWT(validClaims(trusted))
      .setProtectedHeader({
        alg: "ES256",
        kid: trusted.kid,
        jku: `${attacker.url}${JWKS_PATH}`,
      })
      .sign(attacker.signer);

    await expectSessionInvalid(auth.verifyAccessToken(token));
    expect(attacker.hits).toEqual([]);
  });

  it.each([
    ["wrong issuer", { iss: "https://evil.example/auth/v1" }],
    ["wrong audience", { aud: "anon" }],
    ["privileged service role", { role: "service_role" }],
    ["missing role", { role: undefined }],
    ["expired exp", { exp: Math.floor(Date.now() / 1000) - 10 }],
    ["not yet valid nbf", { nbf: Math.floor(Date.now() / 1000) + 3600 }],
    ["missing exp", { exp: undefined }],
    ["missing iat", { iat: undefined }],
    ["missing sub", { sub: undefined }],
    ["empty sub", { sub: "" }],
    ["missing email", { email: undefined }],
    ["empty email", { email: "" }],
    ["non-string email", { email: 123 }],
  ])("rejects a token with %s", async (_label, overrides) => {
    const jwks = await startJwks();
    const auth = new SupabaseAuth(jwks.url, "pub", "secret");
    const token = await sign(
      validClaims(jwks, overrides),
      jwks.signer,
      jwks.kid,
    );

    await expectSessionInvalid(auth.verifyAccessToken(token));
  });

  it("rejects an unsigned alg none token", async () => {
    const jwks = await startJwks();
    const auth = new SupabaseAuth(jwks.url, "pub", "secret");
    const token = `${base64url({ alg: "none", kid: jwks.kid })}.${base64url(validClaims(jwks))}.`;

    await expectSessionInvalid(auth.verifyAccessToken(token));
  });

  it("rejects an HS256 token even when it is correctly MAC-signed", async () => {
    const jwks = await startJwks();
    const auth = new SupabaseAuth(jwks.url, "pub", "secret");
    const hmacKey = new TextEncoder().encode(
      "test-only-hmac-material-0123456789abcdef",
    );
    const token = await new SignJWT(validClaims(jwks))
      .setProtectedHeader({ alg: "HS256", kid: jwks.kid })
      .sign(hmacKey);

    await expectSessionInvalid(auth.verifyAccessToken(token));
  });

  it("rejects a token without a kid header", async () => {
    const jwks = await startJwks();
    const auth = new SupabaseAuth(jwks.url, "pub", "secret");
    const token = await sign(validClaims(jwks), jwks.signer, undefined);

    await expectSessionInvalid(auth.verifyAccessToken(token));
  });

  it("rejects a token whose kid is not in the JWKS", async () => {
    const jwks = await startJwks();
    const auth = new SupabaseAuth(jwks.url, "pub", "secret");
    const token = await sign(validClaims(jwks), jwks.signer, "unknown-kid");

    await expectSessionInvalid(auth.verifyAccessToken(token));
  });

  it("rejects malformed input", async () => {
    const jwks = await startJwks();
    const auth = new SupabaseAuth(jwks.url, "pub", "secret");

    await expectSessionInvalid(auth.verifyAccessToken("abc"));
    await expectSessionInvalid(auth.verifyAccessToken(""));
  });

  it("maps a cold JWKS failure to a provider error without leaking details", async () => {
    const jwks = await startJwks();
    jwks.setStatus(500);
    const auth = new SupabaseAuth(jwks.url, "pub", "secret");
    const token = await sign(validClaims(jwks), jwks.signer, jwks.kid);

    const error = await auth.verifyAccessToken(token).catch((caught) => caught);
    expect(error).toMatchObject({
      code: "AUTH_PROVIDER_ERROR",
      status: 503,
      message: PROVIDER_MESSAGE,
    });
    expect(String(error.message)).not.toContain(jwks.url);
  });

  it("maps an unreachable JWKS endpoint to a provider error", async () => {
    const jwks = await startJwks();
    await jwks.close();
    const auth = new SupabaseAuth(jwks.url, "pub", "secret");
    const token = await sign(validClaims(jwks), jwks.signer, jwks.kid);

    await expect(auth.verifyAccessToken(token)).rejects.toMatchObject({
      code: "AUTH_PROVIDER_ERROR",
      status: 503,
      message: PROVIDER_MESSAGE,
    });
  });

  it("keeps verifying from the warm key cache after the JWKS server goes away", async () => {
    const jwks = await startJwks();
    const auth = new SupabaseAuth(jwks.url, "pub", "secret");
    const first = await sign(validClaims(jwks), jwks.signer, jwks.kid);
    await auth.verifyAccessToken(first);

    await jwks.close();
    const second = await sign(
      validClaims(jwks, { sub: "33333333-3333-4333-8333-333333333333" }),
      jwks.signer,
      jwks.kid,
    );
    await expect(auth.verifyAccessToken(second)).resolves.toMatchObject({
      userId: "33333333-3333-4333-8333-333333333333",
    });
  });

  it("denies an expired token even with a warm key cache", async () => {
    const jwks = await startJwks();
    const auth = new SupabaseAuth(jwks.url, "pub", "secret");
    await auth.verifyAccessToken(
      await sign(validClaims(jwks), jwks.signer, jwks.kid),
    );

    const expired = await sign(
      validClaims(jwks, { exp: Math.floor(Date.now() / 1000) - 1 }),
      jwks.signer,
      jwks.kid,
    );
    await expectSessionInvalid(auth.verifyAccessToken(expired));
  });

  it("never calls the Auth user endpoint to verify a token", async () => {
    const jwks = await startJwks();
    const auth = new SupabaseAuth(jwks.url, "pub", "secret");
    await auth.verifyAccessToken(
      await sign(validClaims(jwks), jwks.signer, jwks.kid),
    );

    expect(jwks.hits.every((path) => path === JWKS_PATH)).toBe(true);
  });
});
