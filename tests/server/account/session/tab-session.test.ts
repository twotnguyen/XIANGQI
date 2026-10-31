import { createServer } from "node:http";
import { afterEach, expect, it } from "vitest";
import {
  tabSessionMiddleware,
  tabSessionMiddlewareFor,
} from "@server/account/session/tab-session.js";

const a = "aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa";
const b = "bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb";
const capability = "a".repeat(43);
let close: (() => Promise<void>) | undefined;
afterEach(async () => close?.());

async function server(flags = "SameSite=Lax") {
  const instance = createServer((request, response) => {
    tabSessionMiddleware(request, response, () => {
      const activeCapability =
        request.url === "/auth/refresh"
          ? (/(?:^|; )xiangqi_session=([^;]+)/.exec(
              request.headers.cookie ?? "",
            )?.[1] ?? capability)
          : request.headers["x-fixture-account"] === "b"
            ? "b".repeat(43)
            : capability;
      if (
        request.url === "/auth/login" ||
        (request.url === "/auth/refresh" &&
          request.headers.cookie?.includes("xiangqi_session="))
      )
        response.setHeader("Set-Cookie", [
          `xiangqi_session=${activeCapability}; Path=/; HttpOnly; ${flags}; Max-Age=100`,
          `xiangqi_refresh=provider-refresh; Path=/; HttpOnly; ${flags}; Max-Age=100`,
          "xiangqi_device=browser-device; Path=/; HttpOnly; SameSite=Lax",
        ]);
      if (request.url === "/auth/logout")
        response.setHeader("Set-Cookie", [
          "xiangqi_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0",
          "xiangqi_refresh=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0",
        ]);
      response.end(request.headers.cookie ?? "");
    });
  });
  await new Promise<void>((resolve) =>
    instance.listen(0, "127.0.0.1", resolve),
  );
  close = () =>
    new Promise<void>((resolve, reject) =>
      instance.close((e) => (e ? reject(e) : resolve())),
    );
  const address = instance.address();
  if (!address || typeof address === "string")
    throw Error("Missing HTTP address");
  return `http://127.0.0.1:${address.port}`;
}

it("selects only this tab's member/guest/Google cookies and keeps the browser device", async () => {
  const base = await server();
  const response = await fetch(`${base}/probe`, {
    headers: {
      "X-Xiangqi-Tab": a,
      Cookie: `xiangqi_session__${a}=member-a; xiangqi_guest__${b}=guest-b; xiangqi_google_challenge__${a}=google-a; xiangqi_session=legacy; xiangqi_device=device`,
    },
  });
  expect(response.status).toBe(200);
  expect(await response.text()).toBe(
    "xiangqi_device=device; xiangqi_session=member-a; xiangqi_google_challenge=google-a",
  );
});

it("does not fall back to another tab or legacy cookies when its namespace is missing", async () => {
  const base = await server();
  const response = await fetch(`${base}/probe`, {
    headers: {
      "X-Xiangqi-Tab": b,
      Cookie: `xiangqi_session__${a}=member-a; xiangqi_session=legacy`,
    },
  });
  expect(await response.text()).toBe("");
});

it.each(["bad", `${a}, ${b}`, ""])(
  "rejects invalid selectors without falling back: %j",
  async (selector) => {
    const base = await server();
    const response = await fetch(`${base}/probe`, {
      headers: {
        "X-Xiangqi-Tab": selector,
        Cookie: "xiangqi_session=legacy",
      },
    });
    expect(response.status).toBe(400);
  },
);

it("keeps legacy clients unchanged", async () => {
  const base = await server();
  const response = await fetch(`${base}/probe`, {
    headers: { Cookie: "xiangqi_session=legacy" },
  });
  expect(await response.text()).toBe("xiangqi_session=legacy");
});

it("writes HttpOnly tab cookies, shares refresh only for the same capability, and leaves device global", async () => {
  const base = await server();
  const response = await fetch(`${base}/auth/login`, {
    headers: { "X-Xiangqi-Tab": a },
  });
  const cookies = response.headers.getSetCookie();
  expect(cookies).toContain(
    `xiangqi_session__${a}=${capability}; Path=/; HttpOnly; SameSite=Lax; Max-Age=100`,
  );
  expect(cookies).toContain(
    "xiangqi_device=browser-device; Path=/; HttpOnly; SameSite=Lax",
  );
  expect(
    cookies.some((cookie) =>
      /^xiangqi_refresh_group__[a-f0-9]{64}=provider-refresh;/.test(cookie),
    ),
  ).toBe(true);
  expect(
    cookies.some(
      (cookie) =>
        cookie.startsWith(`xiangqi_last_tab=${a};`) &&
        cookie.includes("HttpOnly"),
    ),
  ).toBe(true);
  const jar = cookies.map((cookie) => cookie.split(";")[0]).join("; ");
  const restored = await fetch(`${base}/auth/refresh`, {
    headers: {
      "X-Xiangqi-Tab": b,
      "X-Xiangqi-Tab-Source": "last",
      Cookie: jar,
    },
  });
  const body = await restored.text();
  expect(body).toContain(`xiangqi_session=${capability}`);
  expect(body).toContain("xiangqi_refresh=provider-refresh");
  expect(
    (
      await fetch(`${base}/probe`, {
        headers: { "X-Xiangqi-Tab": a, Cookie: jar },
      })
    ).status,
  ).toBe(200);
});

