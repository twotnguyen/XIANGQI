BEGIN;
SET LOCAL search_path=pg_catalog,public;
DO $$ BEGIN
 IF EXISTS (SELECT 1 FROM pg_catalog.pg_roles r WHERE r.rolname='postgres' AND r.rolconfig::text ILIKE '%idle_in_transaction_session_timeout%')
 THEN RAISE EXCEPTION 'idle_in_transaction_session_timeout is already configured on role postgres'; END IF;
END $$;
-- App connects as postgres and only SET LOCAL ROLE app_server, so ALTER ROLE app_server SET would never apply.
ALTER ROLE postgres SET idle_in_transaction_session_timeout='60s';
COMMIT;
