BEGIN;
SET LOCAL search_path=pg_catalog,public;
DO $$ BEGIN
 IF NOT EXISTS (SELECT 1 FROM pg_catalog.pg_roles r WHERE r.rolname='postgres' AND r.rolconfig::text ILIKE '%idle_in_transaction_session_timeout=60s%')
 THEN RAISE EXCEPTION 'idle_in_transaction_session_timeout on role postgres changed after migration 20261019053133'; END IF;
END $$;
ALTER ROLE postgres RESET idle_in_transaction_session_timeout;
COMMIT;
