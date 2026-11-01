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

async function gateway(port: MatchmakingPort, identities: QueueIdentity[], options: {trustedProxyHops?:number; beforeIdentity?:(index:number)=>Promise<void>}={}) {
  const http=createServer();
  const queue=new MatchmakingQueue(port);
  let identityReads=0;
  const service={identity:async (auth: {index:number})=>{identityReads++;await options.beforeIdentity?.(auth.index);return identities[auth.index]!;}} as MatchmakingService;
  const attached=attachMatchmaking(http,queue,service,["http://localhost:5173"],options.trustedProxyHops);
  await new Promise<void>(resolve=>http.listen(0,"127.0.0.1",resolve));
  const base=`http://127.0.0.1:${(http.address() as AddressInfo).port}`;
  const sockets:Socket[]=[];
  async function open(index:number, forwarded?:string) {
    const socket=io(base+"/matchmaking",{path:"/matchmaking/socket.io",transports:["websocket"],reconnection:false,extraHeaders:{Origin:"http://localhost:5173",...(forwarded ? {"X-Forwarded-For":forwarded}:{})},auth:{index}});
    sockets.push(socket);
    await new Promise<void>((resolve,reject)=>{socket.once("matchmaking.state",()=>resolve());socket.once("connect_error",reject);});
    return socket;
  }
  const command=(socket:Socket,type:string,mode?:string)=>new Promise<{status:string;error?:{code:string}}>((resolve,reject)=>socket.timeout(2000).emit("matchmaking.command",{commandId:randomUUID(),type,mode},(error:Error|null,result:{status:string;error?:{code:string}})=>error?reject(error):resolve(result)));
  return {open,command,identityReads:()=>identityReads,async close(){sockets.forEach(socket=>socket.disconnect());await attached.close();await new Promise<void>(resolve=>http.close(()=>resolve()));}};
}

function port(): MatchmakingPort {
  const p:MatchmakingPort={authorize:async()=>true,authorizeMany:async identities=>Promise.allSettled(identities.map(identity=>p.authorize(identity))),occupied:async()=>false,reserve:async()=>1200,release:async()=>{},canPair:async()=>true,start:async()=>randomUUID()};
  return p;
}

it("allows nine authenticated users behind one address",async()=>{
  const t=await gateway(port(),Array.from({length:9},identity));
  try {
    for(let i=0;i<9;i++) await t.open(i);
    expect(t.identityReads()).toBe(9);
  } finally {await t.close();}
});

it.each([0,1])("caps pending identity reads despite spoofed forwarded addresses with %i trusted hops",async trustedProxyHops=>{
  let release!:()=>void, allStarted!:()=>void, count=0;
  const gate=new Promise<void>(resolve=>{release=resolve;});
  const started=new Promise<void>(resolve=>{allStarted=resolve;});
  const t=await gateway(port(),Array.from({length:9},identity),{trustedProxyHops,beforeIdentity:async()=>{if(++count===8)allStarted();await gate;}});
  const pending=Array.from({length:8},(_,i)=>t.open(i,`192.0.2.${i+1}, 198.51.100.1`));
  try {
    await started;
    await expect(t.open(8,"192.0.2.99, 198.51.100.1")).rejects.toThrow();
    expect(t.identityReads()).toBe(8);
  } finally {release();await Promise.allSettled(pending);await t.close();}
});

it("uses the trusted proxy address to separate concurrent clients",async()=>{
  let release!:()=>void, finished!:()=>void, count=0;
  const gate=new Promise<void>(resolve=>{release=resolve;});
  const startedOrRejected=new Promise<void>(resolve=>{finished=resolve;});
  const t=await gateway(port(),Array.from({length:9},identity),{trustedProxyHops:1,beforeIdentity:async()=>{if(++count===9)finished();await gate;}});
  const pending=Array.from({length:9},(_,i)=>t.open(i,`203.0.113.5, 198.51.100.${i+1}`).catch(()=>{finished();}));
  try {
    await startedOrRejected;
    expect(t.identityReads()).toBe(9);
  } finally {release();await Promise.allSettled(pending);await t.close();}
});

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
