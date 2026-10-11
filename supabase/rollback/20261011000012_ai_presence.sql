BEGIN;
SET LOCAL search_path=pg_catalog,public;
LOCK TABLE public.active_players,xiangqi_ai.boots,xiangqi_ai.tabs,xiangqi_ai.controllers,xiangqi_ai.presence IN ACCESS EXCLUSIVE MODE;
DO $$ DECLARE signature text; BEGIN
 IF EXISTS(SELECT 1 FROM xiangqi_ai.tabs) OR EXISTS(SELECT 1 FROM xiangqi_ai.controllers) OR EXISTS(SELECT 1 FROM xiangqi_ai.presence) THEN RAISE EXCEPTION 'AI presence writes exist; rollback refused'; END IF;
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
 IF signature IS DISTINCT FROM '53d7def4be3feef58f7b85b7a3dcebcd'
 OR EXISTS(SELECT 1 FROM pg_catalog.pg_constraint WHERE confrelid IN('xiangqi_ai.tabs'::pg_catalog.regclass,'xiangqi_ai.controllers'::pg_catalog.regclass,'xiangqi_ai.presence'::pg_catalog.regclass) AND conrelid NOT IN('xiangqi_ai.controllers'::pg_catalog.regclass,'xiangqi_ai.presence'::pg_catalog.regclass))
 OR EXISTS(SELECT 1 FROM pg_catalog.pg_depend WHERE refobjid IN('xiangqi_ai.tabs'::pg_catalog.regclass,'xiangqi_ai.controllers'::pg_catalog.regclass,'xiangqi_ai.presence'::pg_catalog.regclass) AND classid IN('pg_catalog.pg_rewrite'::pg_catalog.regclass,'pg_catalog.pg_proc'::pg_catalog.regclass) AND deptype='n')
 THEN RAISE EXCEPTION 'AI presence metadata changed; rollback refused'; END IF;
END $$;
DROP TABLE xiangqi_ai.presence;
DROP TABLE xiangqi_ai.controllers;
DROP TABLE xiangqi_ai.tabs;
COMMIT;
