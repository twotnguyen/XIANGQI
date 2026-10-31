/**
 * Probe đếm truy vấn của feed phòng công khai trên DB test cục bộ chuyên dụng.
 *
 * Không chạy trên DB thật và không dùng Supabase Auth: chỉ authorizer là seam giả
 * (token = userId của member thật trong DB), còn transaction, khóa, catalog SQL và store
 * đều là code thật. Mỗi reader là một principal member thật (auth.users + profiles).
 *
 * Đo ba chỉ số mỗi tick: truy vấn danh sách công khai, số BEGIN (transaction), tổng câu lệnh.
 * Đếm bằng sự kiện `connect` của pool: mỗi client vật lý được gắn đúng một lần, không chồng lớp.
 *
 * Env bắt buộc:
 *   PUBLIC_FEED_PROBE_DATABASE_URL  phải là 127.0.0.1:55446/xiangqi_room_test
 * Env tùy chọn:
 *   PUBLIC_FEED_PROBE_SERVER_SRC    thư mục apps/server/src để đo (mặc định cây hiện tại).
 *                                   Baseline HEAD: `git archive HEAD apps/server/src | tar -x -C .local/head`
 *                                   rồi đặt PUBLIC_FEED_PROBE_SERVER_SRC=.local/head/apps/server/src
 *   PUBLIC_FEED_PROBE_LABEL         nhãn ghi vào báo cáo (mặc định "current")
 *   PUBLIC_FEED_PROBE_READERS       số người đọc (mặc định 50)
 *   PUBLIC_FEED_PROBE_TICKS         số tick poll (mặc định 5)
 *   PUBLIC_FEED_PROBE_ROOMS         số phòng PUBLIC seed (mặc định 50)
 *   PUBLIC_FEED_PROBE_OUT           đường dẫn file JSON kết quả (mặc định stdout)
 *
 * Chạy: npx tsx tests/load/public-feed-query-probe.ts
 */
import { randomUUID } from "node:crypto";
import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import type * as RoomStoreNs from "../../apps/server/src/game/room/room-store.js";
import type * as TransactionsNs from "../../apps/server/src/game/room/room-transactions.js";
import type * as PublicStoreNs from "../../apps/server/src/game/room/public/public-room-store.js";
import type * as PublicServiceNs from "../../apps/server/src/game/room/public/public-room-service.js";
import type * as HelperNs from "../server/game/room/room.test-helper.js";
import type { PoolClient, QueryConfig } from "pg";
import type {
  RoomActor,
  RoomScope,
} from "../../apps/server/src/game/room/room.types.js";
import type { PublicRoomTick } from "../../apps/server/src/game/room/public/public-room-catalog.js";
import type { PublicRoomView } from "../../apps/server/src/game/room/public/public-room-store.js";
import type {
  MemberRoomAuthorizer,
  MemberRoomRequestProof,
} from "../../apps/server/src/game/room/room-http.service.js";

// Số phòng tối đa mà catalog SQL trả về (LIMIT 50 trong public-room-store.ts).
const CATALOG_LIMIT = 50;
const PRIVATE_SEEDS = 5;

type RoomStoreModule = typeof RoomStoreNs;
type TransactionsModule = typeof TransactionsNs;
type PublicStoreModule = typeof PublicStoreNs;
type PublicServiceModule = typeof PublicServiceNs;

function positiveInt(name: string, fallback: number) {
  const raw = process.env[name];
  if (raw === undefined) return fallback;
  const value = Number(raw);
  if (!Number.isInteger(value) || value < 1)
    throw new Error(`${name} phải là số nguyên dương`);
  return value;
}

const counts = { publicListQueries: 0, transactions: 0, statements: 0 };
const catalogMarker = "FROM public.rooms r JOIN public.profiles";
const instrumented = new WeakSet<PoolClient>();

