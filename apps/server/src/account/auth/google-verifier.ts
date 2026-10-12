import {
  createRemoteJWKSet,
  errors,
  jwtVerify,
  type JWTVerifyGetKey,
} from "jose";

const googleKeys = createRemoteJWKSet(
  new URL("https://www.googleapis.com/oauth2/v3/certs"),
  {
    timeoutDuration: 2500,
    cooldownDuration: 30000,
    cacheMaxAge: 600000,
  },
);
class VerificationError extends Error {
  constructor(public readonly status: 401 | 503) {
    super(
      status === 401
        ? "Xác thực Google không hợp lệ"
        : "Chưa thể xác thực Google, vui lòng thử lại",
    );
  }
}
export class GoogleTokenVerifier {
  constructor(
    private readonly clientId: string,
    private readonly keys: JWTVerifyGetKey = googleKeys,
  ) {
    if (!clientId || clientId.length > 255)
      throw new Error("Google client ID is required");
  }
  async verify(credential: string) {
    if (!credential || credential.length > 16384)
      throw new VerificationError(401);
    try {
      const { payload } = await jwtVerify(credential, this.keys, {
        algorithms: ["RS256"],
        audience: this.clientId,
        issuer: ["https://accounts.google.com", "accounts.google.com"],
        requiredClaims: ["exp", "sub", "email", "email_verified", "nonce"],
      });
      if (
        payload.aud !== this.clientId ||
        typeof payload.iss !== "string" ||
        !Number.isInteger(payload.exp) ||
        typeof payload.sub !== "string" ||
        !payload.sub ||
        payload.sub.length > 255 ||
        typeof payload.email !== "string" ||
        payload.email.length > 254 ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email) ||
        payload.email_verified !== true ||
        typeof payload.nonce !== "string" ||
        !payload.nonce ||
        payload.nonce.length > 256
      ) {
        throw new VerificationError(401);
      }
      return {
        aud: payload.aud,
        iss: payload.iss,
        exp: payload.exp!,
        sub: payload.sub,
        email: payload.email,
        email_verified: payload.email_verified,
        nonce: payload.nonce,
      };
    } catch (error) {
      if (error instanceof VerificationError) throw error;
      if (
        error instanceof errors.JOSEError &&
        ![
          "ERR_JWKS_TIMEOUT",
          "ERR_JWKS_INVALID",
          "ERR_JWKS_MULTIPLE_MATCHING_KEYS",
          "ERR_JOSE_GENERIC",
        ].includes(error.code)
      )
        throw new VerificationError(401);
      throw new VerificationError(503);
    }
  }
}
