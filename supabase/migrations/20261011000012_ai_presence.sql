BEGIN;
SET LOCAL search_path=pg_catalog,public;
LOCK TABLE public.active_players,xiangqi_ai.boots IN ACCESS EXCLUSIVE MODE;
DO $$ DECLARE signature text; BEGIN
SELECT pg_catalog.md5(pg_catalog.string_agg(k||':'||v,E'\n' ORDER BY k)) INTO signature FROM (
 SELECT 'schema' AS k,concat(nspowner::pg_catalog.regrole,':',nspacl) AS v FROM pg_catalog.pg_namespace WHERE nspname='xiangqi_ai'
 UNION ALL SELECT 'relation:'||c.relname,concat(c.relowner::pg_catalog.regrole,':',c.relacl,':',c.relkind,':',c.relrowsecurity,':',c.relforcerowsecurity,':',c.reloptions,':',c.relpersistence) FROM pg_catalog.pg_class c JOIN pg_catalog.pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='xiangqi_ai'
 UNION ALL SELECT 'column:'||c.relname||':'||a.attname,concat(a.atttypid::pg_catalog.regtype,':',a.atttypmod,':',a.attnotnull,':',a.attacl,':',a.attidentity,':',a.attgenerated,':',pg_catalog.pg_get_expr(d.adbin,d.adrelid)) FROM pg_catalog.pg_attribute a JOIN pg_catalog.pg_class c ON c.oid=a.attrelid JOIN pg_catalog.pg_namespace n ON n.oid=c.relnamespace LEFT JOIN pg_catalog.pg_attrdef d ON d.adrelid=a.attrelid AND d.adnum=a.attnum WHERE a.attnum>0 AND NOT a.attisdropped AND (n.nspname='xiangqi_ai' OR (a.attrelid='public.active_players'::pg_catalog.regclass AND a.attname IN('ai_game_id','ai_boot_id')))
 UNION ALL SELECT 'constraint:'||c.relname||':'||x.conname,concat(x.convalidated,':',pg_catalog.pg_get_constraintdef(x.oid)) FROM pg_catalog.pg_constraint x JOIN pg_catalog.pg_class c ON c.oid=x.conrelid JOIN pg_catalog.pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='xiangqi_ai' OR (x.conrelid='public.active_players'::pg_catalog.regclass AND x.conkey && ARRAY(SELECT attnum FROM pg_catalog.pg_attribute WHERE attrelid='public.active_players'::pg_catalog.regclass AND attname IN('ai_game_id','ai_boot_id') AND NOT attisdropped))
 UNION ALL SELECT 'index:'||c.relname,concat(i.indisvalid,':',i.indisready,':',i.indislive,':',pg_catalog.pg_get_indexdef(i.indexrelid)) FROM pg_catalog.pg_index i JOIN pg_catalog.pg_class c ON c.oid=i.indexrelid JOIN pg_catalog.pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='xiangqi_ai' OR (i.indrelid='public.active_players'::pg_catalog.regclass AND i.indkey::smallint[] && ARRAY(SELECT attnum FROM pg_catalog.pg_attribute WHERE attrelid='public.active_players'::pg_catalog.regclass AND attname IN('ai_game_id','ai_boot_id') AND NOT attisdropped))
 UNION ALL SELECT 'policy:'||c.relname||':'||p.polname,concat(p.polcmd,':',p.polpermissive,':',ARRAY(SELECT x::pg_catalog.regrole::text FROM pg_catalog.unnest(p.polroles) AS x ORDER BY x::pg_catalog.regrole::text),':',pg_catalog.pg_get_expr(p.polqual,p.polrelid),':',pg_catalog.pg_get_expr(p.polwithcheck,p.polrelid)) FROM pg_catalog.pg_policy p JOIN pg_catalog.pg_class c ON c.oid=p.polrelid JOIN pg_catalog.pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='xiangqi_ai'
 UNION ALL SELECT 'function:'||p.proname,concat(p.proowner::pg_catalog.regrole,':',p.proacl,':',pg_catalog.pg_get_functiondef(p.oid)) FROM pg_catalog.pg_proc p JOIN pg_catalog.pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname='xiangqi_ai'
 UNION ALL SELECT 'trigger:'||c.relname||':'||t.tgname,concat(t.tgenabled,':',pg_catalog.pg_get_triggerdef(t.oid)) FROM pg_catalog.pg_trigger t JOIN pg_catalog.pg_class c ON c.oid=t.tgrelid JOIN pg_catalog.pg_namespace n ON n.oid=c.relnamespace WHERE NOT t.tgisinternal AND n.nspname='xiangqi_ai'
 UNION ALL SELECT 'type:'||t.typname,concat(t.typowner::pg_catalog.regrole,':',t.typtype,':',t.typacl,':',t.typbasetype::pg_catalog.regtype,':',t.typrelid::pg_catalog.regclass,':',t.typelem::pg_catalog.regtype,':',t.typtypmod,':',t.typnotnull,':',t.typdefault) FROM pg_catalog.pg_type t JOIN pg_catalog.pg_namespace n ON n.oid=t.typnamespace WHERE n.nspname='xiangqi_ai'
 UNION ALL SELECT 'defaultACL:'||d.defaclobjtype::text,concat(d.defaclrole::pg_catalog.regrole,':',d.defaclacl) FROM pg_catalog.pg_default_acl d JOIN pg_catalog.pg_namespace n ON n.oid=d.defaclnamespace WHERE n.nspname='xiangqi_ai'
) metadata;
 IF signature IS DISTINCT FROM '53eeb20b6e508e7349902f7890ab322e' THEN RAISE EXCEPTION 'AI presence baseline differs'; END IF;
