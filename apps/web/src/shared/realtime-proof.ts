import type { PublicRoomAuthProof } from "@xiangqi/shared";

/**
 * Trường xác thực socket handshake. Thành viên và Khách loại trừ lẫn nhau:
 * không bao giờ gửi kèm cả hai bộ credential.
 */
export function handshakeAuth(
  proof: PublicRoomAuthProof,
): { accessToken: string; appSession: string } | { guestCapability: string } {
  return proof.kind === "member"
    ? { accessToken: proof.accessToken, appSession: proof.appSession }
    : { guestCapability: proof.guestCapability };
}

/**
 * Năng lực định danh phiên hiện tại; khi giá trị đổi, proof cũ đã hết hiệu lực.
 */
export function proofCapability(proof: PublicRoomAuthProof): string {
  return proof.kind === "member" ? proof.appSession : proof.guestCapability;
}

/**
 * Kiểm proof trước handshake: appSession/guestCapability là 43 ký tự base64url, không kèm trường lạ.
 * Trả `null` nếu không hợp lệ.
 */
export function parseRealtimeProof(value: unknown): PublicRoomAuthProof | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const row = value as Record<string, unknown>;
  const cap = (v: unknown): v is string =>
    typeof v === "string" && /^[A-Za-z0-9_-]{43}$/.test(v);
  if (
    row.kind === "member" &&
    Object.keys(row).length === 3 &&
    typeof row.accessToken === "string" &&
    row.accessToken.length > 0 &&
    row.accessToken.length <= 8192 &&
    !/\s/.test(row.accessToken) &&
    cap(row.appSession)
  )
    return {
      kind: "member",
      accessToken: row.accessToken,
      appSession: row.appSession,
    };
  if (
    row.kind === "guest" &&
    Object.keys(row).length === 2 &&
    cap(row.guestCapability)
  )
    return { kind: "guest", guestCapability: row.guestCapability };
  return null;
}
