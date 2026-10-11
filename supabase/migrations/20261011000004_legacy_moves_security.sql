-- Harden the exact audited legacy moves ACL. Unknown variants require review, not blind grant changes.
BEGIN;
SET LOCAL search_path = pg_catalog, public;
LOCK TABLE public.moves IN ACCESS EXCLUSIVE MODE;
DO $$
DECLARE actual_acl text[];
BEGIN
  SELECT pg_catalog.array_agg(a::text ORDER BY a::text) INTO actual_acl
  FROM pg_catalog.pg_class c, LATERAL pg_catalog.unnest(c.relacl) a WHERE c.oid='public.moves'::pg_catalog.regclass;
  IF actual_acl IS DISTINCT FROM ARRAY[
    'anon=arwdDxtm/postgres','app_server=arwdDxtm/postgres',
    'authenticated=arwdDxtm/postgres','postgres=arwdDxtm/postgres',
    'service_role=arwdDxtm/postgres'
  ] OR NOT EXISTS(SELECT 1 FROM pg_catalog.pg_class WHERE oid='public.moves'::pg_catalog.regclass AND relowner='postgres'::pg_catalog.regrole AND relrowsecurity AND NOT relforcerowsecurity)
    OR EXISTS(SELECT 1 FROM pg_catalog.pg_attribute WHERE attrelid='public.moves'::pg_catalog.regclass AND attnum>0 AND NOT attisdropped AND attacl IS NOT NULL)
    OR EXISTS(SELECT 1 FROM pg_catalog.pg_policy WHERE polrelid='public.moves'::pg_catalog.regclass) THEN
    RAISE EXCEPTION 'Legacy moves metadata differs from audited baseline; review required';
  END IF;
END $$;
REVOKE ALL ON public.moves FROM PUBLIC,anon,authenticated;
ALTER TABLE public.moves FORCE ROW LEVEL SECURITY;
COMMIT;
