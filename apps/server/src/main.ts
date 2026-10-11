import { config } from "dotenv";
import { createApp } from "./app.js";
import { readConfig } from "./config.js";
import { logEvent } from "./logger.js";
import { createRegistrationRuntime } from "./auth-runtime.js";
import { createGoogleRuntime } from "./google-runtime.js";
import { createRoomRuntime } from "./room-runtime.js";
import { AuthProvidersModule } from "./auth/providers.module.js";

config({ quiet: true });
let registration: Awaited<ReturnType<typeof createRegistrationRuntime>> = null;
let rooms: Awaited<ReturnType<typeof createRoomRuntime>> = null;
let app: Awaited<ReturnType<typeof createApp>> | null = null;
try {
  const settings = readConfig(process.env);
  registration = await createRegistrationRuntime(process.env);
  const google = await createGoogleRuntime(process.env, registration);
  rooms = await createRoomRuntime(process.env, registration);
  app = await createApp(
    settings.corsOrigins,
    [
      AuthProvidersModule.forRoot({ google: !!google, guest: false }),
      ...(registration ? [registration.module] : []),
      ...(google ? [google.module] : []),
      ...(rooms ? [rooms.module] : []),
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
