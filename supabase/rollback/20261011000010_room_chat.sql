BEGIN;
SET LOCAL search_path=pg_catalog,public;
LOCK TABLE public.rooms,public.room_members,xiangqi_chat.rooms,xiangqi_chat.entries,xiangqi_chat.messages,xiangqi_chat.receipts,xiangqi_chat.rate,xiangqi_chat.outbox IN ACCESS EXCLUSIVE MODE;
DO $$ DECLARE signature text;BEGIN
 IF EXISTS(SELECT 1 FROM xiangqi_chat.rooms WHERE sequence<>0) OR EXISTS(SELECT 1 FROM xiangqi_chat.messages) OR EXISTS(SELECT 1 FROM xiangqi_chat.receipts) OR EXISTS(SELECT 1 FROM xiangqi_chat.rate) OR EXISTS(SELECT 1 FROM xiangqi_chat.outbox) THEN RAISE EXCEPTION 'Chat feature writes exist; rollback refused'; END IF;
 SELECT pg_catalog.md5(pg_catalog.string_agg(k||':'||v,E'\n' ORDER BY k)) INTO signature FROM (
 SELECT 'schema' AS k,concat(nspowner::pg_catalog.regrole,':',nspacl) AS v FROM pg_catalog.pg_namespace WHERE nspname='xiangqi_chat'
 UNION ALL SELECT 'relation:'||c.relname,concat(c.relowner::pg_catalog.regrole,':',c.relacl,':',c.relkind,':',c.relrowsecurity,':',c.relforcerowsecurity,':',c.reloptions,':',c.relpersistence) FROM pg_catalog.pg_class c JOIN pg_catalog.pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='xiangqi_chat'
 UNION ALL SELECT 'column:'||c.relname||':'||a.attname,concat(a.attnum,':',a.atttypid::pg_catalog.regtype,':',a.atttypmod,':',a.attnotnull,':',a.attacl,':',a.attidentity,':',a.attgenerated,':',pg_catalog.pg_get_expr(d.adbin,d.adrelid)) FROM pg_catalog.pg_attribute a JOIN pg_catalog.pg_class c ON c.oid=a.attrelid JOIN pg_catalog.pg_namespace n ON n.oid=c.relnamespace LEFT JOIN pg_catalog.pg_attrdef d ON d.adrelid=a.attrelid AND d.adnum=a.attnum WHERE n.nspname='xiangqi_chat' AND c.relkind='r' AND a.attnum>0 AND NOT a.attisdropped
 UNION ALL SELECT 'constraint:'||c.relname||':'||x.conname,concat(x.convalidated,':',pg_catalog.pg_get_constraintdef(x.oid)) FROM pg_catalog.pg_constraint x JOIN pg_catalog.pg_class c ON c.oid=x.conrelid JOIN pg_catalog.pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='xiangqi_chat'
 UNION ALL SELECT 'index:'||c.relname,concat(i.indisvalid,':',i.indisready,':',i.indislive,':',pg_catalog.pg_get_indexdef(i.indexrelid)) FROM pg_catalog.pg_index i JOIN pg_catalog.pg_class c ON c.oid=i.indexrelid JOIN pg_catalog.pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='xiangqi_chat'
 UNION ALL SELECT 'policy:'||c.relname||':'||p.polname,concat(p.polcmd,':',p.polpermissive,':',ARRAY(SELECT x::pg_catalog.regrole::text FROM pg_catalog.unnest(p.polroles) AS x ORDER BY x::pg_catalog.regrole::text),':',pg_catalog.pg_get_expr(p.polqual,p.polrelid),':',pg_catalog.pg_get_expr(p.polwithcheck,p.polrelid)) FROM pg_catalog.pg_policy p JOIN pg_catalog.pg_class c ON c.oid=p.polrelid JOIN pg_catalog.pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='xiangqi_chat'
 UNION ALL SELECT 'function:'||p.proname,concat(p.proowner::pg_catalog.regrole,':',p.proacl,':',pg_catalog.pg_get_functiondef(p.oid)) FROM pg_catalog.pg_proc p JOIN pg_catalog.pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname='xiangqi_chat'
 UNION ALL SELECT 'trigger:'||c.relname||':'||t.tgname,concat(t.tgenabled,':',pg_catalog.pg_get_triggerdef(t.oid)) FROM pg_catalog.pg_trigger t JOIN pg_catalog.pg_class c ON c.oid=t.tgrelid JOIN pg_catalog.pg_proc p ON p.oid=t.tgfoid JOIN pg_catalog.pg_namespace n ON n.oid=p.pronamespace WHERE NOT t.tgisinternal AND n.nspname='xiangqi_chat'
 ) metadata;
 IF signature IS DISTINCT FROM '81802fd2b34df89fd8472301d607f6bb' THEN RAISE EXCEPTION 'Chat metadata changed; rollback refused'; END IF;
END $$;
DROP TRIGGER chat_membership ON public.room_members;
DROP TRIGGER chat_room_closed ON public.rooms;
DROP FUNCTION xiangqi_chat.sync_membership(),xiangqi_chat.close_room();
DROP TABLE xiangqi_chat.outbox,xiangqi_chat.receipts,xiangqi_chat.messages,xiangqi_chat.entries,xiangqi_chat.rooms,xiangqi_chat.rate;
DROP SCHEMA xiangqi_chat;
COMMIT;
