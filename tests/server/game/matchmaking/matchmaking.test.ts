import { randomUUID } from "node:crypto";
import { setImmediate as nextTurn } from "node:timers/promises";
import { describe, expect, it } from "vitest";
import { MatchmakingQueue, type QueueIdentity, type MatchmakingPort } from "../../../../apps/server/src/game/matchmaking/matchmaking-queue.js";
import { RoomError } from "../../../../apps/server/src/game/room/room.types.js";

function setup() {
  let now = 0;
  const reserved = new Set<string>();
  const starts: Array<{ users: string[]; at: number; mode: string }> = [];
  const ratings = new Map<string, number>();
  let occupiedFails = false;
  const cap = new Set<string>();
  const port: MatchmakingPort = {
    authorize: async () => true,
    authorizeMany: async identities => Promise.allSettled(identities.map(identity=>port.authorize(identity))),
    occupied: async (actor) => { if (occupiedFails) throw Error("temporary database failure"); return reserved.has(actor.userId); },
    reserve: async (identity) => {
      if (reserved.has(identity.actor.userId)) throw Error("busy");
      reserved.add(identity.actor.userId);
      return ratings.get(identity.actor.userId) ?? 1200;
    },
    release: async (identity) => { reserved.delete(identity.actor.userId); },
    canPair: async (a, b) => !cap.has([a.actor.userId, b.actor.userId].sort().join(":")),
    start: async (a, b, mode) => {
      starts.push({users: [a.actor.userId, b.actor.userId], at: now, mode});
      return randomUUID();
    },
  };
  const queue = new MatchmakingQueue(port, () => now, () => 0);
  const a = identity(), b = identity(), c = identity();
  const connect = (who: QueueIdentity, socket = who.actor.userId) => queue.connect(socket, who);
  const command = (who: QueueIdentity, input: Record<string, unknown>) => queue.command(who.actor.userId, { commandId: randomUUID(), ...input });
  const join = async (who: QueueIdentity, mode = "CASUAL") => { await connect(who); return command(who, {type: "join", mode}); };
  const state = (who: QueueIdentity) => queue.state(who.actor.userId);
  const confirm = (who: QueueIdentity) => command(who, {type: "confirm", offerId: state(who).offerId});
  return { queue, port, a, b, c, starts, reserved, ratings, cap, connect, command, join, state, confirm, failOccupied: (value: boolean) => { occupiedFails = value; }, at: (value: number) => { now = value; } };
}
function identity(): QueueIdentity {
  return {actor: {userId: randomUUID(), kind: "member"}, sessionKey: randomUUID(), proof: {accessToken: "token", appSession: "session"}};
}

