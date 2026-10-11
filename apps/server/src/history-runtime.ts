import type { createRegistrationRuntime } from "./auth-runtime.js";
import { RoomTransactions } from "./room/room-transactions.js";
import { PostgresMemberRoomAuthorizer } from "./room/member-room-auth.js";
import { HistoryStore } from "./history/history-store.js";
import { HistoryHttpService } from "./history/history-http.service.js";
import { HistoryModule } from "./history/history.module.js";
/** Borrows registration's pool and sessions. No owned connection pool, timers or close hook. */
export async function createHistoryRuntime(
  env: Record<string, string | undefined>,
  registration: NonNullable<
    Awaited<ReturnType<typeof createRegistrationRuntime>>
  > | null,
) {
  const enabled = env.HISTORY_ENABLED ?? "false";
  if (enabled === "false") return null;
  if (
    enabled !== "true" ||
    env.AUTH_LOGIN_ENABLED !== "true" ||
    !registration?.sessions ||
    !registration.pool
  )
    throw new Error("Invalid History configuration");
  const pool = registration.pool;
  try {
    const schema = await pool.query<{ ready: boolean }>(`
      WITH required(name,kind) AS (VALUES
        ('public.matches','r'),('public.match_events','r'),('public.profiles','r'),
        ('public.rooms','r'),('public.room_members','r'),('public.active_players','r'),
        ('xiangqi_auth.principals','r'),('xiangqi_auth.app_sessions','r'),
        ('xiangqi_auth.guest_sessions','r'),('xiangqi_auth.accounts','v'))
      SELECT pg_catalog.pg_has_role(current_user,'app_server','SET')
        AND EXISTS(SELECT 1 FROM pg_catalog.pg_roles WHERE rolname='app_server' AND NOT rolsuper AND NOT rolbypassrls)
        AND pg_catalog.has_schema_privilege('app_server','public','USAGE')
        AND pg_catalog.has_schema_privilege('app_server','xiangqi_auth','USAGE')
        AND NOT pg_catalog.has_table_privilege('app_server','auth.users','SELECT')
        AND (SELECT bool_and(COALESCE(c.oid IS NOT NULL AND c.relkind::text=t.kind
          AND c.relowner=(SELECT oid FROM pg_catalog.pg_roles WHERE rolname='postgres')
          AND pg_catalog.has_table_privilege('app_server',c.oid,'SELECT')
          AND NOT pg_catalog.has_table_privilege('anon',c.oid,'SELECT')
          AND NOT pg_catalog.has_table_privilege('authenticated',c.oid,'SELECT')
          AND (t.kind='v' OR (c.relrowsecurity AND c.relforcerowsecurity
            AND EXISTS(SELECT 1 FROM pg_catalog.pg_policy p WHERE p.polrelid=c.oid AND p.polpermissive
              AND p.polcmd IN('*','r') AND (SELECT oid FROM pg_catalog.pg_roles WHERE rolname='app_server')=ANY(p.polroles)
              AND pg_catalog.pg_get_expr(p.polqual,p.polrelid)='true'))),false))
          FROM required t LEFT JOIN pg_catalog.pg_class c ON c.oid=pg_catalog.to_regclass(t.name))
        AND pg_catalog.has_table_privilege('app_server','public.rooms','UPDATE')
        AND pg_catalog.has_table_privilege('app_server','public.profiles','UPDATE')
        AND pg_catalog.has_column_privilege('app_server','xiangqi_auth.app_sessions','revoked_at','UPDATE')
        AND EXISTS(SELECT 1 FROM pg_catalog.pg_class WHERE oid=pg_catalog.to_regclass('xiangqi_auth.accounts') AND reloptions @> ARRAY['security_barrier=true'])
        AS ready`);
    if (schema.rows[0]?.ready !== true) throw new Error();
    // Audited baseline + migration 7. Future mode/outcome changes (including Ranked)
    // must deliberately update this guard alongside their schema acceptance tests.
    const structure = await pool.query<{ ready: boolean }>(`
      WITH required(relation,column_name,column_type) AS (VALUES
        ('public.matches','id','uuid'),('public.matches','room_id','uuid'),
        ('public.matches','mode','text'),('public.matches','status','text'),
        ('public.matches','red_user_id','uuid'),('public.matches','black_user_id','uuid'),
        ('public.matches','ai_side','text'),('public.matches','ai_level','text'),
        ('public.matches','rule_set_version','text'),('public.matches','outcome','jsonb'),
        ('public.matches','created_at','timestamptz'),('public.matches','ended_at','timestamptz'),
        ('public.match_events','match_id','uuid'),('public.match_events','version','int8'),
        ('public.match_events','type','text'),('public.match_events','payload','jsonb'),
        ('public.profiles','user_id','uuid'),('public.profiles','display_name','text'),
        ('public.profiles','completed_at','timestamptz'),('public.profiles','registration_pending','bool'),
        ('public.rooms','id','uuid'),('public.rooms','owner_id','uuid'),('public.rooms','closed_at','timestamptz'),
        ('public.rooms','current_match_id','uuid'),('public.room_members','room_id','uuid'),('public.room_members','user_id','uuid'),
        ('public.active_players','user_id','uuid'),('public.active_players','room_id','uuid'),('public.active_players','match_id','uuid'),
        ('xiangqi_auth.principals','id','uuid'),('xiangqi_auth.principals','kind','text'),('xiangqi_auth.principals','auth_user_id','uuid'),
        ('xiangqi_auth.app_sessions','token_hash','text'),('xiangqi_auth.app_sessions','user_id','uuid'),
        ('xiangqi_auth.app_sessions','expires_at','timestamptz'),('xiangqi_auth.app_sessions','revoked_at','timestamptz'),
        ('xiangqi_auth.guest_sessions','guest_id','uuid'),('xiangqi_auth.guest_sessions','expires_at','timestamptz'),('xiangqi_auth.guest_sessions','ended_at','timestamptz'),
        ('xiangqi_auth.accounts','id','uuid'),('xiangqi_auth.accounts','email','text'),('xiangqi_auth.accounts','email_confirmed_at','timestamptz'))
      SELECT (SELECT bool_and(EXISTS(SELECT 1 FROM pg_catalog.pg_attribute a
        WHERE a.attrelid=pg_catalog.to_regclass(t.relation) AND a.attname=t.column_name
          AND a.atttypid=pg_catalog.to_regtype(t.column_type) AND NOT a.attisdropped)) FROM required t)
        AND EXISTS(SELECT 1 FROM pg_catalog.pg_constraint WHERE conrelid='public.matches'::pg_catalog.regclass
          AND conname='matches_mode_invariants' AND contype='c' AND convalidated
          AND pg_catalog.md5(pg_catalog.pg_get_constraintdef(oid))='9ed29788a7d07ed31ce99d03f2fc81a4')
        AND EXISTS(SELECT 1 FROM pg_catalog.pg_constraint WHERE conrelid='public.matches'::pg_catalog.regclass
          AND conname='matches_status_and_outcome_invariants' AND contype='c' AND convalidated
          AND pg_catalog.md5(pg_catalog.pg_get_constraintdef(oid))='b065e4eab6b66eb703d4e215ab8d2c29')
        AND EXISTS(SELECT 1 FROM pg_catalog.pg_constraint WHERE conrelid='public.match_events'::pg_catalog.regclass
          AND contype='u' AND convalidated AND pg_catalog.pg_get_constraintdef(oid)='UNIQUE (match_id, version)')
        AND EXISTS(SELECT 1 FROM pg_catalog.pg_index WHERE indexrelid=pg_catalog.to_regclass('public.match_start_token_unique')
          AND indrelid='public.match_events'::pg_catalog.regclass AND indisunique AND indisvalid
          AND pg_catalog.pg_get_expr(indexprs,indrelid)=$expr$(payload ->> 'startToken'::text)$expr$
          AND pg_catalog.pg_get_expr(indpred,indrelid)=$pred$((type = 'START'::text) AND ((payload ->> 'encoding'::text) = 'xiangqi-core-v1'::text))$pred$)
        AND EXISTS(SELECT 1 FROM pg_catalog.pg_constraint WHERE conrelid='xiangqi_auth.guest_sessions'::pg_catalog.regclass
          AND contype='u' AND pg_catalog.pg_get_constraintdef(oid)='UNIQUE (guest_id)')
        AS ready`);
    if (structure.rows[0]?.ready !== true) throw new Error();
  } catch {
    throw new Error("History migration is not ready");
  }
  const service = new HistoryHttpService(
    new HistoryStore(),
    new RoomTransactions(pool),
    new PostgresMemberRoomAuthorizer(registration.sessions),
  );
  return { module: HistoryModule.forRoot(service), service };
}
