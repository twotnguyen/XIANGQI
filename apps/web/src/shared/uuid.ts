/**
 * RFC4122 v4 UUID generator that works in both Secure Contexts (HTTPS / localhost)
 * and Insecure Contexts (HTTP over LAN / VPN / Tailscale).
 */
const nativeRandomUUID =
  typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID.bind(crypto)
    : null;

/**
 * Tạo mã UUID v4 tuân chuẩn RFC4122 (hoạt động tốt trong cả ngữ cảnh HTTPS và HTTP qua mạng LAN/VPN).
 */
export function generateUuid(): string {
  if (nativeRandomUUID) return nativeRandomUUID();

  if (
    typeof crypto !== "undefined" &&
    typeof crypto.getRandomValues === "function"
  ) {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    bytes[6] = (bytes[6]! & 0x0f) | 0x40; // Version 4
    bytes[8] = (bytes[8]! & 0x3f) | 0x80; // Variant RFC4122
    const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join(
      "",
    );
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  }

  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Automatically polyfill crypto.randomUUID if absent (insecure contexts like HTTP on IP)
if (typeof window !== "undefined") {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID !== "function"
  ) {
    try {
      Object.defineProperty(crypto, "randomUUID", {
        value: generateUuid,
        configurable: true,
        writable: true,
      });
    } catch {
      try {
        (crypto as unknown as { randomUUID: typeof generateUuid }).randomUUID =
          generateUuid;
      } catch {
        // ignore
      }
    }
  }
}
