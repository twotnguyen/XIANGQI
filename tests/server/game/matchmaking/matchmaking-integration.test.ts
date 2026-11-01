import { randomUUID } from "node:crypto";
import type { AddressInfo } from "node:net";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { io, type Socket } from "socket.io-client";
import type { CommandAcknowledgement, MatchmakingAcknowledgement, MatchmakingCommand, MatchmakingState, RoomSnapshot } from "@xiangqi/shared";
import { createApp, drainRealtime } from "@server/app.js";
import { createRoomRuntime } from "@server/game/game.runtime.js";
import { databaseUrl, pool, loginPool, resetBase, apply, registration, member, env, waitFor } from "../game.runtime.test-helper.js";

async function schema() {
  await pool.query("DROP SCHEMA IF EXISTS xiangqi_social CASCADE; DROP SCHEMA IF EXISTS xiangqi_ai CASCADE");
  await resetBase();
  for(const name of ["20261011000010_room_chat","20261011000011_ai_reservations","20261011000012_ai_presence","20261011000013_side_swap","20261011000014_friendships","20261011000015_media_share","20261011000016_room_viewers","20261019000019_principal_foreign_keys","20261102000004_direct_messages","20261103000009_yc7_chat_quota","20261103000010_media_generation","20261103000011_yc9_ranked"]) await apply(`supabase/migrations/${name}.sql`);
}
async function boot() {
  const r=registration();
  const players=[await member(r),await member(r),await member(r)];
  const runtime=await createRoomRuntime({...env,NODE_ENV:"test"},r.context);
  if(!runtime) throw Error("Runtime missing");
  const app=await createApp(["http://localhost:5173"],[runtime.module],null,runtime.realtime,runtime.publicFeed);
  runtime.matchmaking.attach(app.getHttpServer(),["http://localhost:5173"]);
  await app.listen(0,"127.0.0.1");await runtime.start();
  const base=`http://127.0.0.1:${(app.getHttpServer().address() as AddressInfo).port}`;
  const sockets:Socket[]=[];
  const states=new Map<string,MatchmakingState>();
  const snapshots=new Map<string,RoomSnapshot>();
  const proof=(index:number)=>({kind:"member",accessToken:players[index]!.token,appSession:players[index]!.appSession});
  const headers=(index:number)=>({Authorization:`Bearer ${players[index]!.token}`,"X-Xiangqi-Session":players[index]!.appSession,"Content-Type":"application/json"});
  const open=async(index:number,queue=true,roomId?:string)=>{
    const socket=io(base+(queue?"/matchmaking":""),{path:queue?"/matchmaking/socket.io":"/socket.io",autoConnect:false,reconnection:false,transports:["websocket"],extraHeaders:{Origin:"http://localhost:5173"},auth:queue?proof(index):{accessToken:players[index]!.token,appSession:players[index]!.appSession,roomId,tabId:randomUUID()}});
    socket.on("matchmaking.state",state=>states.set(players[index]!.id,state));socket.on("room.snapshot",s=>snapshots.set(players[index]!.id,s));
    sockets.push(socket);
    await new Promise<void>((resolve,reject)=>{socket.once("connect",resolve);socket.once("connect_error",reject);socket.connect();});
    if(queue) await waitFor(async()=>states.get(players[index]!.id),Boolean);
    else await waitFor(async()=>snapshots.get(players[index]!.id),Boolean);
    return socket;
  };
  const command=(socket:Socket,input:Omit<MatchmakingCommand,"commandId"> & {commandId?:string})=>new Promise<MatchmakingAcknowledgement>((resolve,reject)=>{socket.timeout(10000).emit("matchmaking.command",{commandId:randomUUID(),...input},(error:Error|null,result:MatchmakingAcknowledgement)=>error?reject(error):resolve(result));});
  const match=async(mode:"CASUAL"|"RANKED")=>{
    const a=await open(0),b=await open(1);
    expect((await command(a,{type:"join",mode})).status).toBe("ok");expect((await command(b,{type:"join",mode})).status).toBe("ok");
    await waitFor(async()=>states.get(players[0]!.id),s=>s?.status==="CONFIRMING");
    const offerId=states.get(players[0]!.id)!.offerId!;
    expect((await command(a,{type:"confirm",offerId})).status).toBe("ok");expect((await command(b,{type:"confirm",offerId})).status).toBe("ok");
    expect((await pool.query("SELECT count(*)::int n FROM public.matches")).rows[0].n).toBe(0);
    await waitFor(async()=>states.get(players[0]!.id),s=>s?.status==="MATCHED",10000);
    const roomId=states.get(players[0]!.id)!.roomId!;
    return {a,b,roomId,roomA:await open(0,false,roomId),roomB:await open(1,false,roomId)};
  };
  return {players,runtime,base,states,snapshots,open,command,match,headers,async close(){for(const socket of sockets)socket.disconnect();await runtime.stop();await drainRealtime(app);await runtime.close();await app.close();}};
}
describe.skipIf(!databaseUrl)("YC9 real HTTP/socket/Postgres",()=>{
  beforeEach(schema);
  afterAll(async()=>{await loginPool.end();await pool.end();});
  it("starts Ranked once, enforces privacy, settles Elo and preserves FINISHED after one departure",async()=>{
    const t=await boot();try {
      const {roomId,roomA}=await t.match("RANKED");
      const snapshot=(await waitFor(async()=>t.snapshots.get(t.players[0]!.id),s=>!!s?.room.connected.red && !!s.room.connected.black))!;
      expect(snapshot.room).toMatchObject({kind:"RANKED",status:"PLAYING",inviteCode:null,timeMinutes:10,viewerLimit:0});
      expect(snapshot.match?.canAbort).toBe(false);
      expect(snapshot.room.seatPlayers?.red?.rating?.elo).toBe(1200);
      const outsiders=await fetch(`${t.base}/rooms/${roomId}`,{headers:t.headers(2)});expect(outsiders.status).toBe(403);
      const action={commandId:randomUUID(),roomId,expectedVersion:snapshot.version,action:{type:"match.resign",payload:{matchId:snapshot.match!.id,matchVersion:snapshot.match!.version}}};
      const ack=await new Promise<CommandAcknowledgement>(resolve=>roomA.emit("room.command",action,resolve));expect(ack).toMatchObject({status:"ok"});
      const duplicate=await new Promise<CommandAcknowledgement>(resolve=>roomA.emit("room.command",action,resolve));expect(duplicate.status).toBe("ok");
      const ratings=(await pool.query("SELECT elo,completed FROM xiangqi_room.ratings ORDER BY elo")).rows;
      expect(ratings).toEqual([{elo:1184,completed:1},{elo:1216,completed:1}]);
      const ranked=await fetch(t.base+"/rankings/me",{headers:t.headers(0)});expect(ranked.status).toBe(200);expect(await ranked.json()).toMatchObject({completed:1,remaining:4});
      await waitFor(async()=>t.snapshots.get(t.players[1]!.id),s=>s?.room.status==="FINISHED");
      if(ack.status!=="ok") throw Error("Resign failed");
      const ended=ack.snapshot;
      expect(ended.room.status).toBe("FINISHED");
      expect(ended.match?.rating?.red.delta).toBe(ended.role==="red"?-16:16);
      const control={tabId:(await pool.query("SELECT tab_id FROM xiangqi_realtime.controllers WHERE connection_id=$1",[roomA.id])).rows[0].tab_id,connectionId:roomA.id,generation:ended.control.generation};
      const leave=await fetch(t.base+`/rooms/${roomId}/leave`,{method:"POST",headers:t.headers(0),body:JSON.stringify({commandId:randomUUID(),expectedVersion:ended.version,control})});expect(leave.status).toBe(200);
      const room=(await pool.query("SELECT status,finished_at FROM public.rooms WHERE id=$1",[roomId])).rows[0];expect(room.status).toBe("FINISHED");expect(room.finished_at).not.toBeNull();
    } finally {await t.close();}
  },30000);
  it("starts Casual without an invite code and creates private chat entries from the actual membership trigger",async()=>{
    const t=await boot();try {
      const {roomId}=await t.match("CASUAL");
      const snapshot=t.snapshots.get(t.players[0]!.id)!;expect(snapshot.room).toMatchObject({kind:"CASUAL",timeMinutes:15,inviteCode:null});
      expect((await pool.query("SELECT count(*)::int n FROM xiangqi_chat.entries WHERE room_id=$1",[roomId])).rows[0].n).toBe(2);
      expect((await pool.query("SELECT count(*)::int n FROM public.matches WHERE room_id=$1",[roomId])).rows[0].n).toBe(1);
      expect((await pool.query("SELECT count(*)::int n FROM xiangqi_room.ratings")).rows[0].n).toBe(0);
    }finally{await t.close();}
  },30000);
});
