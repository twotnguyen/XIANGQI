import { randomInt, randomUUID } from "node:crypto";
import type { MatchmakingCommand, MatchmakingMode, MatchmakingState } from "@xiangqi/shared";
import type { RoomActor } from "../room/room.types.js";
import { RoomError } from "../room/room.types.js";
import type { RoomRequestProof } from "../room/room-session.js";
import { logEvent } from "../../core/logger.js";

export interface QueueIdentity {
  actor: RoomActor;
  sessionKey: string;
  proof: RoomRequestProof;
}
export interface MatchmakingPort {
  authorize(identity: QueueIdentity): Promise<boolean>;
  authorizeMany(identities: QueueIdentity[]): Promise<PromiseSettledResult<boolean>[]>;
  occupied(actor: RoomActor): Promise<boolean>;
  reserve(identity: QueueIdentity): Promise<number>;
  release(identity: QueueIdentity): Promise<void>;
  canPair(a: QueueIdentity, b: QueueIdentity): Promise<boolean>;
  start(a: QueueIdentity, b: QueueIdentity, mode: MatchmakingMode, token: string, recovering?: boolean): Promise<string>;
}
interface Entry {
  identity: QueueIdentity;
  queueId: string;
  mode: MatchmakingMode;
  elo: number;
  startedAt: number;
  order: number;
  deadline: number;
  status: MatchmakingState["status"];
  confirmed: boolean;
  pair: Pair | null;
  disconnectedAt: number | null;
  checkedAt: number;
  roomId: string | null;
  reason?: string;
}
interface Pair { id: string; a: Entry; b: Entry; deadline: number; countdown: boolean; starting?: boolean }
const active = (entry: Entry) => ["SEARCHING", "CONFIRMING", "WAITING", "COUNTDOWN"].includes(entry.status);
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function fail(message: string): never { throw new RoomError("MATCHMAKING_CONFLICT", message); }
const restart = "Hàng đợi đã bị huỷ, hãy tìm lại";
function reportFailure() { process.stderr.write(logEvent("error","matchmaking_pair_failed")+"\n"); }

export function parseMatchmakingCommand(value: unknown): MatchmakingCommand {
  if (!value || typeof value !== "object" || Array.isArray(value)) fail("Lệnh tìm trận không hợp lệ");
  const row = value as Record<string, unknown>;
  if (Object.keys(row).some(key => !["commandId", "type", "mode", "queueId", "offerId", "bootId"].includes(key)) ||
    typeof row.commandId !== "string" || !uuid.test(row.commandId) ||
    !["join", "cancel", "confirm", "decline", "sync"].includes(String(row.type)) ||
    (row.mode !== undefined && !["CASUAL", "RANKED"].includes(String(row.mode))) ||
    ["queueId", "offerId", "bootId"].some(key => row[key] !== undefined && (typeof row[key] !== "string" || !uuid.test(row[key] as string))))
    fail("Lệnh tìm trận không hợp lệ");
  return row as unknown as MatchmakingCommand;
}

/** One serialized RAM queue; database actor locks arbitrate against every other game mode. */
export class MatchmakingQueue {
  readonly bootId = randomUUID();
  private readonly entries = new Map<string, Entry>();
  private readonly peers = new Map<string, QueueIdentity>();
  private readonly receipts = new Map<string, Map<string, { fingerprint: string; at: number }>>();
  private readonly idle = new Map<string, MatchmakingState>();
  private readonly absentSince = new Map<string, number>();
  private readonly commandInFlight = new Map<string, number>();
  private readonly commandTails = new Map<string, Promise<void>>();
  private readonly commandWindows = new Map<string, {count:number; until:number}>();
  private receiptCount = 0;
  private pending: Promise<unknown> = Promise.resolve();
  private closed = false;
  private nextOrder = 0;
  constructor(private readonly port: MatchmakingPort, private readonly now = Date.now, private readonly choose = (size: number) => randomInt(size)) {}

