import { afterAll, afterEach, beforeEach, describe, expect, it } from "vitest";
import { SessionService } from "@server/account/login/session.service.js";
import { readDeviceEnforcement } from "@server/account/login/device.js";
import {
  databaseUrl,
  fingerprint,
  pool,
  setupPasswords,
  type PasswordFixture,
} from "../password/password.test-helper.js";

it("defaults device enforcement off in development and on in production, with validated explicit overrides", () => {
  expect(readDeviceEnforcement({ NODE_ENV: "development" })).toBe(false);
  expect(readDeviceEnforcement({ NODE_ENV: "production" })).toBe(true);
  expect(
    readDeviceEnforcement({
      NODE_ENV: "development",
      SESSION_DEVICE_ENFORCEMENT_ENABLED: "true",
    }),
  ).toBe(true);
  expect(
    readDeviceEnforcement({
      NODE_ENV: "production",
      SESSION_DEVICE_ENFORCEMENT_ENABLED: "false",
    }),
  ).toBe(false);
  expect(() =>
    readDeviceEnforcement({ SESSION_DEVICE_ENFORCEMENT_ENABLED: "invalid" }),
  ).toThrow("Invalid session device configuration");
});

describe.skipIf(!databaseUrl)(
  "YC1 device enforcement with real PostgreSQL sessions",
  () => {
    let f: PasswordFixture;
    beforeEach(async () => {
      f = await setupPasswords();
    });
    afterEach(async () => {
      await f?.close();
    });
    afterAll(() => pool.end());

    it("keeps existing capabilities valid across browser logins when enforcement is off", async () => {
      const account = await f.member();
      const sessions = new SessionService(
        f.loginStore,
        f.auth,
        () => new Date(),
        false,
      );
      let ended = false;
      sessions.attachSeats({
        endSeats: async () => {
          ended = true;
          return { displaced: true };
        },
      });
      const first = await sessions.issue(
        account.userId,
        true,
        undefined,
        "a".repeat(43),
      );
      const second = await sessions.issue(
        account.userId,
        true,
        undefined,
        "b".repeat(43),
      );
      expect(ended).toBe(false);
      expect(second.displaced).toBe(false);
      await expect(
        sessions.requireValidSession(first.appSession),
      ).resolves.toMatchObject({ userId: account.userId });
      await expect(
        sessions.requireValidSession(second.appSession),
      ).resolves.toMatchObject({ userId: account.userId });
      expect(
        (await sessions.requireValidSession(first.appSession)).expiresAt,
      ).toBe(first.expiresAt);
    });

    it("enforcement still revokes the old browser session and displaces its seat", async () => {
      const account = await f.member();
      const sessions = new SessionService(
        f.loginStore,
        f.auth,
        () => new Date(),
        true,
      );
      const first = await sessions.issue(
        account.userId,
        true,
        undefined,
        "a".repeat(43),
      );
      sessions.attachSeats({
        endSeats: async ({ replacement }) => {
          if (!replacement) throw new Error("Missing replacement");
          await f.loginStore.saveSession(replacement);
          return { displaced: true };
        },
      });
      const second = await sessions.issue(
        account.userId,
        true,
        undefined,
        "b".repeat(43),
      );
      expect(second.displaced).toBe(true);
      await expect(
        sessions.requireValidSession(first.appSession),
      ).rejects.toMatchObject({ code: "SESSION_EXPIRED" });
      await expect(
        sessions.requireValidSession(second.appSession),
      ).resolves.toMatchObject({ userId: account.userId });
    });
    it("refreshes real provider sessions for X/Y independently and logging out Y leaves X usable", async () => {
      const x = await f.member();
      const y = await f.member();
      const a = "aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa";
      const b = "bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb";
      const jar = new Map([
        [`xiangqi_session__${a}`, x.appSession],
        [`xiangqi_session__${b}`, y.appSession],
        [
          `xiangqi_refresh_group__${fingerprint(x.appSession)}`,
          encodeURIComponent(x.refresh_token),
        ],
        [
          `xiangqi_refresh_group__${fingerprint(y.appSession)}`,
          encodeURIComponent(y.refresh_token),
        ],
      ]);
      const cookies = () =>
        [...jar].map(([name, value]) => `${name}=${value}`).join("; ");
      const remember = (response: Response) => {
        for (const value of response.headers.getSetCookie()) {
          const cookie = value.split(";")[0]!;
          const split = cookie.indexOf("=");
          if (value.includes("Max-Age=0")) jar.delete(cookie.slice(0, split));
          else jar.set(cookie.slice(0, split), cookie.slice(split + 1));
        }
      };
      for (const [tab, member] of [
        [a, x],
        [b, y],
      ] as const) {
        const response = await f.request("/auth/refresh", {}, undefined, {
          "X-Xiangqi-Tab": tab,
          Cookie: cookies(),
        });
        expect(response.status).toBe(200);
        expect(await response.json()).toMatchObject({
          userId: member.userId,
          appSession: member.appSession,
          expiresAt: member.expiresAt,
        });
        remember(response);
      }
      const logout = await f.request("/auth/logout", { confirm: false }, y, {
        "X-Xiangqi-Tab": b,
        Cookie: cookies(),
      });
      expect(logout.status).toBe(200);
      remember(logout);
      const response = await f.request("/auth/refresh", {}, undefined, {
        "X-Xiangqi-Tab": a,
        Cookie: cookies(),
      });
      expect(response.status).toBe(200);
      expect(await response.json()).toMatchObject({
        userId: x.userId,
        appSession: x.appSession,
        expiresAt: x.expiresAt,
      });
      await expect(
        f.sessions.requireValidSession(y.appSession),
      ).rejects.toMatchObject({ code: "SESSION_EXPIRED" });
    });
  },
);
