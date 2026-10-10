import { config } from "dotenv";
import { createApp } from "./app.js";
import { readConfig } from "./config.js";
import { logEvent } from "./logger.js";

config({ quiet: true });
try {
  const settings = readConfig(process.env);
  const app = await createApp(settings.corsOrigins);
  app.enableShutdownHooks();
  await app.listen(settings.port, "127.0.0.1");
  if (["debug", "info"].includes(settings.logLevel)) {
    process.stdout.write(
      logEvent("info", "server_started", { port: settings.port }) + "\n",
    );
  }
} catch {
  process.stderr.write(logEvent("error", "server_start_failed") + "\n");
  process.exitCode = 1;
}
