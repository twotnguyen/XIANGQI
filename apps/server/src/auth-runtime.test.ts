import { beforeEach, expect, it, vi } from "vitest";
import { createApp } from "./app.js";
import { io as connectSocket } from "socket.io-client";
import {
  createRegistrationRuntime,
  readRegistrationConfig,
} from "./auth-runtime.js";

const pool = vi.hoisted(() => ({
  query: vi.fn(),
  end: vi.fn(),
  construct: vi.fn(),
}));
vi.mock("pg", () => ({
  Pool: class {
    constructor(options: unknown) {
      pool.construct(options);
    }
    query = pool.query;
    end = pool.end;
  },
}));
beforeEach(() => {
  vi.clearAllMocks();
  pool.end.mockResolvedValue(undefined);
});

it("requires verified TLS with the trusted project CA for the runtime database", async () => {
  pool.query.mockResolvedValue({
    rows: [{ ready: true, canAssumeRole: true }],
  });
  const runtime = await createRegistrationRuntime(configured);
  expect(pool.construct).toHaveBeenCalledWith(
    expect.objectContaining({
      ssl: expect.objectContaining({
        rejectUnauthorized: true,
        ca: expect.stringContaining("-----BEGIN CERTIFICATE-----"),
      }),
    }),
  );
  await runtime!.close();
});

const configured = {
  AUTH_REGISTRATION_ENABLED: "true",
  SUPABASE_PROJECT_REF: "testproject",
  SUPABASE_URL: "https://testproject.supabase.co",
  SUPABASE_PUBLISHABLE_KEY: "fake-publishable-fixture",
  SUPABASE_SECRET_KEY: "fake-secret-fixture",
  DIRECT_URL:
    "postgresql://postgres.testproject:fake-password@pooler.example.invalid:5432/postgres",
};
it("keeps registration disabled until the audited migration is applied and explicitly enabled", () => {
  expect(readRegistrationConfig({})).toBeNull();
  expect(
    readRegistrationConfig({
      ...configured,
      AUTH_REGISTRATION_ENABLED: "false",
    }),
  ).toBeNull();
});
it("accepts matching project configuration and a session pooler", () => {
  expect(readRegistrationConfig(configured)).toMatchObject({
    url: configured.SUPABASE_URL,
  });
});
it.each([
  { SUPABASE_URL: "https://other.supabase.co" },
  { SUPABASE_SECRET_KEY: "" },
  {
    DIRECT_URL:
      "postgresql://postgres.testproject:fake-password@pooler.example.invalid:6543/postgres",
  },
  {
    DIRECT_URL:
      "postgresql://postgres.other:fake-password@pooler.example.invalid:5432/postgres",
  },
  { AUTH_REGISTRATION_ENABLED: "yes" },
  ...[
    "ssl",
    "sslmode",
    "sslcert",
    "sslkey",
    "sslrootcert",
    "uselibpqcompat",
    "host",
    "port",
    "user",
    "database",
  ].map((parameter) => ({
    DIRECT_URL: `${configured.DIRECT_URL}?${parameter}=disable`,
  })),
])(
  "rejects incomplete, wrong project and transaction-pooler configuration without exposing values: %o",
  (override) => {
    expect(() =>
      readRegistrationConfig({ ...configured, ...override }),
    ).toThrow("Invalid registration configuration");
  },
);

it("refuses enabled registration when the connection cannot assume app_server, and closes the pool", async () => {
  pool.query.mockResolvedValue({
    rows: [{ ready: true, canAssumeRole: false }],
  });
  await expect(createRegistrationRuntime(configured)).rejects.toThrow(
    "Registration migration is not ready",
  );
  expect(pool.end).toHaveBeenCalledOnce();
});

it("checks role membership at startup and closes a ready runtime only once", async () => {
  pool.query.mockResolvedValue({
    rows: [{ ready: true, canAssumeRole: true }],
  });
  const runtime = await createRegistrationRuntime(configured);
  expect(pool.query.mock.calls[0]?.[0]).toContain(
    "pg_has_role(current_user, 'app_server', 'SET')",
  );
  await Promise.all([runtime!.close(), runtime!.close()]);
  expect(pool.end).toHaveBeenCalledOnce();
});
it("rejects login/session enablement without registration or with invalid flag values", () => {
  expect(() => readRegistrationConfig({ AUTH_LOGIN_ENABLED: "true" })).toThrow(
    "Invalid registration configuration",
  );
  expect(() =>
    readRegistrationConfig({ ...configured, AUTH_LOGIN_ENABLED: "yes" }),
  ).toThrow("Invalid registration configuration");
});
it("refuses enabled login until its private session and counter migration exists", async () => {
  pool.query.mockResolvedValue({
    rows: [{ ready: true, canAssumeRole: true, loginReady: false }],
  });
  await expect(
    createRegistrationRuntime({ ...configured, AUTH_LOGIN_ENABLED: "true" }),
  ).rejects.toThrow("Registration migration is not ready");
  expect(pool.end).toHaveBeenCalledOnce();
});
it("isolates nested registration/session work in two pools and closes both once", async () => {
  pool.query.mockResolvedValue({
    rows: [{ ready: true, canAssumeRole: true, loginReady: true }],
  });
  const runtime = await createRegistrationRuntime({
    ...configured,
    AUTH_LOGIN_ENABLED: "true",
  });
  expect(pool.construct).toHaveBeenCalledTimes(2);
  expect(pool.construct.mock.calls[0]).toEqual(pool.construct.mock.calls[1]);
  await Promise.all([runtime!.close(), runtime!.close()]);
  expect(pool.end).toHaveBeenCalledTimes(2);
});

it("keeps borrowed registration pools alive while actual socket disconnect teardown drains", async () => {
  pool.query.mockResolvedValue({
    rows: [{ ready: true, canAssumeRole: true }],
  });
  const runtime = (await createRegistrationRuntime(configured))!;
  let release!: () => void, entered!: () => void;
  const draining = new Promise<void>((resolve) => {
    release = resolve;
  });
  const started = new Promise<void>((resolve) => {
    entered = resolve;
  });
  const snapshot = {
    version: 1,
    control: { generation: 1, mode: "writable", reason: null },
  };
  const app = await createApp([], [runtime.module], null, {
    identities: {
      resolve: async () => ({
        userId: "11111111-1111-4111-8111-111111111111",
        kind: "member",
      }),
    },
    store: {
      connect: async () => snapshot,
      snapshot: async () => snapshot,
      cleanupExpiredReceipts: async () => {},
      disconnect: async () => {
        entered();
        await draining;
      },
    } as unknown as import("./realtime/store.js").RealtimeStore,
  });
  await app.listen(0, "127.0.0.1");
  const client = connectSocket(
    `http://127.0.0.1:${app.getHttpServer().address().port}`,
    {
      transports: ["websocket"],
      auth: {
        accessToken: "synthetic",
        appSession: "a".repeat(43),
        roomId: "22222222-2222-4222-8222-222222222222",
        tabId: "33333333-3333-4333-8333-333333333333",
      },
    },
  );
  await new Promise<void>((resolve, reject) => {
    client.once("connect", resolve);
    client.once("connect_error", reject);
  });
  const closing = app.close();
  try {
    await started;
    expect(pool.end).not.toHaveBeenCalled();
  } finally {
    release();
    await closing;
    client.disconnect();
  }
  expect(pool.end).toHaveBeenCalledOnce();
});
