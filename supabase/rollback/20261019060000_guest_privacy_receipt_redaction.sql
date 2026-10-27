BEGIN;
SET LOCAL search_path=pg_catalog,public;
DO $$ BEGIN
 IF NOT pg_catalog.has_column_privilege('app_server','xiangqi_realtime.receipts','response','UPDATE') OR pg_catalog.has_table_privilege('app_server','xiangqi_realtime.receipts','UPDATE')
 THEN RAISE EXCEPTION 'UPDATE(response) on xiangqi_realtime.receipts changed after migration 20261019060000'; END IF;
END $$;
REVOKE UPDATE (response) ON xiangqi_realtime.receipts FROM app_server;
COMMIT;
