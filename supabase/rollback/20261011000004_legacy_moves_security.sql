-- Restore the audited prior ACL/FORCE state without deleting rows or changing service grants.
-- This reintroduces legacy browser privileges; use only as an explicitly reviewed rollback.
BEGIN;
SET LOCAL search_path = pg_catalog, public;
LOCK TABLE public.moves IN ACCESS EXCLUSIVE MODE;
DO $$
DECLARE actual_acl text[];
BEGIN
  SELECT pg_catalog.array_agg(a::text ORDER BY a::text) INTO actual_acl
  FROM pg_catalog.pg_class c, LATERAL pg_catalog.unnest(c.relacl) a WHERE c.oid='public.moves'::pg_catalog.regclass;
  IF actual_acl IS DISTINCT FROM ARRAY[
    'app_server=arwdDxtm/postgres','postgres=arwdDxtm/postgres','service_role=arwdDxtm/postgres'
  ] OR NOT EXISTS(SELECT 1 FROM pg_catalog.pg_class WHERE oid='public.moves'::pg_catalog.regclass AND relowner='postgres'::pg_catalog.regrole AND relrowsecurity AND relforcerowsecurity)
    OR EXISTS(SELECT 1 FROM pg_catalog.pg_attribute WHERE attrelid='public.moves'::pg_catalog.regclass AND attnum>0 AND NOT attisdropped AND attacl IS NOT NULL)
    OR EXISTS(SELECT 1 FROM pg_catalog.pg_policy WHERE polrelid='public.moves'::pg_catalog.regclass) THEN
    RAISE EXCEPTION 'Legacy moves changed after hardening; rollback requires review';
  END IF;
END $$;
GRANT ALL ON public.moves TO anon,authenticated;
ALTER TABLE public.moves NO FORCE ROW LEVEL SECURITY;
COMMIT;
