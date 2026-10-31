import { expect, it } from "vitest";
import { setTimeout } from "node:timers/promises";
import { performance } from "node:perf_hooks";
import { RegistrationError } from "@server/account/auth/registration.types.js";
import type {
  LoginStore,
  PasswordAuth,
} from "@server/account/login/login.types.js";
import { LoginService } from "@server/account/login/login.service.js";
import type { SessionService } from "@server/account/login/session.service.js";

// Một lần withUsernameLock giữ một kết nối của pool phiên (tối đa 5) và mọi request có phiên cần pool đó.
const FLOOR_MS = 150;
function fixture() {
  const holds: number[] = [];
  let open = 0;
  let peak = 0;
  const store = {
    withUsernameLock: async <T>(
      _key: string,
      work: (store: LoginStore) => Promise<T>,
    ) => {
      open += 1;
      peak = Math.max(peak, open);
      const started = performance.now();
      try {
        return await work(store as unknown as LoginStore);
      } finally {
        holds.push(performance.now() - started);
        open -= 1;
      }
    },
    accountByUsername: async () => null,
    attempts: async () => ({ failures: [], blockedUntil: null }),
    saveAttempts: async () => undefined,
  };
  const auth: PasswordAuth = {
    signInPassword: async () => {
      await setTimeout(10);
      throw new RegistrationError("RECOVERY_PASSWORD_INVALID", "private", 401);
    },
  };
  const service = new LoginService(
    store as unknown as LoginStore,
    auth,
    {} as SessionService,
    () => new Date(),
    FLOOR_MS,
  );
  return { service, holds, peak: () => peak };
}

it("pads a failed login to the response floor without holding the lock connection during the padding", async () => {
  const { service, holds } = fixture();
  const started = performance.now();
  await expect(
    service.login({ username: "SomeUser", password: "incorrect" }),
  ).rejects.toMatchObject({ code: "LOGIN_INVALID" });
  expect(performance.now() - started).toBeGreaterThanOrEqual(FLOOR_MS - 5);
  expect(holds).toHaveLength(1);
  expect(holds[0]!).toBeLessThan(FLOOR_MS / 2);
});

it("queues same-username attempts in process: one lock connection at a time, each attempt still padded", async () => {
  const { service, holds, peak } = fixture();
  const started = performance.now();
  await Promise.all(
    Array.from({ length: 4 }, () =>
      expect(
        service.login({ username: "SomeUser", password: "incorrect" }),
      ).rejects.toMatchObject({ code: "LOGIN_INVALID" }),
    ),
  );
  expect(peak()).toBe(1);
  expect(performance.now() - started).toBeGreaterThanOrEqual(4 * FLOOR_MS - 20);
  expect(Math.max(...holds)).toBeLessThan(FLOOR_MS / 2);
});

it("does not queue different usernames behind each other", async () => {
  const { service, peak } = fixture();
  const started = performance.now();
  await Promise.all(
    ["UserOne", "UserTwo", "UserThree"].map((username) =>
      expect(
        service.login({ username, password: "incorrect" }),
      ).rejects.toMatchObject({ code: "LOGIN_INVALID" }),
    ),
  );
  expect(peak()).toBeGreaterThan(1);
  expect(performance.now() - started).toBeLessThan(3 * FLOOR_MS);
});
