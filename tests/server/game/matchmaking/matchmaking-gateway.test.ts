import { createServer } from "node:http";
import { randomUUID } from "node:crypto";
import type { AddressInfo } from "node:net";
import { io, type Socket } from "socket.io-client";
import { expect, it } from "vitest";
import { attachMatchmaking } from "../../../../apps/server/src/game/matchmaking/matchmaking-gateway.js";
import { MatchmakingQueue, type MatchmakingPort, type QueueIdentity } from "../../../../apps/server/src/game/matchmaking/matchmaking-queue.js";
import type { MatchmakingService } from "../../../../apps/server/src/game/matchmaking/matchmaking.service.js";
import { RoomError } from "../../../../apps/server/src/game/room/room.types.js";

function identity(): QueueIdentity {
  return {actor:{userId:randomUUID(),kind:"member"},sessionKey:randomUUID(),proof:{accessToken:"token",appSession:"session"}};
}

async function gateway(port: MatchmakingPort, identities: QueueIdentity[]) {
  const http=createServer();
  const queue=new MatchmakingQueue(port);
  const service={identity:async (auth: {index:number})=>identities[auth.index]!} as MatchmakingService;
  const attached=attachMatchmaking(http,queue,service,["http://localhost:5173"]);
  await new Promise<void>(resolve=>http.listen(0,"127.0.0.1",resolve));
  const base=`http://127.0.0.1:${(http.address() as AddressInfo).port}`;
  const sockets:Socket[]=[];
  async function open(index:number) {
    const socket=io(base+"/matchmaking",{path:"/matchmaking/socket.io",transports:["websocket"],reconnection:false,extraHeaders:{Origin:"http://localhost:5173"},auth:{index}});
    sockets.push(socket);
    await new Promise<void>((resolve,reject)=>{socket.once("matchmaking.state",()=>resolve());socket.once("connect_error",reject);});
    return socket;
  }
  const command=(socket:Socket,type:string,mode?:string)=>new Promise<any>((resolve,reject)=>socket.timeout(2000).emit("matchmaking.command",{commandId:randomUUID(),type,mode},(error:Error|null,result:unknown)=>error?reject(error):resolve(result)));
  return {open,command,async close(){sockets.forEach(socket=>socket.disconnect());await attached.close();await new Promise<void>(resolve=>http.close(()=>resolve()));}};
}

function port(): MatchmakingPort {
  return {authorize:async()=>true,occupied:async()=>false,reserve:async()=>1200,release:async()=>{},canPair:async()=>true,start:async()=>randomUUID()};
}

it("does not disconnect a valid requester when the other player's session expires during Ranked pairing",async()=>{
  const p=port(), players=[identity(),identity()]; let expired=false;
  p.authorize=async identity=>!(expired && identity.actor.userId===players[0]!.actor.userId);
  p.canPair=async()=>{expired=true;throw new RoomError("AUTH_REQUIRED","expired peer",401);};
  const t=await gateway(p,players);
  try {
    const a=await t.open(0),b=await t.open(1);
    expect((await t.command(a,"join","RANKED")).status).toBe("ok");
    await t.command(b,"join","RANKED");
    expect(b.connected).toBe(true);
    expect((await t.command(b,"sync")).status).toBe("ok");
  } finally {await t.close();}
});

it("does not broadcast a tick infrastructure error to an idle client",async()=>{
  const p=port(), players=[identity(),identity()]; let fail=false, observed!:()=>void;
  const tickFailed=new Promise<void>(resolve=>{observed=resolve;});
  p.authorize=async identity=>{if(fail && identity.actor.userId===players[0]!.actor.userId){observed();throw Error("database unavailable");}return true;};
  const t=await gateway(p,players);
  try {
    const active=await t.open(0),idle=await t.open(1); const errors:unknown[]=[];
    idle.on("matchmaking.error",error=>errors.push(error));
    expect((await t.command(active,"join","CASUAL")).status).toBe("ok");
    fail=true; await tickFailed;
    expect((await t.command(idle,"sync")).status).toBe("ok");
    expect(errors).toEqual([]); expect(idle.connected).toBe(true);
  } finally {fail=false;await t.close();}
},5000);