END $$;
CREATE TABLE xiangqi_ai.tabs(
 owner_id uuid NOT NULL REFERENCES xiangqi_auth.principals(id) ON DELETE CASCADE,
 boot_id uuid NOT NULL REFERENCES xiangqi_ai.boots(id) ON DELETE RESTRICT,
 tab_id uuid NOT NULL,
 first_seen_at timestamptz NOT NULL DEFAULT clock_timestamp(),
 PRIMARY KEY(owner_id,boot_id,tab_id)
);
CREATE TABLE xiangqi_ai.controllers(
 owner_id uuid NOT NULL,
 boot_id uuid NOT NULL,
 tab_id uuid NOT NULL,
 connection_id text NOT NULL CHECK(connection_id ~ '^[A-Za-z0-9_-]{1,64}$'),
 generation bigint NOT NULL CHECK(generation>0 AND generation<=9007199254740991),
 connected boolean NOT NULL,
 PRIMARY KEY(owner_id,boot_id),
 FOREIGN KEY(owner_id,boot_id,tab_id) REFERENCES xiangqi_ai.tabs(owner_id,boot_id,tab_id) ON DELETE CASCADE
);
CREATE TABLE xiangqi_ai.presence(
 owner_id uuid NOT NULL,
 boot_id uuid NOT NULL,
 game_id uuid NOT NULL UNIQUE,
 tab_id uuid NOT NULL,
 connection_id text NOT NULL CHECK(connection_id ~ '^[A-Za-z0-9_-]{1,64}$'),
 generation bigint NOT NULL CHECK(generation>0 AND generation<=9007199254740991),
 connected boolean NOT NULL,
 disconnected_at timestamptz,
 PRIMARY KEY(owner_id,boot_id),
 FOREIGN KEY(owner_id,boot_id,tab_id) REFERENCES xiangqi_ai.tabs(owner_id,boot_id,tab_id) ON DELETE CASCADE,
 CHECK((connected AND disconnected_at IS NULL) OR (NOT connected AND disconnected_at IS NOT NULL))
);
CREATE INDEX ai_presence_expiry ON xiangqi_ai.presence(disconnected_at,game_id) WHERE NOT connected;
ALTER TABLE xiangqi_ai.tabs OWNER TO postgres;
ALTER TABLE xiangqi_ai.controllers OWNER TO postgres;
ALTER TABLE xiangqi_ai.presence OWNER TO postgres;
ALTER TABLE xiangqi_ai.tabs ENABLE ROW LEVEL SECURITY;
ALTER TABLE xiangqi_ai.tabs FORCE ROW LEVEL SECURITY;
ALTER TABLE xiangqi_ai.controllers ENABLE ROW LEVEL SECURITY;
ALTER TABLE xiangqi_ai.controllers FORCE ROW LEVEL SECURITY;
ALTER TABLE xiangqi_ai.presence ENABLE ROW LEVEL SECURITY;
ALTER TABLE xiangqi_ai.presence FORCE ROW LEVEL SECURITY;
REVOKE ALL ON xiangqi_ai.tabs,xiangqi_ai.controllers,xiangqi_ai.presence FROM PUBLIC,anon,authenticated,service_role;
GRANT SELECT,INSERT ON xiangqi_ai.tabs,xiangqi_ai.controllers,xiangqi_ai.presence TO app_server;
GRANT UPDATE(tab_id,connection_id,generation,connected) ON xiangqi_ai.controllers TO app_server;
GRANT UPDATE(game_id,tab_id,connection_id,generation,connected,disconnected_at) ON xiangqi_ai.presence TO app_server;
CREATE POLICY ai_tabs_server ON xiangqi_ai.tabs TO app_server USING(true) WITH CHECK(true);
CREATE POLICY ai_controllers_server ON xiangqi_ai.controllers TO app_server USING(true) WITH CHECK(true);
CREATE POLICY ai_presence_server ON xiangqi_ai.presence TO app_server USING(true) WITH CHECK(true);
COMMIT;
