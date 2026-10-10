BEGIN;
DO $$ BEGIN
  IF EXISTS(SELECT 1 FROM xiangqi_realtime.tabs) OR EXISTS(SELECT 1 FROM xiangqi_realtime.receipts) THEN
    RAISE EXCEPTION 'Rollback requires backup review after realtime writes';
  END IF;
END $$;
DROP SCHEMA xiangqi_realtime CASCADE;
COMMIT;
