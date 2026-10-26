/**
 * Resolves backend API base URL.
 * Automatically adapts hostname when accessing from mobile or other devices via LAN or Tailscale.
 */
export function getApiBaseUrl(): string {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) {
    if (
      typeof window !== "undefined" &&
      window.location.hostname !== "localhost" &&
      window.location.hostname !== "127.0.0.1"
    ) {
      try {
        const parsed = new URL(envUrl);
        if (
          parsed.hostname === "localhost" ||
          parsed.hostname === "127.0.0.1"
        ) {
          return `${parsed.protocol}//${window.location.hostname}:${parsed.port || "3000"}`;
        }
      } catch {
        /* Fall back to envUrl */
      }
    }
    return envUrl.replace(/\/+$/, "");
  }
  if (typeof window !== "undefined") {
    return `${window.location.protocol}//${window.location.hostname}:3000`;
  }
  return "http://localhost:3000";
}
