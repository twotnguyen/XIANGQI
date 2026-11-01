import { randomInt, randomUUID } from "node:crypto";
import type { Pool } from "pg";
import type { MatchmakingMode } from "@xiangqi/shared";
import type { MatchStore } from "../match/match-store.js";
import type { RoomSessionAuthorizer } from "../room/room-session.js";
import { RoomError, RoomRosterChanged, type RoomScope, type RoomActor } from "../room/room.types.js";
import type { RoomTransactions } from "../room/room-transactions.js";
import type { MatchmakingPort, QueueIdentity } from "./matchmaking-queue.js";

export class MatchmakingStore implements MatchmakingPort {
  constructor(private readonly pool: Pool, private readonly transactions: RoomTransactions, private readonly authorizer: RoomSessionAuthorizer, private readonly matches: MatchStore, private readonly withScope: <T>(scope: RoomScope, work: () => Promise<T>) => Promise<T>, private readonly pairLimitEnabled = true) {}
  private async run<T>(identity: QueueIdentity, work: (scope: RoomScope) => Promise<T>, other?: QueueIdentity, trusted = false) {
    const result = await this.transactions.withRoom({actor:identity.actor,roomIds:[]},async proof=>{
      if (other && !proof.lockedActorIds.has(other.actor.userId)) throw new RoomRosterChanged([other.actor.userId]);
      if (trusted) return {status:"active" as const,actor:proof.actor};
      const own = await this.authorizer.authorize(identity.proof,proof,"read");
      if (own.status === "ended") return own;
      if (other) {
        const peer = await this.authorizer.authorize(other.proof,{...proof,actor:other.actor},"read");
        if (peer.status === "ended") return peer;
      }
      return own;
    },work);
    if(result.status === "ended") throw new RoomError("AUTH_REQUIRED","Phiên đăng nhập không hợp lệ",401);
    return result.value;
  }
  async authorize(identity: QueueIdentity) {
    try {await this.run(identity,async()=>true);return true;} catch(error) {
      if (error instanceof RoomError && error.status===401) return false;
      if (error && typeof error==="object" && "status" in error && error.status===401) return false;
      throw error;
    }
  }
  async occupied(actor: RoomActor) {
    const result=await this.pool.query<{occupied:boolean}>(`SELECT EXISTS(SELECT 1 FROM public.active_players WHERE user_id=$1) OR EXISTS(SELECT 1 FROM public.room_members m JOIN public.rooms r ON r.id=m.room_id WHERE m.user_id=$1 AND r.closed_at IS NULL) AS occupied`,[actor.userId]);
    return result.rows[0]!.occupied;
  }
  reserve(identity: QueueIdentity) {
    return this.run(identity,async scope=>{
      const busy=await scope.client.query(`SELECT 1 FROM public.active_players WHERE user_id=$1 UNION ALL SELECT 1 FROM public.room_members m JOIN public.rooms r ON r.id=m.room_id WHERE m.user_id=$1 AND r.closed_at IS NULL LIMIT 1`,[identity.actor.userId]);
      if(busy.rowCount) throw new RoomError("ALREADY_SEATED","Bạn đang ở trong một ván/phòng khác");
      await scope.client.query("INSERT INTO public.active_players(user_id) VALUES($1)",[identity.actor.userId]);
      const rating=await scope.client.query<{elo:number}>("SELECT elo FROM xiangqi_room.ratings WHERE user_id=$1",[identity.actor.userId]);
      return rating.rows[0]?.elo ?? 1200;
    });
  }
  release(identity: QueueIdentity) {
    return this.run(identity,async scope=>{
      await scope.client.query("DELETE FROM public.active_players WHERE user_id=$1 AND room_id IS NULL AND match_id IS NULL AND ai_game_id IS NULL AND ai_boot_id IS NULL",[identity.actor.userId]);
    },undefined,true);
  }
  private async pairAllowed(scope: RoomScope, a: QueueIdentity, b: QueueIdentity, at: Date) {
    if (!this.pairLimitEnabled) return true;
    const result=await scope.client.query<{count:number}>(`SELECT count(*)::int AS count FROM public.matches m JOIN public.rooms r ON r.id=m.room_id WHERE r.kind='RANKED' AND ((m.red_user_id=$1 AND m.black_user_id=$2) OR (m.red_user_id=$2 AND m.black_user_id=$1)) AND m.created_at>$3::timestamptz-interval '24 hours' AND m.created_at<=$3`,[a.actor.userId,b.actor.userId,at]);
    return result.rows[0]!.count<3;
  }
  canPair(a: QueueIdentity,b: QueueIdentity) {
    return this.run(a,async scope=>{
      const at=(await scope.client.query<{at:Date}>("SELECT clock_timestamp() AS at")).rows[0]!.at;
      return this.pairAllowed(scope,a,b,at);
    },b);
  }
  async start(a: QueueIdentity,b: QueueIdentity,mode: MatchmakingMode,token:string,recovering = false) {
    if (recovering) {
      const existing=await this.run(a,async scope=>(await scope.client.query<{id:string;red_user_id:string;black_user_id:string}>("SELECT r.id,m.red_user_id,m.black_user_id FROM public.rooms r JOIN public.matches m ON m.id=r.current_match_id WHERE r.id=$1 AND r.kind=$2",[token,mode])).rows[0],b,true);
      if (existing) {
        if (![existing.red_user_id,existing.black_user_id].includes(a.actor.userId) || ![existing.red_user_id,existing.black_user_id].includes(b.actor.userId)) throw new RoomError("MATCHMAKING_FORBIDDEN","Không được tham gia ván này",403);
        return existing.id;
      }
    }
    return this.run(a,async scope=>{
      if(a.actor.userId===b.actor.userId || (mode==="RANKED" && (a.actor.kind!=="member" || b.actor.kind!=="member"))) throw new RoomError("MATCHMAKING_FORBIDDEN","Không được tham gia ván này",403);
      const existing=(await scope.client.query<{id:string;red_user_id:string;black_user_id:string}>("SELECT r.id,m.red_user_id,m.black_user_id FROM public.rooms r JOIN public.matches m ON m.id=r.current_match_id WHERE r.id=$1 AND r.kind=$2",[token,mode])).rows[0];
      if(existing) {
        if(![existing.red_user_id,existing.black_user_id].includes(a.actor.userId) || ![existing.red_user_id,existing.black_user_id].includes(b.actor.userId)) throw new RoomError("MATCHMAKING_FORBIDDEN","Không được tham gia ván này",403);
        return existing.id;
      }
      const ids=[a.actor.userId,b.actor.userId];
      const reservations=await scope.client.query("SELECT user_id FROM public.active_players WHERE user_id=ANY($1::uuid[]) AND room_id IS NULL AND match_id IS NULL AND ai_game_id IS NULL AND ai_boot_id IS NULL ORDER BY user_id FOR UPDATE",[ids]);
      if(reservations.rowCount!==2) throw new RoomError("ALREADY_SEATED","Vị trí chơi đã thay đổi");
      const at=(await scope.client.query<{at:Date}>("SELECT clock_timestamp() AS at")).rows[0]!.at;
      if(mode==="RANKED" && !(await this.pairAllowed(scope,a,b,at))) throw new RoomError("MATCHMAKING_PAIR_LIMIT","Đang tìm đối thủ khác");
      const red=randomInt(2)===0 ? a.actor.userId:b.actor.userId;
      const black=red===a.actor.userId ? b.actor.userId:a.actor.userId;
      const seconds=mode==="CASUAL" ? 900:600;
      // The offer UUID is also the durable room/start identity for retries after an ambiguous commit.
      await scope.client.query("INSERT INTO public.rooms(id,owner_id,name,visibility,time_control,viewer_limit,kind,room_version) VALUES($1,$2,$3,'LOCKED',$4,0,$5,1)",[token,a.actor.userId,mode==="CASUAL" ? "Đánh Thường":"Đánh Hạng",seconds,mode]);
      await scope.client.query("UPDATE public.active_players SET room_id=$2 WHERE user_id=ANY($1::uuid[])",[ids,token]);
      await scope.client.query("INSERT INTO public.room_members(room_id,user_id,role,side,ready,disconnected_at) VALUES($1,$2,'PLAYER','RED',true,$4),($1,$3,'PLAYER','BLACK',true,$4)",[token,red,black,at]);
      await scope.client.query("INSERT INTO xiangqi_room.countdowns(room_id,token,due_at,red_id,black_id) VALUES($1,$1,$2,$3,$4)",[token,at,red,black]);
      const started=await this.withScope({...scope,lockedRoomIds:new Set([...scope.lockedRoomIds,token])},()=>this.matches.start(scope.client,{roomId:token,startToken:token,redId:red,blackId:black,timeControlSeconds:seconds,startedAt:at}));
      await scope.client.query("UPDATE public.rooms SET status='PLAYING',current_match_id=$2 WHERE id=$1",[token,started.matchId]);
      await scope.client.query("UPDATE public.active_players SET match_id=$2 WHERE room_id=$1",[token,started.matchId]);
      await scope.client.query("DELETE FROM xiangqi_room.countdowns WHERE room_id=$1",[token]);
      await scope.client.query("INSERT INTO xiangqi_room.outbox(id,room_id,room_version,type,payload) VALUES($1,$2,1,'room.matched',$3)",[randomUUID(),token,{matchId:started.matchId}]);
      return token;
    },b);
  }
  async recoverQueueReservations() {
    const rows=await this.pool.query<{user_id:string;kind:RoomActor["kind"]}>("SELECT a.user_id,p.kind FROM public.active_players a JOIN xiangqi_auth.principals p ON p.id=a.user_id WHERE room_id IS NULL AND match_id IS NULL AND to_jsonb(a)->>'ai_game_id' IS NULL AND to_jsonb(a)->>'ai_boot_id' IS NULL");
    for(const row of rows.rows) await this.transactions.withRoom({actor:{userId:row.user_id,kind:row.kind},roomIds:[]},async proof=>({status:"active",actor:proof.actor}),async scope=>{
      await scope.client.query("DELETE FROM public.active_players a WHERE user_id=$1 AND room_id IS NULL AND match_id IS NULL AND to_jsonb(a)->>'ai_game_id' IS NULL AND to_jsonb(a)->>'ai_boot_id' IS NULL",[row.user_id]);
    });
  }
  async requireSchema() {
    const result=await this.pool.query<{ready:boolean}>(`SELECT
      EXISTS(SELECT 1 FROM pg_attribute WHERE attrelid='public.rooms'::regclass AND attname='kind' AND NOT attisdropped AND attnotnull)
      AND (SELECT bool_and(c.oid IS NOT NULL AND c.relrowsecurity AND c.relforcerowsecurity
        AND has_table_privilege('app_server',c.oid,'SELECT,INSERT,UPDATE')
        AND NOT has_table_privilege('anon',c.oid,'SELECT,INSERT,UPDATE,DELETE')
        AND NOT has_table_privilege('authenticated',c.oid,'SELECT,INSERT,UPDATE,DELETE'))
        FROM unnest(ARRAY['xiangqi_room.ratings','xiangqi_room.ranked_results']) t(name)
        LEFT JOIN pg_class c ON c.oid=to_regclass(t.name)) AS ready`);
    if(result.rows[0]?.ready!==true) throw new Error("YC9 migration is not ready");
  }
}
