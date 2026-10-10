export interface HealthStatus {
  server: "ok";
  database: "ok" | "error" | "not_connected";
  engine: "not_connected";
}

export { containsForbiddenName, normalizeName } from "./auth-filter.js";
