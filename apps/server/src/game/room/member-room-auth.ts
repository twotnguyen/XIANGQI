import { createHash } from "node:crypto";
import { RegistrationError } from "../../account/auth/registration.types.js";
import { LoginError } from "../../account/login/login.types.js";
import type { SessionService } from "../../account/login/session.service.js";
import { RoomError, type RoomActor } from "./room.types.js";
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
/**
 * Xác thực và phân quyền cho người chơi Thành viên (Member) trong giao dịch phòng cờ:
 * Kiểm tra kết hợp Bearer access token và app session capability.
 */
export class PostgresMemberRoomAuthorizer implements MemberRoomAuthorizer {
  private readonly resolved = new WeakMap<
    MemberRoomRequestProof,
    { userId: string; sessionHash: string; bearerHash: string }
  >();
  constructor(private readonly sessions: SessionService) {}
  /**
   * Tra cứu danh tính thành viên từ access token và session capability qua SessionService.
   */
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
  /**
   * Xác thực và khóa dòng tài khoản thành viên trong transaction phòng cờ để đảm bảo tính hợp lệ.
   */
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
      // Materialization samples the deadline only after session/profile lock waits.
      const account = (
        await actorProof.client.query<{
          user_id: string;
          revoked_at: Date | null;
          active: boolean;
          valid: boolean;
        }>(
          `WITH locked AS MATERIALIZED (
     SELECT s.user_id,s.revoked_at,s.expires_at,(s.revoked_at IS NULL
     AND a.email_confirmed_at IS NOT NULL AND p.completed_at IS NOT NULL
     AND NOT p.registration_pending AND n.kind='member' AND n.auth_user_id=a.id) AS active
     FROM xiangqi_auth.app_sessions s JOIN xiangqi_auth.accounts a ON a.id=s.user_id
     JOIN public.profiles p ON p.user_id=a.id JOIN xiangqi_auth.principals n ON n.id=a.id
     WHERE s.token_hash=$1 AND s.user_id=$2 FOR UPDATE OF s,p
     )
     SELECT user_id,revoked_at,active,(expires_at>clock_timestamp()) AS valid FROM locked`,
          [trusted.sessionHash, trusted.userId],
        )
      ).rows[0];
      if (
        !account ||
        account.user_id !== trusted.userId ||
        account.revoked_at ||
        !account.active ||
        !account.valid
      )
        throw required();
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
