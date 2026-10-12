import { createServer } from "node:http";
import {
  createLocalJWKSet,
  createRemoteJWKSet,
  exportJWK,
  generateKeyPair,
  SignJWT,
} from "jose";
import { beforeAll, describe, expect, it } from "vitest";
import { GoogleTokenVerifier } from "./google-verifier.js";

describe("Google ID token signature boundary", () => {
  let pair: Awaited<ReturnType<typeof generateKeyPair>>;
  let verifier: GoogleTokenVerifier;
  const clientId = "synthetic-client.apps.googleusercontent.com";
  const claims = {
    aud: clientId,
    iss: "https://accounts.google.com",
    sub: "synthetic-google-subject",
    email: "synthetic@example.invalid",
    email_verified: true,
    nonce: "synthetic-nonce",
    exp: Math.floor(Date.now() / 1000) + 3600,
  };
  beforeAll(async () => {
    pair = await generateKeyPair("RS256");
    verifier = new GoogleTokenVerifier(
      clientId,
      createLocalJWKSet({
        keys: [{ ...(await exportJWK(pair.publicKey)), kid: "fixture" }],
      }),
    );
  });
  async function token(overrides: Record<string, unknown> = {}) {
    return new SignJWT({ ...claims, ...overrides })
      .setProtectedHeader({ alg: "RS256", kid: "fixture" })
      .sign(pair.privateKey);
  }
  it("accepts a signed token only for the configured audience and projects verified claims", async () => {
    expect(
      await verifier.verify(await token({ name: "Never copy this name" })),
    ).toEqual(claims);
  });
  it.each([
    { aud: "another-client" },
    { aud: [clientId, "another-client"] },
    { iss: "https://untrusted.example.invalid" },
    { exp: Math.floor(Date.now() / 1000) },
    { email_verified: false },
    { nonce: null },
    { sub: "" },
    { email: null },
  ])("rejects signed tokens with invalid claims %j", async (overrides) => {
    await expect(verifier.verify(await token(overrides))).rejects.toMatchObject(
      { status: 401 },
    );
  });
  it("rejects a forged signature and malformed input without disclosing token contents", async () => {
    const forged = await generateKeyPair("RS256");
    const credential = await new SignJWT(claims)
      .setProtectedHeader({ alg: "RS256", kid: "fixture" })
      .sign(forged.privateKey);
    for (const value of [credential, "not-a-token", "a".repeat(16385)]) {
      await expect(verifier.verify(value)).rejects.toMatchObject({
        status: 401,
        message: "Xác thực Google không hợp lệ",
      });
    }
  });
  it("rejects algorithm substitution even when the claims look valid", async () => {
    const credential = await new SignJWT(claims)
      .setProtectedHeader({ alg: "HS256", kid: "fixture" })
      .sign(new Uint8Array(32));
    await expect(verifier.verify(credential)).rejects.toMatchObject({
      status: 401,
    });
  });
  it("reports a bounded public-key service timeout as retryable without provider text", async () => {
    const server = createServer(() => {});
    await new Promise<void>((resolve) =>
      server.listen(0, "127.0.0.1", resolve),
    );
    try {
      const address = server.address();
      if (!address || typeof address === "string")
        throw new Error("Fixture address unavailable");
      const remote = new GoogleTokenVerifier(
        clientId,
        createRemoteJWKSet(new URL(`http://127.0.0.1:${address.port}/keys`), {
          timeoutDuration: 30,
        }),
      );
      await expect(remote.verify(await token())).rejects.toMatchObject({
        status: 503,
        message: "Chưa thể xác thực Google, vui lòng thử lại",
      });
    } finally {
      server.closeAllConnections();
      await new Promise<void>((resolve, reject) =>
        server.close((error) => (error ? reject(error) : resolve())),
      );
    }
  });
});