describe("YC9 matchmaking state transitions", () => {
  it("creates one actual match only after both confirmations and three connected seconds", async () => {
    const t = setup();
    await t.join(t.a); await t.join(t.b);
    expect(t.state(t.a).status).toBe("CONFIRMING");
    expect(t.state(t.a)).not.toHaveProperty("opponent");
    await t.confirm(t.a);
    expect(t.state(t.a).status).toBe("WAITING");
    expect(t.starts).toEqual([]);
    await t.confirm(t.b);
    expect(t.state(t.a).status).toBe("COUNTDOWN");
    t.at(2999); await t.queue.tick(); expect(t.starts).toEqual([]);
    t.at(3000); await t.queue.tick(); await t.queue.tick();
    expect(t.starts).toEqual([{users: [t.a.actor.userId, t.b.actor.userId], at: 3000, mode: "CASUAL"}]);
    expect(t.state(t.a).roomId).toBe(t.state(t.b).roomId);
    expect(t.state(t.a).status).toBe("MATCHED");
  });
  it("requeues only the confirmed participant with a fresh two minute search", async () => {
    const t = setup(); await t.join(t.a); await t.join(t.b); await t.confirm(t.a);
    t.at(15000);
    await t.command(t.b, {type: "decline", offerId: t.state(t.b).offerId});
    expect(t.state(t.a)).toMatchObject({status: "SEARCHING", startedAt: new Date(15000).toISOString(), deadline: new Date(135000).toISOString()});
    expect(t.state(t.b).status).toBe("CANCELLED");
    expect(t.reserved.has(t.b.actor.userId)).toBe(false);
    expect(t.starts).toEqual([]);
  });
  it("expires both unconfirmed players at exactly 30 seconds without a loss or a match", async () => {
    const t = setup(); await t.join(t.a); await t.join(t.b);
    t.at(30000); await t.queue.tick();
    expect(t.state(t.a).status).toBe("CANCELLED"); expect(t.state(t.b).status).toBe("CANCELLED");
    expect(t.reserved.size).toBe(0); expect(t.starts).toEqual([]);
  });
  it("rejects cancellation after MATCH_FOUND and stale confirmation after a new offer", async () => {
    const t = setup(); await t.join(t.a); const oldQueue = t.state(t.a).queueId; await t.join(t.b);
    await expect(t.command(t.a, {type: "cancel", queueId: oldQueue})).rejects.toThrow();
    const oldOffer = t.state(t.a).offerId;
    await t.confirm(t.a); await t.command(t.b, {type: "decline", offerId: oldOffer}); await t.join(t.c);
    await expect(t.command(t.a, {type: "confirm", offerId: oldOffer})).rejects.toThrow();
    expect(t.state(t.a).confirmed).toBe(false); expect(t.starts).toEqual([]);
  });
  it("keeps a 29-second reconnect, withdraws at 30 seconds, and another tab preserves connectivity", async () => {
    const t = setup(); await t.join(t.a); const queueId = t.state(t.a).queueId;
    await t.queue.disconnect(t.a.actor.userId); t.at(29000); await t.connect(t.a);
    expect(t.state(t.a).queueId).toBe(queueId);
    await t.connect(t.a, "second-tab"); await t.queue.disconnect(t.a.actor.userId);
    t.at(59000); await t.queue.tick(); expect(t.state(t.a).status).toBe("SEARCHING");
    await t.queue.disconnect("second-tab"); t.at(88999); await t.queue.tick(); expect(t.state(t.a).status).toBe("SEARCHING");
    t.at(89000); await t.queue.tick(); expect(t.state(t.a).status).toBe("CANCELLED");
  });
  it("does not start if one confirmed player disconnects during the countdown", async () => {
    const t = setup(); await t.join(t.a); await t.join(t.b); await t.confirm(t.a); await t.confirm(t.b);
    await t.queue.disconnect(t.b.actor.userId); t.at(3000); await t.queue.tick();
    expect(t.starts).toEqual([]); expect(t.state(t.a).status).toBe("SEARCHING"); expect(t.state(t.b).status).toBe("CANCELLED");
  });
  it("widens Ranked at 60 seconds, uses the larger window, and attempts pairing at 120 seconds before timeout", async () => {
    const t = setup(); t.ratings.set(t.b.actor.userId, 1600); await t.join(t.a, "RANKED");
    t.at(59999); await t.join(t.b, "RANKED"); expect(t.state(t.a).status).toBe("SEARCHING");
    t.at(60000); await t.queue.tick(); expect(t.state(t.a).status).toBe("CONFIRMING");
    const u = setup(); u.ratings.set(u.b.actor.userId, 1600); await u.join(u.a, "RANKED");
    u.at(120000); await u.join(u.b, "RANKED"); expect(u.state(u.a).status).toBe("CONFIRMING");
    const v = setup(); await v.join(v.a, "RANKED"); v.at(120000); await v.queue.tick(); expect(v.state(v.a).status).toBe("TIMED_OUT");
  });
  it("silently skips a capped pair but still finds another opponent and never pairs one account with itself", async () => {
    const t = setup(); t.cap.add([t.a.actor.userId,t.b.actor.userId].sort().join(":"));
    await t.join(t.a, "RANKED"); await t.connect(t.a, "duplicate-tab"); await t.join(t.b, "RANKED");
    expect(t.state(t.a).status).toBe("SEARCHING"); await t.join(t.c, "RANKED");
    expect(t.state(t.a).status).toBe("CONFIRMING"); expect(t.state(t.b).status).toBe("SEARCHING");
  });
  it("blocks Ranked guests, separates modes, and reports a restart without automatically joining", async () => {
    const t = setup(); t.a.actor.kind = "guest"; await t.connect(t.a);
    await expect(t.command(t.a, {type: "join", mode: "RANKED"})).rejects.toThrow();
    await t.command(t.a, {type: "join", mode: "CASUAL"}); await t.join(t.b, "RANKED");
    expect(t.state(t.a).status).toBe("SEARCHING");
    await t.connect(t.c);
    await t.command(t.c, {type: "sync", bootId: randomUUID(), queueId: randomUUID()});
    expect(t.state(t.c).status).toBe("CANCELLED");
    expect(t.state(t.b).status).toBe("SEARCHING"); expect(t.starts).toEqual([]);
  });
  it("serializes concurrent joins and replays a duplicate command without acquiring twice", async () => {
    const t = setup(); await t.connect(t.a); await t.connect(t.b); await t.connect(t.c);
    const join = {commandId: randomUUID(), type: "join", mode: "CASUAL"};
    await Promise.all([t.queue.command(t.a.actor.userId, join),t.queue.command(t.a.actor.userId, join),t.command(t.b, {type:"join",mode:"CASUAL"}),t.command(t.c,{type:"join",mode:"CASUAL"})]);
    expect([t.a,t.b,t.c].map(x=>t.state(x).status).sort()).toEqual(["CONFIRMING","CONFIRMING","SEARCHING"]);
    expect(t.reserved.size).toBe(3);
  });
  it("does not let an old-boot tab cancel a newer search or offer", async () => {
    const t=setup(); await t.join(t.a); await t.join(t.b);
    const offerId=t.state(t.a).offerId;
    await t.command(t.a,{type:"sync",bootId:randomUUID(),queueId:randomUUID()});
    expect(t.state(t.a)).toMatchObject({status:"CONFIRMING",offerId});
    expect(t.state(t.b)).toMatchObject({status:"CONFIRMING",offerId});
  });
  it("clears a matched destination after the player has left instead of redirecting back on reload", async () => {
    const t=setup();await t.join(t.a);await t.join(t.b);await t.confirm(t.a);await t.confirm(t.b);
    t.at(3000);await t.queue.tick();t.reserved.delete(t.a.actor.userId);
    await t.command(t.a,{type:"sync"});
    expect(t.state(t.a)).toMatchObject({status:"IDLE",roomId:null,occupiedElsewhere:false});
  });
  it("attempts the final Ranked window when a worker crosses the deadline, excluding later arrivals", async () => {
    const t=setup();t.ratings.set(t.b.actor.userId,1600);
    await t.join(t.a,"RANKED");t.at(59999);await t.join(t.b,"RANKED");
    t.at(120050);await t.queue.tick();
    expect(t.state(t.a).status).toBe("CONFIRMING");
    const u=setup();await u.join(u.a,"RANKED");u.at(120050);await u.join(u.b,"RANKED");
    expect(u.state(u.a).status).toBe("TIMED_OUT");expect(u.state(u.b).status).toBe("SEARCHING");
  });
  it("does not restart an old join intent after disconnected terminal state has been cleaned", async () => {
    const t=setup();await t.connect(t.a);
    const command={commandId:randomUUID(),type:"join",mode:"CASUAL"};
    await t.queue.command(t.a.actor.userId,command);
    await t.command(t.a,{type:"cancel",queueId:t.state(t.a).queueId});
    await t.queue.disconnect(t.a.actor.userId);t.at(300000);await t.queue.tick();await t.connect(t.a);
    await t.queue.command(t.a.actor.userId,command);
    expect(t.state(t.a).status).toBe("IDLE");
    expect(t.reserved.has(t.a.actor.userId)).toBe(false);
  });
  it("does not retain a failed admission as a connected peer that blocks the 30-second disconnect rule", async () => {
    const t=setup();t.failOccupied(true);
    await expect(t.connect(t.a,"failed-socket")).rejects.toThrow("temporary database failure");
    t.failOccupied(false);await t.connect(t.a,"working-socket");await t.queue.command("working-socket",{commandId:randomUUID(),type:"join",mode:"CASUAL"});
    await t.queue.disconnect("working-socket");t.at(30000);await t.queue.tick();
    expect(t.state(t.a).status).toBe("CANCELLED");expect(t.reserved.has(t.a.actor.userId)).toBe(false);
  });
  it("preserves a disconnected confirmed player through offer expiry until their original grace expires", async () => {
    const t=setup(); await t.join(t.a); await t.join(t.b); await t.confirm(t.a);
    t.at(29000); await t.queue.disconnect(t.a.actor.userId);
    t.at(30000); await t.queue.tick();
    expect(t.state(t.a).status).toBe("SEARCHING");
    expect(t.reserved.has(t.a.actor.userId)).toBe(true);
    t.at(58999); await t.connect(t.a);
    expect(t.state(t.a).status).toBe("SEARCHING");
    await t.join(t.c); expect(t.state(t.a).status).toBe("CONFIRMING");
  });
  it("settles a failed countdown pair without blocking an unrelated timeout", async () => {
    const t=setup(); await t.join(t.a); await t.join(t.b); await t.confirm(t.a); await t.confirm(t.b);
    t.at(3000); await t.join(t.c);
    t.port.start=async()=>{throw new RoomError("ALREADY_SEATED","reservation changed");};
    t.at(123000); await t.queue.tick();
    expect(t.state(t.a).status).toBe("CANCELLED");
    expect(t.state(t.b).status).toBe("CANCELLED");
    expect(t.state(t.c).status).toBe("TIMED_OUT");
    expect(t.reserved.size).toBe(0);
  });
  it("retries an uncertain start with the same offer without releasing either reservation", async () => {
    const t=setup(); await t.join(t.a); await t.join(t.b); await t.confirm(t.a); await t.confirm(t.b);
    const tokens:string[]=[]; let committed=false;
    t.port.start=async(_a,_b,_mode,token)=>{tokens.push(token);if(!committed){committed=true;throw Error("connection lost after commit");}return token;};
    t.at(3000); await t.queue.tick();
    expect(t.state(t.a).status).toBe("COUNTDOWN"); expect(t.reserved.size).toBe(2);
    await t.queue.tick();
    expect(t.state(t.a)).toMatchObject({status:"MATCHED",roomId:tokens[0]});
    expect(tokens).toEqual([tokens[0],tokens[0]]);
  });
  it("does not let a delayed admission block another player's disconnect expiry", async () => {
    const t=setup(); await t.join(t.a);
    let unblock!:()=>void, started!:()=>void;
    const blocked=new Promise<void>(resolve=>{unblock=resolve;});
    const entered=new Promise<void>(resolve=>{started=resolve;});
    t.port.occupied=async actor=>{if(actor.userId===t.b.actor.userId){started();await blocked;}return false;};
    const admission=t.connect(t.b); await entered;
    try {
      let finished=false;
      const expired=t.queue.disconnect(t.a.actor.userId).then(async()=>{t.at(30000);await t.queue.tick();finished=true;});
      await nextTurn();
      expect(finished).toBe(true);
      expect(t.state(t.a).status).toBe("CANCELLED");
      await expired;
    } finally {unblock();await admission;}
  });
  it("withdraws a revoked session before a countdown can start", async () => {
    const t=setup();await t.join(t.a);await t.join(t.b);await t.confirm(t.a);await t.confirm(t.b);
    t.port.authorize=async identity=>identity.actor.userId!==t.b.actor.userId;
    t.at(3000);await t.queue.tick();
    expect(t.starts).toEqual([]);expect(t.state(t.b).status).toBe("CANCELLED");
  });
  it("bounds simultaneous commands before authorization while preserving accepted receipts", async () => {
    const t=setup();await t.connect(t.a);
    let unblock!:()=>void, started!:()=>void, reads=0;
    const blocked=new Promise<void>(resolve=>{unblock=resolve;});
    const entered=new Promise<void>(resolve=>{started=resolve;});
    t.port.authorize=async()=>{reads++;started();await blocked;return true;};
    const command={commandId:randomUUID(),type:"sync"};
    const first=t.queue.command(t.a.actor.userId,command);await entered;
    const flood=Array.from({length:100},()=>t.queue.command(t.a.actor.userId,{commandId:randomUUID(),type:"sync"}).catch(()=>null));
    unblock();await first;
    const results=await Promise.all(flood);
    expect(results.filter(result=>result===null).length).toBeGreaterThan(0);
    expect(reads).toBeLessThan(101);
    await t.queue.command(t.a.actor.userId,command);
  });
  it("rate limits sequential sync spam before another authorization read", async () => {
    const t=setup();await t.connect(t.a);let reads=0;
    t.port.authorize=async()=>{reads++;return true;};
    for(let i=0;i<120;i++) await t.command(t.a,{type:"sync"});
    await expect(t.command(t.a,{type:"sync"})).rejects.toThrow();
    expect(reads).toBe(120);
    t.at(60000);await t.command(t.a,{type:"sync"});
  });
  it("keeps accepted command receipts for 24 hours when the per-user bound is full", async () => {
    const t=setup();await t.connect(t.a);
    const first={commandId:randomUUID(),type:"sync"};
    await t.queue.command(t.a.actor.userId,first);
    for(let i=1;i<1024;i++) {t.at(Math.floor(i/120)*60000);await t.command(t.a,{type:"sync"});}
    await expect(t.command(t.a,{type:"sync"})).rejects.toThrow();
    t.at(86399999);
    await t.queue.command(t.a.actor.userId,first);
    await expect(t.queue.command(t.a.actor.userId,{...first,type:"join",mode:"CASUAL"})).rejects.toThrow();
    expect(t.reserved.size).toBe(0);
    t.at(86400000);
    await t.command(t.a,{type:"sync"});
  });
});
