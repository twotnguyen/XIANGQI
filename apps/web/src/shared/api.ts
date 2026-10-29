/**
 * HTTP API đi qua proxy cùng origin để cookie không phụ thuộc cookie bên thứ ba.
 */
export function getApiBaseUrl(): string {
  const origin =
    typeof window === "undefined" ? "http://localhost" : window.location.origin;
  return `${origin}/api`;
}