  private run<T>(work: () => Promise<T>): Promise<T> {
    const result = this.pending.then(work);
    this.pending = result.catch(() => undefined);
    return result;
  }
  private connected(entry: Entry) {
    return [...this.peers.values()].some(peer => peer.actor.userId === entry.identity.actor.userId && peer.sessionKey === entry.identity.sessionKey);
  }
  private async authorized(identity: QueueIdentity) {
    if (this.closed || !(await this.port.authorize(identity))) throw new RoomError("AUTH_REQUIRED", "Phiên đăng nhập không hợp lệ", 401);
  }
  state(userId: string): MatchmakingState {
    const entry = this.entries.get(userId);
    const base = {bootId: this.bootId, serverNow: new Date(this.now()).toISOString()};
    if (!entry) return {...base, queueId:null,mode:null,status:"IDLE",startedAt:null,deadline:null,offerId:null,confirmed:false,roomId:null,...this.idle.get(userId),...base};
    return {...base,queueId:entry.queueId,mode:entry.mode,status:entry.status,startedAt:new Date(entry.startedAt).toISOString(),deadline:active(entry) ? new Date(entry.pair?.deadline ?? entry.deadline).toISOString() : null,offerId:entry.pair?.id ?? null,confirmed:entry.confirmed,roomId:entry.roomId,...(entry.reason ? {reason:entry.reason} : {})};
  }
  private refreshIdle(identity: QueueIdentity, occupied: boolean) {
    const userId=identity.actor.userId;
    if (this.entries.get(userId)?.status === "MATCHED" && !occupied) this.entries.delete(userId);
    if (!this.entries.has(userId)) this.idle.set(userId,{...this.state(userId),occupiedElsewhere:occupied});
  }
  async connect(socketId: string, identity: QueueIdentity) {
    const snapshot=this.entries.get(identity.actor.userId);
    const status=snapshot?.status;
    const [,occupied]=await Promise.all([this.authorized(identity),!snapshot || snapshot.status==="MATCHED" ? this.port.occupied(identity.actor) : Promise.resolve(undefined)]);
    return this.run(async () => {
      if (this.closed) throw new RoomError("AUTH_REQUIRED", "Phiên đăng nhập không hợp lệ", 401);
      await this.expireDisconnected();
      let entry = this.entries.get(identity.actor.userId);
      if (entry && entry.identity.sessionKey !== identity.sessionKey) {
        if (entry!==snapshot || entry.status!==status) fail("Phiên tìm trận đã thay đổi");
        await this.authorized(identity);
        await this.withdraw(entry, "Phiên tìm trận đã thay đổi");
        this.entries.delete(identity.actor.userId);
        entry = undefined;
      }
      this.peers.set(socketId, identity);
      this.absentSince.delete(identity.actor.userId);
      if (entry && active(entry)) entry.disconnectedAt = null;
      if ((!entry || entry.status === "MATCHED") && entry===snapshot && entry?.status===status && occupied!==undefined) this.refreshIdle(identity,occupied);
      return this.state(identity.actor.userId);
    });
  }
  disconnect(socketId: string) {
    return this.run(async () => {
      const identity = this.peers.get(socketId); this.peers.delete(socketId);
      if (!identity) return;
      const entry = this.entries.get(identity.actor.userId);
      if (entry && active(entry) && !this.connected(entry) && entry.disconnectedAt === null) entry.disconnectedAt = this.now();
      if (![...this.peers.values()].some(peer=>peer.actor.userId===identity.actor.userId)) this.absentSince.set(identity.actor.userId,this.now());
    });
  }
  async command(socketId: string, input: unknown) {
    const command = parseMatchmakingCommand(input);
    const identity = this.peers.get(socketId);
    if (!identity) throw new RoomError("AUTH_REQUIRED", "Phiên đăng nhập không hợp lệ", 401);
    const userId=identity.actor.userId;
    const inFlight=this.commandInFlight.get(userId) ?? 0;
    if (inFlight>=8) fail("Quá nhiều lệnh tìm trận");
    const window=this.commandWindows.get(userId);
    if (window && this.now()<window.until) {
      if (window.count>=120) fail("Quá nhiều lệnh tìm trận");
      window.count++;
    } else this.commandWindows.set(userId,{count:1,until:this.now()+60000});
    this.commandInFlight.set(userId,inFlight+1);
    const prior=this.commandTails.get(userId);
    let release!:()=>void;
    const turn=new Promise<void>(resolve=>{release=resolve;});
    this.commandTails.set(userId,turn);
    try {
      if (prior) await prior;
      const snapshot=this.entries.get(userId), status=snapshot?.status;
      const [,occupied]=await Promise.all([this.authorized(identity),command.type==="sync" && (!snapshot || !active(snapshot)) ? this.port.occupied(identity.actor) : Promise.resolve(undefined)]);
      return await this.run(async () => {
      if (this.closed || this.peers.get(socketId)!==identity) throw new RoomError("AUTH_REQUIRED", "Phiên đăng nhập không hợp lệ", 401);
      await this.expireDisconnected();
      let entry = this.entries.get(userId);
      if (entry && entry.identity.sessionKey !== identity.sessionKey) fail("Phiên tìm trận đã thay đổi");
      const fingerprint = JSON.stringify([command.type,command.mode,command.queueId,command.offerId,command.bootId]);
      let receipts = this.receipts.get(userId);
      if (!receipts) receipts = new Map();
      for (const [id,receipt] of receipts) if (this.now()-receipt.at>=86400000) { receipts.delete(id); this.receiptCount--; }
      const prior = receipts.get(command.commandId);
      if (prior) {
        if (prior.fingerprint !== fingerprint) fail("Mã lệnh đã được sử dụng");
        return this.state(userId);
      }
      if (receipts.size>=1024 || this.receiptCount>=100000) fail("Quá nhiều lệnh tìm trận");
      if (command.type === "sync") {
        if (!entry && command.bootId && command.bootId !== this.bootId && command.queueId) {
          this.idle.set(userId,{...this.state(userId),status:"CANCELLED",reason:restart});
        } else if ((!entry || !active(entry)) && entry===snapshot && entry?.status===status && occupied!==undefined) this.refreshIdle(identity,occupied);
      } else if (command.type === "join") {
        if (!command.mode) fail("Chọn chế độ tìm trận");
        if (command.mode === "RANKED" && identity.actor.kind !== "member") throw new RoomError("MATCHMAKING_MEMBER_REQUIRED","Khách không được Đánh Hạng",403);
        if (entry && active(entry)) fail("Bạn đang ở trong một ván/phòng khác");
        const elo = await this.port.reserve(identity);
        entry = {identity,queueId:command.commandId,mode:command.mode,elo,startedAt:this.now(),order:this.nextOrder++,deadline:this.now()+120000,status:"SEARCHING",confirmed:false,pair:null,disconnectedAt:null,checkedAt:this.now(),roomId:null};
        this.entries.set(userId,entry); this.idle.delete(userId);
        await this.pairAndExpire();
      } else {
        if (!entry || !active(entry)) fail("Lượt tìm trận đã hết hiệu lực");
        if (command.type === "cancel") {
          if (entry.status !== "SEARCHING" || command.queueId !== entry.queueId) fail("Trận đã được ghép; hãy Xác nhận hoặc Từ chối");
          await this.withdraw(entry,"Đã hủy tìm trận");
        } else {
          const pair = entry.pair;
          if (!pair || pair.id !== command.offerId || pair.countdown || this.now() >= pair.deadline) fail("Xác nhận trận đã hết hiệu lực");
          if (command.type === "decline") await this.breakPair(pair, entry);
          else {
            entry.confirmed = true; entry.status = "WAITING";
            if (pair.a.confirmed && pair.b.confirmed) {
              pair.countdown = true; pair.deadline = this.now()+3000;
              pair.a.status = pair.b.status = "COUNTDOWN";
            }
          }
        }
      }
      receipts.set(command.commandId,{fingerprint,at:this.now()}); this.receipts.set(userId,receipts); this.receiptCount++;
      return this.state(userId);
      });
    } finally {
      release();
      if (this.commandTails.get(userId)===turn) this.commandTails.delete(userId);
      const remaining=(this.commandInFlight.get(userId) ?? 1)-1;
      if (remaining) this.commandInFlight.set(userId,remaining); else this.commandInFlight.delete(userId);
    }
  }
  private async cancel(entry: Entry, reason: string) {
    if (active(entry)) await this.port.release(entry.identity);
    entry.status = "CANCELLED"; entry.reason=reason; entry.pair=null; entry.confirmed=false;
  }
  private async withdraw(entry: Entry, reason: string) {
    if (entry.pair?.starting) fail("Trận đang được khôi phục");
    if (entry.pair) await this.breakPair(entry.pair, entry);
    else await this.cancel(entry,reason);
    entry.reason = reason;
  }
  private async breakPair(pair: Pair, declined?: Entry, requeueBoth = false) {
    const requeue = (entry: Entry) => entry !== declined && entry.confirmed &&
      (this.connected(entry) || (!pair.countdown && entry.disconnectedAt !== null && this.now()-entry.disconnectedAt<30000)) &&
      (requeueBoth || !pair.countdown || !!declined);
    for (const entry of [pair.a,pair.b]) if (!requeue(entry) && active(entry)) await this.port.release(entry.identity);
    for (const entry of [pair.a,pair.b]) {
      if (requeue(entry)) {
        entry.status="SEARCHING";entry.startedAt=this.now();entry.deadline=this.now()+120000;entry.pair=null;entry.confirmed=false;delete entry.reason;
      } else {entry.status="CANCELLED";entry.reason="Trận đã bị hủy; hãy tìm lại";entry.pair=null;entry.confirmed=false;}
    }
  }
  private async expireDisconnected() {
    for (const entry of this.entries.values()) if (active(entry) && !entry.pair?.starting && entry.disconnectedAt !== null && this.now()-entry.disconnectedAt>=30000) {
      try { await this.withdraw(entry,"Bạn đã mất kết nối quá 30 giây"); } catch { reportFailure(); }
    }
  }
  private window(entry: Entry, at = this.now()) { return Math.min(400,100+50*Math.floor(Math.max(0,at-entry.startedAt)/10000)); }
  private async pairAndExpire() {
    const searching = [...this.entries.values()].filter(entry => entry.status === "SEARCHING" && this.connected(entry)).sort((a,b)=>a.startedAt-b.startedAt || a.order-b.order);
    for (const a of searching) {
      if (a.pair || a.status!=="SEARCHING") continue;
      const compatible: Entry[] = [];
      for (const b of searching) {
        if (a===b || b.pair || b.status!=="SEARCHING" || a.mode!==b.mode || a.identity.actor.userId===b.identity.actor.userId) continue;
        const lastAttemptAt=Math.min(this.now(),a.deadline,b.deadline);
        if (a.startedAt>lastAttemptAt || b.startedAt>lastAttemptAt) continue;
        if (a.mode==="RANKED") {
          if (Math.abs(a.elo-b.elo)>Math.max(this.window(a,lastAttemptAt),this.window(b,lastAttemptAt))) continue;
          try { if (!(await this.port.canPair(a.identity,b.identity))) continue; }
          catch (error) {
            try {
              if (error instanceof RoomError && error.status===401) {
                for (const entry of [a,b]) if (!(await this.port.authorize(entry.identity))) await this.withdraw(entry,"Phiên đăng nhập đã hết hiệu lực");
              } else if (error instanceof RoomError) {
                await this.cancel(a,"Trận đã bị hủy; hãy tìm lại"); await this.cancel(b,"Trận đã bị hủy; hãy tìm lại");
              } else reportFailure();
            } catch { reportFailure(); }
            continue;
          }
        }
        if (a.status!=="SEARCHING" || b.status!=="SEARCHING") continue;
        compatible.push(b);
      }
      const available=compatible.filter(entry=>entry.status==="SEARCHING" && !entry.pair);
      if (a.status!=="SEARCHING" || !available.length) continue;
      const b=available[this.choose(available.length)]!;
      const pair:Pair={id:randomUUID(),a,b,deadline:this.now()+30000,countdown:false};
      a.pair=b.pair=pair;a.status=b.status="CONFIRMING";a.confirmed=b.confirmed=false;
    }
    for (const entry of this.entries.values()) if (entry.status==="SEARCHING" && this.now()>=entry.deadline) {
      try { await this.port.release(entry.identity);entry.status="TIMED_OUT";entry.reason="Không tìm được đối thủ, vui lòng tìm lại sau"; }
      catch { reportFailure(); }
    }
  }
  async tick() {
    const due=[...this.entries.values()].filter(entry=>active(entry) && !entry.pair?.starting && this.now()-entry.checkedAt>=1000);
    const checks=await this.port.authorizeMany(due.map(entry=>entry.identity));
    return this.run(async () => {
      if (this.closed) return;
      await this.expireDisconnected();
      for (const [index,entry] of due.entries()) {
        if (this.entries.get(entry.identity.actor.userId)!==entry || !active(entry) || entry.pair?.starting) continue;
        const check=checks[index]!;
        try {
          if (check.status==="rejected") throw check.reason;
          if (!check.value) await this.withdraw(entry,"Phiên đăng nhập đã hết hiệu lực");
          entry.checkedAt=this.now();
        } catch { reportFailure(); }
      }
      const pairs = new Set([...this.entries.values()].map(entry=>entry.pair).filter((pair):pair is Pair=>pair!==null));
      for (const pair of pairs) {
        if (this.now()<pair.deadline) continue;
        try {
          const recovering=!!pair.starting;
          if (!recovering) {
            if (!pair.countdown) { await this.breakPair(pair);continue; }
            if (!this.connected(pair.a) || !this.connected(pair.b)) { await this.breakPair(pair, !this.connected(pair.a) ? pair.a : pair.b);continue; }
            if (!(await this.port.authorize(pair.a.identity)) || !(await this.port.authorize(pair.b.identity))) { await this.breakPair(pair);continue; }
            if (pair.a.mode==="RANKED" && !(await this.port.canPair(pair.a.identity,pair.b.identity))) {await this.breakPair(pair,undefined,true);continue;}
            pair.starting=true;
          }
          const roomId=await this.port.start(pair.a.identity,pair.b.identity,pair.a.mode,pair.id,recovering);
          for (const entry of [pair.a,pair.b]) {entry.status="MATCHED";entry.roomId=roomId;entry.pair=null;}
        } catch (error) {
          if (error instanceof RoomError) { pair.starting=false; try { await this.breakPair(pair); } catch { reportFailure(); } }
          else reportFailure();
        }
      }
      await this.pairAndExpire();
      for (const [userId,entry] of this.entries) if (!active(entry) && !this.connected(entry) && this.now()>entry.deadline+120000) {this.entries.delete(userId);this.idle.delete(userId);}
      for (const [userId,since] of this.absentSince) if (this.now()-since>=240000 && ![...this.peers.values()].some(peer=>peer.actor.userId===userId)) {
        const entry=this.entries.get(userId);
        if (!entry || !active(entry)) {this.entries.delete(userId);this.idle.delete(userId);this.absentSince.delete(userId);}
      }
      for (const [userId,receipts] of this.receipts) {
        for (const [id,receipt] of receipts) if (this.now()-receipt.at>=86400000) { receipts.delete(id); this.receiptCount--; }
        if (!receipts.size) this.receipts.delete(userId);
      }
      for (const [userId,window] of this.commandWindows) if (this.now()>=window.until) this.commandWindows.delete(userId);
    });
  }
  close() { return this.run(async()=>{this.closed=true;for(const entry of this.entries.values()) if(active(entry) && !entry.pair?.starting) await this.withdraw(entry,restart);this.peers.clear();}); }
}