// Gắn đếm đúng một lần cho mỗi client vật lý do pool tạo ra.
function instrument(client: PoolClient) {
  if (instrumented.has(client)) return;
  instrumented.add(client);
  const original: PoolClient["query"] = client.query.bind(client);
  const counted = (...args: unknown[]) => {
    const text = args[0] as string | QueryConfig<unknown[]>;
    const sql = typeof text === "string" ? text : text.text;
    counts.statements++;
    if (sql.startsWith("BEGIN")) counts.transactions++;
    if (sql.includes(catalogMarker)) counts.publicListQueries++;
    return Reflect.apply(original, client, args);
  };
  client.query = counted as PoolClient["query"];
}

function resetCounts() {
  counts.publicListQueries = 0;
  counts.transactions = 0;
  counts.statements = 0;
}

async function main() {
  const repo = resolve(import.meta.dirname, "../..");
  const url = process.env.PUBLIC_FEED_PROBE_DATABASE_URL;
  if (!url) throw new Error("PUBLIC_FEED_PROBE_DATABASE_URL is required");
  const target = new URL(url);
  if (
    target.hostname !== "127.0.0.1" ||
    target.port !== "55446" ||
    target.pathname !== "/xiangqi_room_test"
  )
    throw new Error("Probe chỉ chạy trên 127.0.0.1:55446/xiangqi_room_test");
  process.env.ROOM_TEST_DATABASE_URL = url;

  const src = resolve(
    repo,
    process.env.PUBLIC_FEED_PROBE_SERVER_SRC ?? "apps/server/src",
  );
  const label = process.env.PUBLIC_FEED_PROBE_LABEL ?? "current";
  const readerCount = positiveInt("PUBLIC_FEED_PROBE_READERS", 50);
  const tickCount = positiveInt("PUBLIC_FEED_PROBE_TICKS", 5);
  const roomCount = positiveInt("PUBLIC_FEED_PROBE_ROOMS", 50);
  const expectedRows = Math.min(roomCount, CATALOG_LIMIT);

  // Import động: ROOM_TEST_DATABASE_URL phải có trước khi helper đọc nó (import tĩnh bị hoist).
  const helper: typeof HelperNs = await import(
    pathToFileURL(resolve(repo, "tests/server/game/room/room.test-helper.ts"))
      .href
  );
  const { pool, apply, reset } = helper;
  pool.on("connect", instrument);

  try {
    // Module runtime theo cây đo (hiện tại hoặc baseline HEAD); kiểu lấy từ cây hiện tại.
    const load = (rel: string) =>
      import(pathToFileURL(resolve(src, "game/room", rel)).href);
    const roomStoreModule: RoomStoreModule = await load("room-store.js");
    const txModule: TransactionsModule = await load("room-transactions.js");
    const publicStoreModule: PublicStoreModule = await load(
      "public/public-room-store.js",
    );
    const publicServiceModule: PublicServiceModule = await load(
      "public/public-room-service.js",
    );

    await reset();
    for (const name of [
      "20261011000006_rooms",
      "20261011000007_match_outcomes",
      "20261011000008_room_modes",
      "20261011000013_side_swap",
      "20261017000018_room_code_digits",
      "20261102000002_custom_rematch",
      "20261102000003_unlimited_inactivity",
      "20261103000005_match_aborted",
    ])
      await apply(`supabase/migrations/${name}.sql`);

    const rooms = new roomStoreModule.RoomStore();
    const coordinator = new txModule.RoomTransactions(pool);
    const publicRooms = new publicStoreModule.PublicRoomStore(rooms);

    async function run<T>(
      a: RoomActor,
      ids: string[],
      work: (s: RoomScope) => Promise<T>,
    ): Promise<T> {
      const result = await coordinator.withRoom(
        { actor: a, roomIds: ids },
        async (p) => ({ status: "active" as const, actor: p.actor }),
        work,
      );
      if (result.status !== "active") throw new Error("Synthetic actor ended");
      return result.value;
    }

    // Member thật: auth.users + profiles, trigger tạo principal kind member.
    async function member(): Promise<RoomActor> {
      const userId = randomUUID();
      await pool.query(
        "INSERT INTO auth.users(id,email,email_confirmed_at) VALUES($1,$2,clock_timestamp())",
        [userId, userId + "@example.invalid"],
      );
      await pool.query(
        "INSERT INTO public.profiles(user_id,username,display_name,completed_at,registration_pending) VALUES($1,$2,'Synthetic member',clock_timestamp(),false)",
        [userId, "m" + userId.replaceAll("-", "").slice(0, 18)],
      );
      return { userId, kind: "member" };
    }

    // Seed: roomCount phòng PUBLIC và PRIVATE_SEEDS phòng CODE_ONLY (không công khai).
    const publicIds = new Set<string>();
    const privateIds = new Set<string>();
    for (let i = 0; i < roomCount + PRIVATE_SEEDS; i++) {
      const host = await member();
      const isPublic = i < roomCount;
      const entry = await run(host, [], (s) =>
        rooms.create(s, { commandId: randomUUID(), viewerLimit: 5 }),
      );
      await run(host, [entry.roomId], (s) =>
        rooms.changeVisibility(
          s,
          entry.roomId,
          entry.version,
          isPublic ? "PUBLIC" : "CODE_ONLY",
        ),
      );
      (isPublic ? publicIds : privateIds).add(entry.roomId);
    }

    // Seam giả: token là userId của member thật; không gọi provider/session thật.
    const authorizer: MemberRoomAuthorizer = {
      resolve: async (proof: MemberRoomRequestProof) => ({
        userId: proof.accessToken,
        kind: "member" as const,
      }),
      authorize: async (_proof, actorProof) => ({
        status: "active",
        actor: actorProof.actor,
      }),
    };
    const service = new publicServiceModule.PublicRoomService(
      publicRooms,
      coordinator,
      authorizer,
      async (_scope, work) => work(),
    );

    const feeds: { read(tick: PublicRoomTick): Promise<PublicRoomView[]> }[] =
      [];
    for (let i = 0; i < readerCount; i++) {
      const reader = await member();
      feeds.push(
        await service.open({
          accessToken: reader.userId,
          appSession: "A".repeat(43),
        }),
      );
    }

    const perTick: unknown[] = [];
    const rowCountsObserved = new Set<number>();
    let rowCountMismatches = 0;
    let privateLeaks = 0;
    let unknownRows = 0;
    for (let t = 0; t < tickCount; t++) {
      resetCounts();
      const tick: PublicRoomTick = {};
      const started = performance.now();
      const results = await Promise.all(feeds.map((feed) => feed.read(tick)));
      const ms = performance.now() - started;
      for (const rows of results) {
        rowCountsObserved.add(rows.length);
        if (rows.length !== expectedRows) rowCountMismatches++;
        for (const row of rows) {
          if (privateIds.has(row.roomId)) privateLeaks++;
          else if (!publicIds.has(row.roomId)) unknownRows++;
        }
      }
      perTick.push({
        tick: t,
        readers: readerCount,
        publicListQueries: counts.publicListQueries,
        transactions: counts.transactions,
        statements: counts.statements,
        ms: Math.round(ms * 10) / 10,
      });
    }

    const report = {
      label,
      serverSrc: src,
      readers: readerCount,
      ticks: tickCount,
      publicRooms: roomCount,
      privateRooms: PRIVATE_SEEDS,
      expectedRowsPerReader: expectedRows,
      rowCountsObserved: [...rowCountsObserved],
      rowCountMismatches,
      nonPublicLeaks: privateLeaks,
      unknownRows,
      perTick,
    };
    const text = JSON.stringify(report, null, 2);
    if (process.env.PUBLIC_FEED_PROBE_OUT)
      await writeFile(process.env.PUBLIC_FEED_PROBE_OUT, text + "\n");
    else console.log(text);
  } finally {
    await pool.end();
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
