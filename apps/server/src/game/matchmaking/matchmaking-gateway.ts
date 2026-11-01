import type { Server as HttpServer } from "node:http";
import { Server, type Socket } from "socket.io";
import type { MatchmakingAcknowledgement } from "@xiangqi/shared";
import { RoomError } from "../room/room.types.js";
import type { MatchmakingQueue, QueueIdentity } from "./matchmaking-queue.js";
import type { MatchmakingService } from "./matchmaking.service.js";
import { logEvent } from "../../core/logger.js";

export function attachMatchmaking(httpServer: HttpServer, queue: MatchmakingQueue, service: MatchmakingService, corsOrigins: readonly string[]) {
  const events=["request","upgrade","close","listening"] as const;
  const previous=events.map(event=>httpServer.listeners(event));
  const io=new Server(httpServer,{path:"/matchmaking/socket.io",serveClient:false,maxHttpBufferSize:16384,destroyUpgrade:false,cors:{origin:[...corsOrigins],credentials:true},allowRequest:(request,done)=>done(null,typeof request.headers.origin==="string" && corsOrigins.includes(request.headers.origin))});
  const added=events.map((event,index)=>httpServer.listeners(event).filter(listener=>!previous[index]!.includes(listener)));
  io.use((_socket,next)=>next(Error("Phiên truy cập không hợp lệ")));
  const namespace=io.of("/matchmaking");
  const identities=new WeakMap<Socket,QueueIdentity>();
  const peers=new Map<string,{socket:Socket;identity:QueueIdentity;prior:string}>();
  const operations=new Set<Promise<unknown>>();
  let stopped=false,inFlight=false,closing:Promise<void>|undefined;
  function track<T>(promise:Promise<T>) {operations.add(promise);void promise.finally(()=>operations.delete(promise)).catch(()=>{});return promise;}
  const error=(value:unknown):MatchmakingAcknowledgement=>({status:"error",error:value instanceof RoomError ? {code:value.code,message:value.message}:{code:"MATCHMAKING_UNAVAILABLE",message:"Chưa thể tìm trận, vui lòng thử lại"}});
  function publish() {
    for(const peer of peers.values()) {
      const state=queue.state(peer.identity.actor.userId);
      const fingerprint=JSON.stringify({...state,serverNow:undefined});
      if(fingerprint!==peer.prior && peer.socket.connected) {peer.prior=fingerprint;peer.socket.emit("matchmaking.state",state);}
    }
  }
  namespace.use((socket,next)=>{
    track((async()=>{
      try {if(stopped) throw Error("Closed");const identity=await service.identity(socket.handshake.auth);if(stopped) throw Error("Closed");identities.set(socket,identity);next();}
      catch {next(Error("Phiên truy cập không hợp lệ"));}
    })());
  });
  namespace.on("connection",socket=>{
    const identity=identities.get(socket);
    if(stopped || !identity) {socket.disconnect(true);return;}
    const admission=queue.connect(socket.id,identity);
    socket.on("disconnect",()=>{peers.delete(socket.id);void track(admission.catch(()=>undefined).then(()=>queue.disconnect(socket.id))).catch(()=>{});});
    socket.on("matchmaking.command",(input:unknown,ack:unknown)=>{
      if(typeof ack!=="function") return;
      void track((async()=>{
        try {await admission;if(stopped || !socket.connected) throw Error("Closed");const state=await queue.command(socket.id,input);ack({status:"ok",state});publish();}
        catch(value) {ack(error(value));if(value instanceof RoomError && value.status===401) socket.disconnect(true);}
      })());
    });
    void track(admission.then(state=>{
      if(stopped || !socket.connected) return queue.disconnect(socket.id);
      peers.set(socket.id,{socket,identity,prior:""});socket.emit("matchmaking.state",state);
    }).catch(value=>{socket.emit("matchmaking.error",error(value));socket.disconnect(true);}));
  });
  const timer=setInterval(()=>{
    if(stopped || inFlight) return;
    inFlight=true;
    void track(queue.tick().then(publish).catch(()=>{
      process.stderr.write(logEvent("error","matchmaking_tick_failed")+"\n");
    }).finally(()=>{inFlight=false;}));
  },100);
  timer.unref();
  return {close():Promise<void> {
    if(closing) return closing;
    stopped=true;clearInterval(timer);namespace.disconnectSockets(true);io.engine.close();
    events.forEach((event,index)=>added[index]!.forEach(listener=>httpServer.removeListener(event,listener as (...args:unknown[])=>void)));
    for(const listener of previous[0]!) if(!httpServer.listeners("request").includes(listener)) httpServer.on("request",listener as (...args:unknown[])=>void);
    closing=(async()=>{while(operations.size) await Promise.allSettled([...operations]);await namespace.adapter.close();await queue.close();})();
    return closing;
  }};
}
