import { config } from "dotenv";
import { createApp } from "./app.js";
import { readConfig } from "./config.js";
import { logEvent } from "./logger.js";
import { createRegistrationRuntime } from "./auth-runtime.js";

config({ quiet: true });
let registration: Awaited<ReturnType<typeof createRegistrationRuntime>> = null;
try {
  const settings = readConfig(process.env);
  registration = await createRegistrationRuntime(process.env);
  const app = await createApp(
    settings.corsOrigins,
    registration ? [registration.module] : [],
    registration?.checkDatabase,
  );
  app.enableShutdownHooks();
  await app.listen(settings.port, "127.0.0.1");
  if (["debug", "info"].includes(settings.logLevel)) {
    process.stdout.write(
      logEvent("info", "server_started", { port: settings.port }) + "\n",
    );
  }
} catch {
  await registration?.close();
  process.stderr.write(logEvent("error", "server_start_failed") + "\n");
  process.exitCode = 1;
}
