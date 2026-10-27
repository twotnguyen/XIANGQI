BEGIN;
SET LOCAL search_path=pg_catalog,public;
DO $$ BEGIN
 IF NOT (pg_catalog.has_table_privilege('app_server','xiangqi_realtime.receipts','SELECT') AND pg_catalog.has_table_privilege('app_server','xiangqi_realtime.receipts','INSERT') AND pg_catalog.has_table_privilege('app_server','xiangqi_realtime.receipts','DELETE')) OR pg_catalog.has_table_privilege('app_server','xiangqi_realtime.receipts','UPDATE')
 THEN RAISE EXCEPTION 'Realtime receipt grants differ from audited baseline'; END IF;
END $$;
-- Guest privacy scrub rewrites only the guest's display name inside other receipts' snapshot JSON.
GRANT UPDATE (response) ON xiangqi_realtime.receipts TO app_server;
COMMIT;
