import { describe, expect, it } from "vitest";
import { createApp } from "@server/app.js";
import { SessionService } from "@server/account/login/session.service.js";
import { createLoginPool, PostgresLoginStore } from "@server/account/login/postgres-login-store.js";
import { PostgresMemberRoomAuthorizer } from "@server/game/room/member-room-auth.js";
import { RoomTransactions } from "@server/game/room/room-transactions.js";
import { RankingHttpService } from "@server/game/ranking/ranking-http.service.js";
import { RankingModule } from "@server/game/ranking/ranking.module.js";
import { readRoomProof } from "@server/game/room/room.controller.js";
import type { IncomingMessage } from "node:http";
import { databaseUrl, pool } from "../match/match.test-helper.js";

describe.skipIf(!databaseUrl)("ranking HTTP access", () => {
  it("rejects a validly shaped guest room proof on both ranking endpoints", async () => {
    const capability = "a".repeat(43);
    expect(readRoomProof({headers:{authorization:`Guest ${capability}`}} as IncomingMessage)).toEqual({guestCapability:capability});
    const loginPool = createLoginPool({connectionString:databaseUrl});
    const sessions = new SessionService(new PostgresLoginStore(loginPool), {verifyAccessToken: async () => { throw new Error("invalid synthetic token"); }});
    const service = new RankingHttpService(new RoomTransactions(pool), new PostgresMemberRoomAuthorizer(sessions));
    const app = await createApp(["http://localhost:5173"], [RankingModule.forRoot(service)]);
    try {
      await app.listen(0, "127.0.0.1");
      const base = `http://127.0.0.1:${app.getHttpServer().address().port}`;
      for (const path of ["/rankings", "/rankings/me"]) {
        const response = await fetch(base + path, {headers:{Authorization:`Guest ${capability}`}});
        expect([401,403]).toContain(response.status);
      }
    } finally {
      await app.close();
      await loginPool.end();
      await pool.end();
    }
  });
});
