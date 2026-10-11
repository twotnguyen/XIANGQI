import { createHash } from "node:crypto";
import { RegistrationError } from "../auth/contracts.js";
import { LoginError } from "../login/contracts.js";
import type { SessionService } from "../login/session.service.js";
import { RoomError, type RoomActor } from "./contracts.js";
import type {
  MemberRoomAuthorizer,
  MemberRoomRequestProof,
} from "./room-http.service.js";
import type { RoomActorProof, RoomAuthorization } from "./room-transactions.js";
const fingerprint = (value: string) =>
  createHash("sha256").update(value).digest("hex");
function required() {
  return new RoomError("AUTH_REQUIRED", "Phiên đăng nhập không hợp lệ", 401);
}
function unavailable() {
  return new RoomError(
    "AUTH_UNAVAILABLE",
    "Chưa thể xác thực phiên đăng nhập",
    503,
  );
}
function valid(proof: MemberRoomRequestProof) {
  if (
    !proof ||
    typeof proof.appSession !== "string" ||
    !/^[A-Za-z0-9_-]{43}$/.test(proof.appSession) ||
    typeof proof.accessToken !== "string" ||
    !proof.accessToken ||
    /\s/.test(proof.accessToken)
  )
    throw required();
}
// Request-scoped private proof objects must remain unchanged across resolve/authorize.
export class PostgresMemberRoomAuthorizer implements MemberRoomAuthorizer {
  private readonly resolved = new WeakMap<
    MemberRoomRequestProof,
    { userId: string; sessionHash: string; bearerHash: string }
  >();
  constructor(private readonly sessions: SessionService) {}
  async resolve(proof: MemberRoomRequestProof): Promise<RoomActor> {
    valid(proof);
    this.resolved.delete(proof);
    const sessionHash = fingerprint(proof.appSession),
      bearerHash = fingerprint(proof.accessToken);
    try {
      const userId = await this.sessions.requireActive(
        proof.accessToken,
        proof.appSession,
      );
      if (
        fingerprint(proof.appSession) !== sessionHash ||
        fingerprint(proof.accessToken) !== bearerHash
      )
        throw required();
      this.resolved.set(proof, { userId, sessionHash, bearerHash });
      return { userId, kind: "member" };
    } catch (error) {
      if (error instanceof RoomError && error.code === "AUTH_REQUIRED")
        throw error;
      if (
        (error instanceof LoginError || error instanceof RegistrationError) &&
        [401, 403].includes(error.status)
      )
        throw required();
      throw unavailable();
    }
  }
  async authorize(
    proof: MemberRoomRequestProof,
    actorProof: RoomActorProof,
  ): Promise<RoomAuthorization> {
    valid(proof);
    const trusted = this.resolved.get(proof);
    if (
      !trusted ||
      fingerprint(proof.appSession) !== trusted.sessionHash ||
      fingerprint(proof.accessToken) !== trusted.bearerHash ||
      actorProof.actor.kind !== "member" ||
      actorProof.actor.userId !== trusted.userId ||
      !actorProof.lockedActorIds.has(trusted.userId)
    )
      throw required();
    try {
      const session = (
        await actorProof.client.query<{
          user_id: string;
          revoked_at: Date | null;
        }>(
          "SELECT user_id,revoked_at FROM xiangqi_auth.app_sessions WHERE token_hash=$1 FOR UPDATE",
          [trusted.sessionHash],
        )
      ).rows[0];
      if (!session || session.user_id !== trusted.userId || session.revoked_at)
        throw required();
      // Hold profile state through room work; sample the deadline in a separate
      // statement after both session and profile lock waits, never transaction now().
      const account = (
        await actorProof.client.query<{ active: boolean }>(
          `SELECT (s.revoked_at IS NULL
     AND a.email_confirmed_at IS NOT NULL AND p.completed_at IS NOT NULL
     AND NOT p.registration_pending AND n.kind='member' AND n.auth_user_id=a.id) AS active
     FROM xiangqi_auth.app_sessions s JOIN xiangqi_auth.accounts a ON a.id=s.user_id
     JOIN public.profiles p ON p.user_id=a.id JOIN xiangqi_auth.principals n ON n.id=a.id
     WHERE s.token_hash=$1 AND s.user_id=$2 FOR UPDATE OF p`,
          [trusted.sessionHash, trusted.userId],
        )
      ).rows[0];
      if (!account?.active) throw required();
      const deadline = (
        await actorProof.client.query<{ valid: boolean }>(
          "SELECT (expires_at>clock_timestamp() AND revoked_at IS NULL) AS valid FROM xiangqi_auth.app_sessions WHERE token_hash=$1",
          [trusted.sessionHash],
        )
      ).rows[0];
      if (!deadline?.valid) throw required();
      return {
        status: "active",
        actor: { userId: trusted.userId, kind: "member" },
      };
    } catch (error) {
      if (error instanceof RoomError && error.code === "AUTH_REQUIRED")
        throw error;
      throw unavailable();
    }
  }
}
