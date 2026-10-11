import { expect, it, vi } from "vitest";
import { setTimeout } from "node:timers/promises";
import { performance } from "node:perf_hooks";
import { RegistrationError } from "../auth/contracts.js";
import type { LoginStore, PasswordAuth } from "./contracts.js";
import { LoginService } from "./login.service.js";
import type { SessionService } from "./session.service.js";

const account = {
  userId: "synthetic-user",
  username: "KnownUser",
  email: "synthetic@example.invalid",
  active: true,
};
function fixture(auth: PasswordAuth, priorFailures = 0) {
  const counters = new Map<
    string,
    { failures: Date[]; blockedUntil: Date | null }
  >();
  const queues = new Map<string, Promise<void>>();
  const saveAttempts = vi.fn(
    async (
      key: string,
      value: { failures: Date[]; blockedUntil: Date | null },
    ) => {
      counters.set(key, value);
    },
  );
  const store = {
    withUsernameLock: async <T>(
      key: string,
      work: (store: LoginStore) => Promise<T>,
    ) => {
      const previous = queues.get(key) ?? Promise.resolve();
      let release!: () => void;
      const held = new Promise<void>((resolve) => {
        release = resolve;
      });
      queues.set(
        key,
        previous.then(() => held),
      );
      await previous;
      try {
        return await work(store as unknown as LoginStore);
      } finally {
        release();
      }
    },
    accountByUsername: async (key: string) =>
      key === "knownuser" ? account : null,
    attempts: async (key: string) =>
      counters.get(key) ?? {
        failures: Array.from({ length: priorFailures }, () => new Date()),
        blockedUntil: null,
      },
    saveAttempts,
  };
  return {
    service: new LoginService(
      store as unknown as LoginStore,
      auth,
      {} as SessionService,
    ),
    saveAttempts,
  };
}

it("serializes each username's concurrent burst without exposing slow versus fast provider failures", async () => {
  const { service, saveAttempts } = fixture({
    getUser: vi.fn(),
    signInPassword: async (email) => {
      await setTimeout(email === account.email ? 600 : 10);
      throw new RegistrationError("RECOVERY_PASSWORD_INVALID", "private", 401);
    },
  });
  const started = performance.now();
  const completions = {
    KnownUser: [] as number[],
    UnknownUser: [] as number[],
  };
  await Promise.all(
    Array.from(
      { length: 3 },
      () => ["KnownUser", "UnknownUser"] as const,
    ).flatMap((names) =>
      names.map(async (username) => {
        await expect(
          service.login({ username, password: "incorrect" }),
        ).rejects.toMatchObject({ code: "LOGIN_INVALID" });
        completions[username].push(performance.now() - started);
      }),
    ),
  );
  for (let i = 0; i < 3; i++) {
    expect(completions.KnownUser[i]!).toBeGreaterThanOrEqual((i + 1) * 2100);
    expect(
      Math.abs(completions.KnownUser[i]! - completions.UnknownUser[i]!),
    ).toBeLessThan(100);
  }
  for (const key of ["knownuser", "unknownuser"]) {
    const calls = saveAttempts.mock.calls.filter(([name]) => name === key);
    expect(calls.map(([, value]) => value.failures.length)).toEqual([1, 2, 3]);
  }
}, 15000);

it("does not disclose existence through the fifth wrong-password transition to a locked username", async () => {
  const { service, saveAttempts } = fixture(
    {
      getUser: vi.fn(),
      signInPassword: async (email) => {
        await setTimeout(email === account.email ? 600 : 10);
        throw new RegistrationError(
          "RECOVERY_PASSWORD_INVALID",
          "private",
          401,
        );
      },
    },
    4,
  );
  const timings = await Promise.all(
    ["KnownUser", "UnknownUser"].map(async (username) => {
      const start = performance.now();
      await expect(
        service.login({ username, password: "incorrect" }),
      ).rejects.toMatchObject({ code: "LOGIN_LOCKED", status: 429 });
      return performance.now() - start;
    }),
  );
  expect(Math.abs(timings[0]! - timings[1]!)).toBeLessThan(100);
  expect(
    saveAttempts.mock.calls.map(([, value]) => value.failures.length),
  ).toEqual([5, 5]);
  expect(
    saveAttempts.mock.calls.every(
      ([, value]) => value.blockedUntil instanceof Date,
    ),
  ).toBe(true);
}, 10000);

it("returns uniform provider outages without counting password failures for either name", async () => {
  const { service, saveAttempts } = fixture({
    getUser: vi.fn(),
    signInPassword: async (email) => {
      await setTimeout(email === account.email ? 600 : 10);
      throw new RegistrationError(
        "AUTH_PROVIDER_ERROR",
        "private upstream",
        503,
      );
    },
  });
  const timings = await Promise.all(
    ["KnownUser", "UnknownUser"].map(async (username) => {
      const start = performance.now();
      await expect(
        service.login({ username, password: "incorrect" }),
      ).rejects.toMatchObject({ code: "LOGIN_UNAVAILABLE", status: 503 });
      return performance.now() - start;
    }),
  );
  expect(Math.abs(timings[0]! - timings[1]!)).toBeLessThan(100);
  expect(saveAttempts).not.toHaveBeenCalled();
}, 10000);

it("never writes a late wrong-password outcome after the provider deadline has returned an outage", async () => {
  const { service, saveAttempts } = fixture({
    getUser: vi.fn(),
    // A deliberately non-cooperative provider verifies that the race contains provider work only.
    signInPassword: async () => {
      await setTimeout(2300);
      throw new RegistrationError(
        "RECOVERY_PASSWORD_INVALID",
        "late private",
        401,
      );
    },
  });
  await Promise.all(
    ["KnownUser", "UnknownUser"].map(async (username) => {
      await expect(
        service.login({ username, password: "incorrect" }),
      ).rejects.toMatchObject({ code: "LOGIN_UNAVAILABLE" });
    }),
  );
  await setTimeout(300);
  expect(saveAttempts).not.toHaveBeenCalled();
}, 10000);
it("pads slow existing and fast unknown password failures inside the username lock", async () => {
  const calls: string[] = [];
  const { service } = fixture({
    getUser: vi.fn(),
    signInPassword: async (email) => {
      calls.push(email);
      await setTimeout(email === account.email ? 600 : 10);
      throw new RegistrationError("RECOVERY_PASSWORD_INVALID", "private", 401);
    },
  });
  const measurements: number[] = [];
  for (const username of ["KnownUser", "UnknownUser"]) {
    const start = performance.now();
    await expect(
      service.login({ username, password: "incorrect" }),
    ).rejects.toMatchObject({ code: "LOGIN_INVALID" });
    measurements.push(performance.now() - start);
  }
  expect(calls).toHaveLength(2);
  expect(calls[1]).toMatch(/@example\.invalid$/);
  expect(Math.min(...measurements)).toBeGreaterThanOrEqual(2100);
  expect(Math.abs(measurements[0]! - measurements[1]!)).toBeLessThan(100);
}, 10000);
it("bounds stalled providers for both names and never counts timeouts as wrong passwords", async () => {
  const { service, saveAttempts } = fixture({
    getUser: vi.fn(),
    signInPassword: () => new Promise(() => {}),
  });
  for (const username of ["KnownUser", "UnknownUser"]) {
    const start = performance.now();
    await expect(
      service.login({ username, password: "incorrect" }),
    ).rejects.toMatchObject({ code: "LOGIN_UNAVAILABLE" });
    expect(performance.now() - start).toBeLessThan(2600);
  }
  expect(saveAttempts).not.toHaveBeenCalled();
}, 10000);
