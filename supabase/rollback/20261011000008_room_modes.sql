BEGIN;
SET LOCAL search_path=pg_catalog,public;
LOCK TABLE public.rooms,xiangqi_room.outbox IN ACCESS EXCLUSIVE MODE;
DO $$ DECLARE opened_column smallint; opened_index oid; BEGIN
 SELECT attnum INTO opened_column FROM pg_catalog.pg_attribute WHERE attrelid='public.rooms'::pg_catalog.regclass AND attname='public_opened_at' AND NOT attisdropped;
 SELECT c.oid INTO opened_index FROM pg_catalog.pg_class c JOIN pg_catalog.pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public' AND c.relname='rooms_public_opened' AND c.relkind='i';
 IF (SELECT pg_catalog.md5(pg_catalog.pg_get_functiondef(p.oid))='b956049a5550eb7dae1cd40ada851ffc'
   AND p.proowner='postgres'::pg_catalog.regrole AND NOT p.prosecdef
   AND p.proconfig=ARRAY['search_path=""'] AND p.proacl::text='{postgres=X/postgres}'
   FROM pg_catalog.pg_proc p WHERE p.oid='xiangqi_room.guard_settings()'::pg_catalog.regprocedure) IS DISTINCT FROM true
 OR opened_column IS NULL OR opened_index IS NULL
 OR (SELECT a.atttypid='pg_catalog.timestamptz'::pg_catalog.regtype AND a.atttypmod=-1
   AND NOT a.attnotnull AND NOT a.atthasdef AND a.attgenerated='' AND a.attidentity=''
   AND a.attacl IS NULL AND a.attoptions IS NULL AND a.attcollation=0
   AND a.attstorage='p' AND a.attcompression='' AND a.attstattarget IS NULL
   AND pg_catalog.col_description(a.attrelid,a.attnum) IS NULL
   FROM pg_catalog.pg_attribute a WHERE a.attrelid='public.rooms'::pg_catalog.regclass AND a.attnum=opened_column) IS DISTINCT FROM true
 OR (SELECT c.relowner='postgres'::pg_catalog.regrole AND c.relacl IS NULL AND c.reloptions IS NULL
   AND pg_catalog.obj_description(c.oid,'pg_class') IS NULL
   AND i.indrelid='public.rooms'::pg_catalog.regclass AND i.indisvalid AND i.indisready AND i.indislive
   AND NOT i.indisunique AND NOT i.indisprimary AND NOT i.indisclustered AND NOT i.indisreplident
   AND pg_catalog.pg_get_indexdef(c.oid)='CREATE INDEX rooms_public_opened ON public.rooms USING btree (public_opened_at DESC, id DESC) WHERE ((visibility = ''PUBLIC''::text) AND (closed_at IS NULL) AND (invite_code IS NOT NULL))'
   FROM pg_catalog.pg_class c JOIN pg_catalog.pg_index i ON i.indexrelid=c.oid WHERE c.oid=opened_index) IS DISTINCT FROM true
 OR EXISTS(SELECT 1 FROM pg_catalog.pg_depend d
   WHERE d.refclassid='pg_catalog.pg_class'::pg_catalog.regclass AND d.refobjid='public.rooms'::pg_catalog.regclass AND d.refobjsubid=opened_column
   AND NOT(d.classid='pg_catalog.pg_class'::pg_catalog.regclass AND d.objid=opened_index))
 THEN RAISE EXCEPTION 'Room mode metadata changed; rollback refused'; END IF;
 IF EXISTS(SELECT 1 FROM public.rooms WHERE public_opened_at IS NOT NULL)
 OR EXISTS(SELECT 1 FROM xiangqi_room.outbox WHERE type='room.visibility-changed')
 THEN RAISE EXCEPTION 'Room mode feature writes exist; rollback refused'; END IF;
END $$;
-- Restore the exact audited guard from 000006; preserve its owner, ACL and identity.
CREATE OR REPLACE FUNCTION xiangqi_room.guard_settings() RETURNS trigger LANGUAGE plpgsql SET search_path='' AS $$ BEGIN
 IF TG_OP='UPDATE' AND OLD.invite_code IS NOT NULL AND (NEW.invite_code IS DISTINCT FROM OLD.invite_code OR NEW.viewer_limit IS DISTINCT FROM OLD.viewer_limit OR NEW.time_control IS DISTINCT FROM OLD.time_control) THEN RAISE EXCEPTION 'Room configuration is immutable'; END IF;
 IF NEW.invite_code IS NOT NULL AND (NEW.viewer_limit IS NULL OR NEW.time_control NOT IN(300,600,900)) THEN RAISE EXCEPTION 'Invalid managed room configuration'; END IF;RETURN NEW;
END $$;
DROP INDEX public.rooms_public_opened;
ALTER TABLE public.rooms DROP COLUMN public_opened_at;
COMMIT;
