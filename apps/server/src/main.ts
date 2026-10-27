import { config } from "dotenv";
import { createApp, drainRealtime } from "./app.js";
import { readConfig } from "./core/config.js";
import { logEvent } from "./core/logger.js";
import { createRegistrationRuntime } from "./account/auth/registration.module.js";
import { createGoogleRuntime } from "./account/google/google.module.js";
import { createRoomRuntime } from "./game/game.runtime.js";
import { createAiRuntime } from "./game/ai/ai-runtime.js";
import { createFriendRuntime } from "./account/friend/friend.module.js";
import { createMediaRuntime } from "./game/media/media.module.js";
import { createHistoryRuntime } from "./game/history/history.module.js";
import { createProfileRuntime } from "./account/profile/profile.module.js";
import { AuthProvidersModule } from "./account/auth/registration.module.js";
import { GuestModule } from "./account/guest/guest.module.js";
import { GuestService } from "./account/guest/guest.service.js";

config({ quiet: true });

/**
 * Khởi tạo và chạy ứng dụng server:
 * Đọc cấu hình môi trường, khởi tạo các runtime nghiệp vụ (xác thực, phòng chơi, AI, bạn bè, lịch sử...),
 * gắn cổng HTTP/WebSocket và đóng theo thứ tự xác định khi tắt server hoặc khi mất khóa runtime.
 */
let registration: Awaited<ReturnType<typeof createRegistrationRuntime>> = null;
let media: Awaited<ReturnType<typeof createMediaRuntime>> = null;
let rooms: Awaited<ReturnType<typeof createRoomRuntime>> = null;
let ai: Awaited<ReturnType<typeof createAiRuntime>> = null;
let app: Awaited<ReturnType<typeof createApp>> | null = null;
let closing: Promise<void> | undefined;
let stopping = false;

/**
 * Đóng theo thứ tự phụ thuộc:
 * 1. AI ngừng nhận và giải phóng lease.
 * 2. Room quiesce: đóng nhận thao tác, chờ tick/media/chat/thao tác đang chạy, khóa runtime vẫn được giữ. AI dùng cùng cổng fence (ownershipPool) nên cũng được chờ.
 * 3. Đóng socket (drain) khi khóa vẫn giữ, nên instance kế tiếp chưa thể bắt đầu ghi.
 * 4. Room release khóa (idempotent).
 * 5. HTTP app đóng; Nest hủy module có thể end pool.
 * 6. Pool registration đóng sau cùng.
 * Idempotent: mọi đường tắt (tín hiệu, lỗi khởi động, mất khóa) dùng chung một promise.
 */
function closeAll(): Promise<void> {
  return (closing ??= (async () => {
    const steps = [
      () => ai?.close(),
      () => rooms?.stop(),
      () => (app ? drainRealtime(app) : undefined),
      () => rooms?.close(),
      () => app?.close(),
      () => media?.close(),
      () => registration?.close(),
    ];
    for (const close of steps) {
      try {
        await close();
      } catch {
        process.stderr.write(
          logEvent("error", "server_shutdown_failed") + "\n",
        );
      }
    }
  })());
}

/** Yêu cầu tắt: đánh dấu để boot không tiếp tục listen, chờ boot dừng ở điểm kiểm tra rồi đóng. */
function requestShutdown(exitCode: number): void {
  stopping = true;
  void bootDone.then(closeAll).finally(() => process.exit(exitCode));
}

/** Điểm kiểm tra trong khởi động: nếu đã có yêu cầu tắt thì dừng boot để closeAll dọn tài nguyên đã tạo. */
function admit(): void {
  if (stopping) throw new Error("Server shutdown requested during startup");
}

async function boot(): Promise<void> {
  try {
    const settings = readConfig(process.env);
    registration = await createRegistrationRuntime(process.env);
    const google = await createGoogleRuntime(process.env, registration);
    media = await createMediaRuntime(process.env, registration);
    rooms = await createRoomRuntime(
      process.env,
      registration,
      media?.access ?? null,
    );
    admit();
    if (media && rooms)
      media.module.providers = [
        ...(media.module.providers ?? []),
        { provide: GuestService, useValue: rooms.guests },
      ];
    ai =
      registration && rooms
        ? await createAiRuntime({
            env: process.env,
            registration: { ...registration, pool: rooms.ownershipPool },
            authorizer: rooms.authorizer,
            guests: rooms.guests,
            withScope: rooms.withScope,
          })
        : null;
    if (ai && rooms) rooms.attachGuestAi(ai.guestTermination);
    admit();
    const friends = await createFriendRuntime(process.env, registration);
    const history = await createHistoryRuntime(process.env, registration);
    const profile = await createProfileRuntime(process.env, registration);
    const runtimeCheck =
      rooms || ai
        ? async () => {
            await rooms?.ready();
            await ai?.ready();
          }
        : null;
    rooms?.lost.then(() => {
      process.stderr.write(logEvent("error", "room_runtime_lock_lost") + "\n");
      requestShutdown(1);
    });
    app = await createApp(
      settings.corsOrigins,
      [
        AuthProvidersModule.forRoot({ google: !!google, guest: !!rooms }),
        ...(registration ? [registration.module] : []),
        ...(google ? [google.module] : []),
        ...(rooms ? [rooms.module] : []),
        ...(ai ? [ai.module] : []),
        ...(friends ? [friends.module] : []),
        ...(media ? [media.module] : []),
        ...(history ? [history.module] : []),
        ...(rooms
          ? [
              GuestModule.forRoot(
                rooms.guests,
                process.env.NODE_ENV === "production",
              ),
            ]
          : []),
        ...(profile ? [profile.module] : []),
      ],
      registration?.checkDatabase,
      rooms?.realtime,
      rooms?.publicFeed,
      runtimeCheck,
    );
    admit();
    ai?.attach(app.getHttpServer());
    admit();
    await app.listen(settings.port, process.env.HOST ?? "0.0.0.0");
    admit();
    await ai?.start();
    await rooms?.start();
    if (["debug", "info"].includes(settings.logLevel)) {
      process.stdout.write(
        logEvent("info", "server_started", { port: settings.port }) + "\n",
      );
    }
  } catch (error) {
    await closeAll();
    process.stderr.write(logEvent("error", "server_start_failed") + "\n");
    if (error instanceof Error && error.stack) {
      process.stderr.write(error.stack + "\n");
    }
    process.exitCode = 1;
  }
}

const bootDone = boot();
for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.once(signal, () => requestShutdown(0));
}
