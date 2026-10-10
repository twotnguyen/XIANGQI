import { beforeEach, expect, it, vi } from "vitest";
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
