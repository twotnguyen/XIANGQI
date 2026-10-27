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
