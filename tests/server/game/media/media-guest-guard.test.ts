import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createApp } from "@server/app.js";
import { GuestService } from "@server/account/guest/guest.service.js";
import { MediaModule } from "@server/game/media/media.module.js";
import { MediaAccess } from "@server/game/media/media.service.js";
import { SessionService } from "@server/account/login/session.service.js";
import { memoryGuests } from "../../account/guest/guest-http.test-helper.js";

const ORIGIN = "http://localhost:5173";
const HOUR = 3600000;
let time = Date.parse("2026-10-11T00:00:00Z");
const now = () => new Date(time);

const shares: Array<{ userId: string; roomId: string }> = [];
const access = {
  async setShare(userId: string, roomId: string, level: string) {
    shares.push({ userId, roomId });
    return { roomId, level };
  },
  async getShare(_userId: string, roomId: string) {
    return { roomId, level: "none" };
  },
  async tokenFor() {
    return { token: "t", url: "wss://media.test" };
  },
} as unknown as MediaAccess;
const sessions = {} as unknown as SessionService;
const lifecycle = { onModuleDestroy: async () => undefined };

const guests = memoryGuests(now);
const withGuests = MediaModule.forRoot(access, sessions, lifecycle);
withGuests.providers?.push({ provide: GuestService, useValue: guests.service });
const withoutGuests = MediaModule.forRoot(access, sessions, lifecycle);

type App = Awaited<ReturnType<typeof createApp>>;
let app: App;
let bare: App;
let base: string;
let bareBase: string;

beforeAll(async () => {
  app = await createApp([ORIGIN], [withGuests]);
  await app.listen(0, "127.0.0.1");
  base = await app.getUrl();
  bare = await createApp([ORIGIN], [withoutGuests]);
  await bare.listen(0, "127.0.0.1");
  bareBase = await bare.getUrl();
});

afterAll(async () => {
  await app?.close();
  await bare?.close();
});

async function guestCapability(name = "Ánh"): Promise<{
  userId: string;
  capability: string;
}> {
  const actor = await guests.service.create(name);
  return { userId: actor.userId, capability: actor.capability };
}

async function share(
  root: string,
  authorization: string | undefined,
  roomId: string,
  cookie?: string,
): Promise<Response> {
  const headers: Record<string, string> = {
    Origin: ORIGIN,
    "Content-Type": "application/json",
  };
  if (authorization) headers.Authorization = authorization;
  if (cookie) headers.Cookie = cookie;
  return fetch(`${root}/media/share`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      roomId,
      level: "OPPONENT",
      control: {
        tabId: "11111111-1111-4111-8111-111111111111",
        connectionId: "test",
        generation: 1,
      },
    }),
  });
}

describe("MediaController: Guest guard", () => {
  it("Khách đang giữ ghế trong phòng được chia sẻ media", async () => {
    const guest = await guestCapability("Bình");
    guests.rooms.seats.set(guest.userId, { kind: "room", roomId: "room-m1" });
    shares.length = 0;
    const response = await share(base, `Guest ${guest.capability}`, "room-m1");
    expect(response.status).toBe(200);
    expect(shares).toEqual([{ userId: guest.userId, roomId: "room-m1" }]);
    guests.rooms.seats.delete(guest.userId);
  });

  it("Khách hết hạn đang giữ ghế khác bị 403 GUEST_DEFERRED", async () => {
    const guest = await guestCapability("Cát");
    guests.rooms.seats.set(guest.userId, { kind: "room", roomId: "room-m2" });
    time += 13 * HOUR;
    const response = await share(
      base,
      `Guest ${guest.capability}`,
      "room-other",
    );
    expect(response.status).toBe(403);
    expect(((await response.json()) as { code: string }).code).toBe(
      "GUEST_DEFERRED",
    );
    guests.rooms.seats.delete(guest.userId);
  });

  it("Authorization Guest sai định dạng bị 401 GUEST_INVALID", async () => {
    const response = await share(
      base,
      "Guest not-a-valid-capability",
      "room-m3",
    );
    expect(response.status).toBe(401);
    expect(((await response.json()) as { code: string }).code).toBe(
      "GUEST_INVALID",
    );
  });

  it("trộn Guest với cookie thành viên bị 401 AUTH_MIXED_CREDENTIALS", async () => {
    const guest = await guestCapability("Đông");
    const response = await share(
      base,
      `Guest ${guest.capability}`,
      "room-m4",
      "xiangqi_session=anything",
    );
    expect(response.status).toBe(401);
    expect(((await response.json()) as { code: string }).code).toBe(
      "AUTH_MIXED_CREDENTIALS",
    );
  });

  it("thiếu GuestService trong MediaModule trả 503 GUEST_UNAVAILABLE", async () => {
    const guest = await guestCapability("Hải");
    const response = await share(
      bareBase,
      `Guest ${guest.capability}`,
      "room-m5",
    );
    expect(response.status).toBe(503);
    expect(((await response.json()) as { code: string }).code).toBe(
      "GUEST_UNAVAILABLE",
    );
  });
});
