import type { Session } from "../auth/contracts.js";
export interface GoogleClaims {
  aud: string;
  iss: string;
  exp: number;
  sub: string;
  email: string;
  email_verified: boolean;
  nonce: string;
}
// This boundary MUST verify signature with Google's keys; decode-only implementations are forbidden.
export interface GoogleIdentityVerifier {
  verify(credential: string): Promise<GoogleClaims>;
}
export interface GoogleAuth {
  exchangeIDToken(credential: string, rawNonce: string): Promise<Session>;
  getUser(accessToken: string): Promise<Session["user"]>;
  setPassword(userId: string, password: string): Promise<void>;
  clearPending(userId: string): Promise<void>;
  deleteTemporary(userId: string): Promise<void>;
}
export type GoogleSessionIssuer = (
  userId: string,
  remember: boolean,
) => Promise<{ appSession: string; expiresAt: string }>;
export class GoogleError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status = 400,
  ) {
    super(message);
  }
}
