import { config } from "dotenv";
import { createApp } from "./app.js";
import { readConfig } from "./core/config.js";
import { logEvent } from "./core/logger.js";
import { createRegistrationRuntime } from "./account/auth/registration.module.js";
import { createGoogleRuntime } from "./account/google/google.module.js";
import { createRoomRuntime } from "./game/room/runtime/room-runtime.js";
import { createFriendRuntime } from "./account/friend/friend.module.js";
import { createMediaRuntime } from "./game/media/media.module.js";
import { createHistoryRuntime } from "./game/history/history.module.js";
import { createProfileRuntime } from "./account/profile/profile.module.js";
import { AuthProvidersModule } from "./account/auth/providers.module.js";

config({ quiet: true });
let registration: Awaited<ReturnType<typeof createRegistrationRuntime>> = null;
let rooms: Awaited<ReturnType<typeof createRoomRuntime>> = null;
let app: Awaited<ReturnType<typeof createApp>> | null = null;
try {
  const settings = readConfig(process.env);
  registration = await createRegistrationRuntime(process.env);
  const google = await createGoogleRuntime(process.env, registration);
  const media = await createMediaRuntime(process.env, registration);
  rooms = await createRoomRuntime(
    process.env,
    registration,
    media?.access ?? null,
  );
  const friends = await createFriendRuntime(process.env, registration);
  const history = await createHistoryRuntime(process.env, registration);
  const profile = await createProfileRuntime(process.env, registration);
  app = await createApp(
    settings.corsOrigins,
    [
      AuthProvidersModule.forRoot({ google: !!google, guest: false }),
      ...(registration ? [registration.module] : []),
      ...(google ? [google.module] : []),
      ...(rooms ? [rooms.module] : []),
      ...(friends ? [friends.module] : []),
      ...(media ? [media.module] : []),
      ...(history ? [history.module] : []),
      ...(profile ? [profile.module] : []),
    ],
    registration?.checkDatabase,
    rooms?.realtime,
    rooms?.publicFeed,
  );
  app.enableShutdownHooks();
  await app.listen(settings.port, "127.0.0.1");
  await rooms?.start();
  if (["debug", "info"].includes(settings.logLevel)) {
    process.stdout.write(
      logEvent("info", "server_started", { port: settings.port }) + "\n",
    );
  }
} catch {
  for (const close of [
    () => rooms?.close(),
    () => app?.close(),
    () => registration?.close(),
  ]) {
    try {
      await close();
    } catch {
      process.stderr.write(logEvent("error", "server_shutdown_failed") + "\n");
    }
  }
  process.stderr.write(logEvent("error", "server_start_failed") + "\n");
  process.exitCode = 1;
}
