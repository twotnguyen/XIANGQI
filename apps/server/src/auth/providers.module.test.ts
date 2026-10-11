import { expect, it } from "vitest";
import { createApp } from "../app.js";
import { AuthProvidersModule } from "./providers.module.js";

it.each([false, true])(
  "reports Google availability %s without exposing credentials or enabling Guest",
  async (google) => {
    const app = await createApp(
      ["http://localhost:5174"],
      [AuthProvidersModule.forRoot({ google, guest: false })],
    );
    try {
      await app.listen(0, "127.0.0.1");
      const address = app.getHttpServer().address();
      const response = await fetch(
        `http://127.0.0.1:${address.port}/auth/providers`,
      );
      expect(response.status).toBe(200);
      expect(response.headers.get("cache-control")).toBe("no-store");
      expect(await response.json()).toEqual({ google, guest: false });
    } finally {
      await app.close();
    }
  },
);