it("allows inheritance only during explicit bootstrap, never as fallback for an established tab", async () => {
  const base = await server();
  const cookie = `xiangqi_last_tab=${a}; xiangqi_session__${a}=member-a`;
  const response = await fetch(`${base}/auth/refresh`, {
    headers: {
      "X-Xiangqi-Tab": b,
      "X-Xiangqi-Tab-Source": "last",
      Cookie: cookie,
    },
  });
  expect(await response.text()).toBe("xiangqi_session=member-a");
  expect(
    response.headers
      .getSetCookie()
      .some(
        (value) =>
          value.startsWith(`xiangqi_session__${b}=`) &&
          value.includes("Max-Age=100"),
      ),
  ).toBe(true);
  const unrelated = await fetch(`${base}/probe`, {
    headers: {
      "X-Xiangqi-Tab": b,
      "X-Xiangqi-Tab-Source": "last",
      Cookie: cookie,
    },
  });
  expect(await unrelated.text()).toBe("");
});

it("migrates a legacy remembered session only on explicit first bootstrap", async () => {
  const base = await server();
  const cookie = `xiangqi_session=${capability}; xiangqi_refresh=legacy-refresh`;
  const response = await fetch(`${base}/auth/refresh`, {
    headers: {
      "X-Xiangqi-Tab": a,
      "X-Xiangqi-Tab-Source": "last",
      Cookie: cookie,
    },
  });
  expect(await response.text()).toContain("xiangqi_refresh=legacy-refresh");
  expect(
    response.headers
      .getSetCookie()
      .some((value) => value.startsWith(`xiangqi_session__${a}=`)),
  ).toBe(true);
  const established = await fetch(`${base}/auth/refresh`, {
    headers: {
      "X-Xiangqi-Tab": a,
      Cookie: cookie,
    },
  });
  expect(await established.text()).toBe("");
});

it("preserves Secure, SameSite and the remaining cookie lifetime from the authenticated controller", async () => {
  const base = await server("SameSite=None; Secure");
  const response = await fetch(`${base}/auth/refresh`, {
    headers: {
      "X-Xiangqi-Tab": b,
      "X-Xiangqi-Tab-Source": "last",
      Cookie: `xiangqi_last_tab=${a}; xiangqi_session__${a}=${capability}`,
    },
  });
  for (const cookie of response.headers
    .getSetCookie()
    .filter((value) => !value.startsWith("xiangqi_device=")))
    expect(cookie).toContain("HttpOnly; SameSite=None; Secure; Max-Age=100");
});

it("keeps X and Y refresh and logout isolated in one browser cookie jar", async () => {
  const base = await server();
  const jar = new Map<string, string>();
  const remember = (response: Response) => {
    for (const value of response.headers.getSetCookie()) {
      const cookie = value.split(";")[0]!;
      const split = cookie.indexOf("=");
      if (value.includes("Max-Age=0")) jar.delete(cookie.slice(0, split));
      else jar.set(cookie.slice(0, split), cookie.slice(split + 1));
    }
  };
  const header = () =>
    [...jar].map(([name, value]) => `${name}=${value}`).join("; ");
  remember(
    await fetch(`${base}/auth/login`, { headers: { "X-Xiangqi-Tab": a } }),
  );
  remember(
    await fetch(`${base}/auth/login`, {
      headers: {
        "X-Xiangqi-Tab": b,
        "X-Fixture-Account": "b",
        Cookie: header(),
      },
    }),
  );
  const x = await fetch(`${base}/auth/refresh`, {
    headers: { "X-Xiangqi-Tab": a, Cookie: header() },
  });
  expect(await x.text()).toContain(`xiangqi_session=${capability}`);
  remember(x);
  const y = await fetch(`${base}/auth/refresh`, {
    headers: { "X-Xiangqi-Tab": b, Cookie: header() },
  });
  expect(await y.text()).toContain(`xiangqi_session=${"b".repeat(43)}`);
  remember(y);
  remember(
    await fetch(`${base}/auth/logout`, {
      headers: { "X-Xiangqi-Tab": b, Cookie: header() },
    }),
  );
  const after = await fetch(`${base}/auth/refresh`, {
    headers: { "X-Xiangqi-Tab": a, Cookie: header() },
  });
  const body = await after.text();
  expect(body).toContain(`xiangqi_session=${capability}`);
  expect(body).toContain("xiangqi_refresh=provider-refresh");
  const loggedOut = await fetch(`${base}/probe`, {
    headers: { "X-Xiangqi-Tab": b, Cookie: header() },
  });
  expect(await loggedOut.text()).not.toContain("xiangqi_session=");
});

it("ignores the tab header and keeps shared cookies while device enforcement is on", async () => {
  const instance = createServer((request, response) =>
    tabSessionMiddlewareFor(true)(request, response, () =>
      response.end(request.headers.cookie ?? ""),
    ),
  );
  await new Promise<void>((resolve) =>
    instance.listen(0, "127.0.0.1", resolve),
  );
  close = () =>
    new Promise<void>((resolve, reject) =>
      instance.close((e) => (e ? reject(e) : resolve())),
    );
  const address = instance.address();
  if (!address || typeof address === "string")
    throw Error("Missing HTTP address");
  const response = await fetch(`http://127.0.0.1:${address.port}/probe`, {
    headers: {
      "X-Xiangqi-Tab": "bad",
      Cookie: `xiangqi_session=shared; xiangqi_session__${a}=member-a`,
    },
  });
  expect(response.status).toBe(200);
  expect(await response.text()).toBe(
    `xiangqi_session=shared; xiangqi_session__${a}=member-a`,
  );
});
